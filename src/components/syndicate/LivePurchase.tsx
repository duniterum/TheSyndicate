import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useAccount,
  useChainId,
  useConnect,
  useDisconnect,
  useReconnect,
  useSwitchChain,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { parseUnits } from "viem";
import {
  ACCESS_RATE_LABEL,
  CONTRACTS,
  PURCHASE_PRESETS_USDC,
  SALE_MIN_USDC,
  USDC_DECIMALS,
  SYN_DECIMALS,
  AVALANCHE_CHAIN_ID,
  rankForUsdc,
  vaultFlow,
  explorerUrlFor,
  explorerUrlForAddress,
  txExplorerUrl,
  LEGAL_DISCLAIMER,
  extrasForAddress,
} from "@/lib/syndicate-config";
import { ContractLink, ProofButton } from "./Primitives";
import { SALE_ABI, ERC20_ABI } from "@/lib/sale-abi";
import {
  useSaleStats,
  useUserBalances,
  fmtUsdc,
  fmtSyn,
  fmtAddress,
} from "@/lib/sale-hooks";
import { track } from "@/lib/analytics";
import { assertFreshWallet, walletFreshnessMessage } from "@/lib/wallet-freshness";
import { recordTx } from "@/lib/tx-history";
import { useMintHashPersistence } from "@/lib/mint-persistence";
import { classifyTxError } from "@/lib/tx-errors";

const SALE = CONTRACTS.MEMBERSHIP_SALE_CONTRACT_ADDRESS as `0x${string}`;
const USDC = CONTRACTS.USDC_CONTRACT_ADDRESS as `0x${string}`;
const fmtUsd = (n: number) =>
  n < 100 ? `$${n.toFixed(2).replace(/\.00$/, "")}` : `$${Math.round(n).toLocaleString("en-US")}`;

type Phase = "idle" | "approving" | "buying" | "success";

export function LivePurchase() {
  // Controlled as STRING so user can clear/type freely; numeric value derived below.
  const [usdcInput, setUsdcInput] = useState<string>(String(SALE_MIN_USDC));
  const usdc = usdcInput.trim() === "" ? 0 : Math.max(0, Number(usdcInput) || 0);
  const setUsdc = (v: number) => setUsdcInput(String(v));
  const [phase, setPhase] = useState<Phase>("idle");
  const [walletGuardError, setWalletGuardError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { connect, connectors, isPending: connectPending } = useConnect();
  const { reconnect, connectors: reconnectConnectors } = useReconnect();
  const { disconnect } = useDisconnect();
  const { switchChainAsync, isPending: switchPending } = useSwitchChain();

  const stats = useSaleStats();
  const userBal = useUserBalances();

  const usdcRaw = useMemo(() => {
    try {
      return parseUnits(String(Number.isFinite(usdc) ? usdc : 0), USDC_DECIMALS);
    } catch {
      return 0n;
    }
  }, [usdc]);

  // Calculator math (off-chain mirror at fixed rate; quote on-chain on demand later).
  const synOut = usdc * 100;
  const { current, next } = rankForUsdc(usdc);
  const flow = vaultFlow(usdc);

  // Write hooks
  const approveTx = useWriteContract();
  const buyTx = useWriteContract();
  // Persist approve+buy tx hashes per (wallet, sale contract) so that a page
  // refresh or MetaMask account switch does not erase the success panel /
  // explorer link / receipt tracker. Same proven pattern as ID 1 + ID 3.
  const persisted = useMintHashPersistence(address, SALE, "syn-sale");
  const effectiveApproveHash = (approveTx.data ?? persisted.approve) as `0x${string}` | undefined;
  const effectiveBuyHash = (buyTx.data ?? persisted.mint) as `0x${string}` | undefined;
  const approveReceipt = useWaitForTransactionReceipt({ hash: effectiveApproveHash });
  const buyReceipt = useWaitForTransactionReceipt({ hash: effectiveBuyHash });

  // Refetch balances after confirms
  useEffect(() => {
    if (approveReceipt.isSuccess) {
      userBal.refetch();
      setPhase("idle");
    }
  }, [approveReceipt.isSuccess]); // eslint-disable-line
  useEffect(() => {
    if (buyReceipt.isSuccess) {
      userBal.refetch();
      stats.refetch();
      setPhase("success");
      // Reset write hashes so the button derives fresh state from new allowance/balances.
      approveTx.reset();
      buyTx.reset();
      // Identity/chapter/member# come from indexed TokensPurchased events and
      // chain-tip queries. RPC log-indexers can lag a few seconds behind the
      // confirming block, so invalidate immediately and again at 4s/12s/30s.
      const invalidate = () => {
        queryClient.invalidateQueries({ queryKey: ["live-purchases"] });
        queryClient.invalidateQueries({ queryKey: ["pulse-tip"] });
        queryClient.invalidateQueries({ queryKey: ["chain-time-tip"] });
      };
      invalidate();
      const t1 = setTimeout(invalidate, 4_000);
      const t2 = setTimeout(invalidate, 12_000);
      const t3 = setTimeout(invalidate, 30_000);
      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }
  }, [buyReceipt.isSuccess]); // eslint-disable-line

  // Account switch: reset unsafe in-flight tx state and clear stale phase.
  // Harmless inputs (usdcInput) are preserved.
  useEffect(() => {
    setPhase("idle");
    setWalletGuardError(null);
    approveTx.reset();
    buyTx.reset();
    userBal.refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  // Derive button state
  const wrongChain = isConnected && chainId !== AVALANCHE_CHAIN_ID;
  const belowMin = usdc < SALE_MIN_USDC;
  const insufficientUsdc =
    userBal.usdcBalance !== undefined && userBal.usdcBalance < usdcRaw;
  const needsApprove =
    userBal.usdcAllowance !== undefined && userBal.usdcAllowance < usdcRaw;
  const noInventory =
    stats.availableSyn !== undefined && stats.availableSyn === 0n;
  const isPaused = stats.paused === true;

  const approvePending = approveTx.isPending || approveReceipt.isLoading;
  const buyPending = buyTx.isPending || buyReceipt.isLoading;

  const verifyFreshWallet = async (surface: string) => {
    const freshness = await assertFreshWallet(address);
    const message = walletFreshnessMessage(freshness);
    if (message) {
      setWalletGuardError(message);
      reconnect({ connectors: reconnectConnectors });
      userBal.refetch();
      void queryClient.invalidateQueries();
      track("wallet_account_resync", { surface });
      return false;
    }
    setWalletGuardError(null);
    return true;
  };

  let state: {
    label: string;
    disabled: boolean;
    onClick?: () => void | Promise<void>;
    tone?: "gold" | "muted" | "error";
  } = { label: "Buy SYN", disabled: true, tone: "gold" };

  if (!isConnected) {
    state = {
      label: connectPending ? "Connecting…" : "Connect Wallet",
      disabled: connectPending || connectors.length === 0,
      tone: "gold",
      onClick: () => {
        track("wallet_connect_click", { surface: "live_purchase" });
        const c = connectors[0];
        if (c) connect({ connector: c });
      },
    };
  } else if (wrongChain) {
    state = {
      label: switchPending ? "Switching…" : "Switch to Avalanche",
      disabled: switchPending,
      tone: "gold",
      onClick: async () => {
        try {
          await switchChainAsync({ chainId: AVALANCHE_CHAIN_ID });
        } catch {
          /* user rejected */
        }
      },
    };
  } else if (isPaused) {
    state = { label: "Sale Paused", disabled: true, tone: "muted" };
  } else if (noInventory) {
    state = { label: "Waiting for SYN Inventory", disabled: true, tone: "muted" };
  } else if (belowMin) {
    state = { label: `Minimum ${SALE_MIN_USDC} USDC`, disabled: true, tone: "muted" };
  } else if (insufficientUsdc) {
    state = { label: "Insufficient USDC", disabled: true, tone: "error" };
  } else if (needsApprove) {
    state = {
      label: approvePending ? "Confirm in Wallet…" : "Approve USDC",
      disabled: approvePending,
      tone: "gold",
      onClick: async () => {
        setPhase("approving");
        if (!(await verifyFreshWallet("live_purchase_approve"))) {
          setPhase("idle");
          return;
        }
        try {
          const hash = await approveTx.writeContractAsync({
            address: USDC,
            abi: ERC20_ABI,
            functionName: "approve",
            account: address,
            args: [SALE, usdcRaw],
          });
          persisted.setApprove(hash as `0x${string}`);
          recordTx({ hash, account: address!, chainId: 43114, surface: "live_purchase_approve", label: "SYN sale — USDC approve", contract: USDC });
        } catch {
          setPhase("idle");
        }
      },
    };
  } else {
    state = {
      label: buyPending ? "Confirm in Wallet…" : "Buy SYN",
      disabled: buyPending,
      tone: "gold",
      onClick: async () => {
        track("purchase_start", { usdc: Number(usdcInput) || undefined });
        setPhase("buying");
        if (!(await verifyFreshWallet("live_purchase_buy"))) {
          setPhase("idle");
          return;
        }
        try {
          const hash = await buyTx.writeContractAsync({
            address: SALE,
            abi: SALE_ABI,
            functionName: "buy",
            account: address,
            args: [usdcRaw],
          });
          track("purchase_success", { tx: hash, usdc: Number(usdcInput) || undefined });
          persisted.setMint(hash as `0x${string}`);
          recordTx({ hash, account: address!, chainId: 43114, surface: "live_purchase_buy", label: "SYN sale — buy", contract: SALE });
        } catch (err) {
          track("purchase_error", { reason: err instanceof Error ? err.message.slice(0, 80) : "rejected" });
          setPhase("idle");
        }
      },
    };
  }

  const buttonStyle =
    state.tone === "muted"
      ? "bg-muted/50 text-muted-foreground cursor-not-allowed"
      : state.tone === "error"
        ? "bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/40 cursor-not-allowed"
        : "";

  // Map raw wallet/RPC errors through the canonical classifier so the user
  // sees actionable copy instead of cryptic stack traces.
  const rawTxError =
    approveTx.error ||
    buyTx.error ||
    approveReceipt.error ||
    buyReceipt.error;
  const classifiedTxError = rawTxError ? classifyTxError(rawTxError) : null;

  return (
    <section
      id="buy"
      aria-labelledby="buy-heading"
      className="border-t border-border/40 bg-background"
    >
      <div className="mx-auto max-w-7xl px-5 md:px-8 py-16 md:py-24">
        <header className="mb-8 md:mb-12">
          <p className="mono text-[10px] uppercase tracking-[0.22em] text-emerald-600 mb-3">
            ● Membership Sale · Live on Avalanche
          </p>
          <h2 id="buy-heading" className="text-3xl md:text-4xl font-semibold tracking-tight">
            Buy SYN with USDC
          </h2>
          <p className="mt-3 text-sm md:text-base text-muted-foreground max-w-2xl">
            {ACCESS_RATE_LABEL}. USDC routes automatically 70% Vault · 20% Liquidity · 10%
            Operations through the Membership Sale contract. Minimum {SALE_MIN_USDC} USDC.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Purchase widget */}
          <article className="rounded-2xl border border-border/50 bg-card/40 backdrop-blur p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Live Purchase</h3>
              <WalletBadge
                address={address}
                isConnected={isConnected}
                wrongChain={wrongChain}
                onDisconnect={() => disconnect()}
              />
            </div>

            {/* Inventory banner */}
            <SaleInventoryBanner
              isLoading={stats.isLoading}
              availableSyn={stats.availableSyn}
              paused={stats.paused}
            />

            {/* Presets */}
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 mb-3 mt-4">
              {PURCHASE_PRESETS_USDC.map((v) => (
                <button
                  key={v}
                  onClick={() => {
                    setUsdc(v);
                    setPhase("idle");
                  }}
                  className={`mono text-[11px] uppercase tracking-[0.15em] rounded-md border py-2 transition-colors ${
                    usdc === v
                      ? "border-[var(--gold)] bg-[var(--gold)]/10"
                      : "border-border/60 text-muted-foreground hover:border-[var(--gold)]/60"
                  }`}
                >
                  ${v}
                </button>
              ))}
            </div>

            <label className="block mb-4">
              <div className="mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-2">
                Custom amount (USDC)
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 mono text-sm text-muted-foreground">
                  $
                </span>
                <input
                  type="text"
                  inputMode="decimal"
                  pattern="[0-9]*\.?[0-9]*"
                  value={usdcInput}
                  onChange={(e) => {
                    const v = e.target.value;
                    // Allow empty + plain numeric strings; strip leading zeros like "05" → "5".
                    if (v === "" || /^\d*\.?\d*$/.test(v)) {
                      const cleaned = v.replace(/^0+(?=\d)/, "");
                      setUsdcInput(cleaned);
                      setPhase("idle");
                    }
                  }}
                  onBlur={() => {
                    if (usdcInput.trim() === "" || Number(usdcInput) < SALE_MIN_USDC) {
                      setUsdcInput(String(SALE_MIN_USDC));
                    }
                  }}
                  placeholder={String(SALE_MIN_USDC)}
                  className="w-full rounded-md border border-border/60 bg-background pl-7 pr-3 py-2.5 mono text-base font-semibold focus:outline-none focus:border-[var(--gold)]"
                />
              </div>
            </label>

            <div className="rounded-lg border border-border/50 bg-background/60 p-4 space-y-2">
              <Row label="USDC amount" value={fmtUsd(usdc)} />
              <Row label="SYN received" value={`${synOut.toLocaleString("en-US")} SYN`} accent />
              <Row label="Rank unlocked" value={current?.name ?? "Below Citizen"} />
              <Row
                label="Next rank gap"
                value={next ? `${fmtUsd(Math.max(0, next.usdc - usdc))} → ${next.name}` : "Top tier"}
              />
              <div className="h-px bg-border/40 my-2" />
              <Row label="→ Vault (70%)" value={fmtUsd(flow.vault)} />
              <Row label="→ Liquidity (20%)" value={fmtUsd(flow.lp)} />
              <Row label="→ Operations (10%)" value={fmtUsd(flow.ops)} />
            </div>

            {/* User balances */}
            {isConnected && !wrongChain && (
              <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                <BalCell label="Your USDC" value={fmtUsdc(userBal.usdcBalance)} />
                <BalCell label="Your SYN" value={fmtSyn(userBal.synBalance)} />
                <BalCell label="Allowance" value={fmtUsdc(userBal.usdcAllowance)} />
              </div>
            )}

            <button
              onClick={() => state.onClick?.()}
              disabled={state.disabled}
              className={`mt-4 w-full rounded-md px-4 py-3 text-sm font-semibold transition-opacity disabled:opacity-60 ${buttonStyle}`}
              style={state.tone === "gold" && !state.disabled ? { background: "var(--gradient-gold)" } : undefined}
            >
              {state.label}
            </button>

            {classifiedTxError && (
              <div className="mt-3 rounded-md border border-red-500/40 bg-red-500/5 p-2 text-xs text-red-700 dark:text-red-400 leading-relaxed">
                <p className="font-medium">{classifiedTxError.title}</p>
                <p className="mt-0.5 opacity-90">{classifiedTxError.message}</p>
              </div>
            )}

            {walletGuardError && (
              <p className="mt-3 rounded-md border border-amber-500/40 bg-amber-500/5 p-2 text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                {walletGuardError}
              </p>
            )}

            {(phase === "success" || (buyReceipt.isSuccess && effectiveBuyHash)) && effectiveBuyHash && (
              <SuccessReceipt
                usdc={usdc}
                synOut={synOut}
                flow={flow}
                hash={effectiveBuyHash}
                rank={current?.name}
                onReset={() => {
                  setPhase("idle");
                  approveTx.reset();
                  buyTx.reset();
                  persisted.clear();
                }}
              />
            )}

            <p className="mt-3 text-[11px] text-muted-foreground leading-relaxed">
              {LEGAL_DISCLAIMER}
            </p>
          </article>

          {/* Live stats + addresses */}
          <article className="rounded-2xl border border-border/50 bg-card/40 backdrop-blur p-6 flex flex-col gap-6">
            <SaleStatsPanel />
            <ContractAddresses />
            <div className="rounded-lg border border-border/50 bg-background/60 p-4">
              <h4 className="text-sm font-semibold mb-2">Non-custodial by design</h4>
              <ul className="space-y-1.5 text-xs text-muted-foreground list-disc pl-4">
                <li>No backend private keys.</li>
                <li>The website never custodies user funds.</li>
                <li>Every transaction is signed wallet-to-contract.</li>
                <li>Routing is enforced by the Membership Sale contract.</li>
              </ul>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</span>
      <span className={`mono text-sm font-semibold ${accent ? "text-gradient-gold" : ""}`}>{value}</span>
    </div>
  );
}

function BalCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border/50 bg-background/60 p-2.5">
      <div className="mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">{label}</div>
      <div className="mono mt-1 font-semibold text-sm">{value}</div>
    </div>
  );
}

function WalletBadge({
  address,
  isConnected,
  wrongChain,
  onDisconnect,
}: {
  address?: string;
  isConnected: boolean;
  wrongChain: boolean;
  onDisconnect: () => void;
}) {
  if (!isConnected) return null;
  return (
    <div className="flex items-center gap-2">
      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] mono uppercase tracking-[0.18em] border ${
          wrongChain
            ? "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400"
            : "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
        }`}
      >
        <span className="size-1.5 rounded-full bg-current" />
        {wrongChain ? "Wrong chain" : "Avalanche"}
      </span>
      <span className="mono text-[11px] text-muted-foreground">{fmtAddress(address)}</span>
      <button
        onClick={onDisconnect}
        aria-label="Disconnect wallet"
        title="Disconnect wallet"
        className="mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground"
      >
        ↺
      </button>
    </div>
  );
}

function SaleInventoryBanner({
  isLoading,
  availableSyn,
  paused,
}: {
  isLoading: boolean;
  availableSyn?: bigint;
  paused?: boolean;
}) {
  if (isLoading) {
    return (
      <div className="rounded-md border border-border/50 bg-background/60 p-3 text-xs text-muted-foreground animate-pulse">
        Loading sale state…
      </div>
    );
  }
  if (paused) {
    return (
      <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-800 dark:text-amber-300">
        Sale contract is currently <strong>paused</strong>. Live purchases are disabled.
      </div>
    );
  }
  if (availableSyn === 0n) {
    return (
      <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-800 dark:text-amber-300">
        Sale contract deployed but waiting for SYN inventory. Live buying will enable once the
        Membership SYN wallet funds the contract.{" "}
        <a
          href={explorerUrlFor("MEMBERSHIP_SALE_CONTRACT_ADDRESS") ?? "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          View Sale Contract ↗
        </a>
      </div>
    );
  }
  if (availableSyn !== undefined) {
    return (
      <div className="rounded-md border border-emerald-500/40 bg-emerald-500/10 p-3 text-xs text-emerald-800 dark:text-emerald-300">
        Sale inventory: <strong>{fmtSyn(availableSyn)} SYN</strong> available for purchase.
      </div>
    );
  }
  return null;
}

function SuccessReceipt({
  usdc,
  synOut,
  flow,
  hash,
  rank,
  onReset,
}: {
  usdc: number;
  synOut: number;
  flow: { vault: number; lp: number; ops: number };
  hash: `0x${string}`;
  rank?: string;
  onReset: () => void;
}) {
  return (
    <div className="mt-4 rounded-lg border border-emerald-500/40 bg-emerald-500/5 p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="mono text-[11px] uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-400">
          ✓ SYN Received
        </div>
        <button onClick={onReset} className="mono text-[10px] uppercase text-muted-foreground hover:text-foreground">
          New purchase
        </button>
      </div>
      <dl className="space-y-1 text-xs">
        <Row label="USDC paid" value={fmtUsd(usdc)} />
        <Row label="SYN received" value={`${synOut.toLocaleString("en-US")} SYN`} accent />
        {rank && <Row label="Rank unlocked" value={rank} />}
        <Row label="→ Vault" value={fmtUsd(flow.vault)} />
        <Row label="→ Liquidity" value={fmtUsd(flow.lp)} />
        <Row label="→ Operations" value={fmtUsd(flow.ops)} />
      </dl>
      <div className="mt-3">
        <ProofButton href={txExplorerUrl(hash)}>
          View transaction on Avascan ↗
        </ProofButton>
      </div>
    </div>
  );
}

export function SaleStatsPanel() {
  const s = useSaleStats();
  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">Live Sale Stats</h3>
      <div className="grid grid-cols-2 gap-2">
        <Stat label="Available SYN" value={fmtSyn(s.availableSyn)} />
        <Stat label="Total SYN sold" value={fmtSyn(s.totalSynSold)} />
        <Stat label="Total USDC raised" value={`$${fmtUsdc(s.totalUsdcRaised)}`} />
        <Stat label="Total buyers" value={s.totalBuyers !== undefined ? s.totalBuyers.toString() : "—"} />
        <Stat label="Purchase count" value={s.purchaseCount !== undefined ? s.purchaseCount.toString() : "—"} />
        <Stat label="Paused?" value={s.paused === undefined ? "—" : s.paused ? "Yes" : "No"} />
      </div>
      <p className="mt-2 mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        Refreshes every 60s · reads onchain
      </p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border/50 bg-background/60 p-3">
      <div className="mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">{label}</div>
      <div className="mt-1 mono text-sm font-semibold">{value}</div>
    </div>
  );
}

export function ContractAddresses() {
  const entries: Array<[string, string, string | null]> = [
    ["Membership Sale", CONTRACTS.MEMBERSHIP_SALE_CONTRACT_ADDRESS, explorerUrlFor("MEMBERSHIP_SALE_CONTRACT_ADDRESS")],
    ["USDC",            CONTRACTS.USDC_CONTRACT_ADDRESS,            explorerUrlFor("USDC_CONTRACT_ADDRESS")],
    ["SYN",             CONTRACTS.SYN_CONTRACT_ADDRESS,             explorerUrlFor("SYN_CONTRACT_ADDRESS")],
    ["Vault wallet",      CONTRACTS.VAULT_WALLET,      explorerUrlForAddress(CONTRACTS.VAULT_WALLET)],
    ["Liquidity wallet",  CONTRACTS.LIQUIDITY_WALLET,  explorerUrlForAddress(CONTRACTS.LIQUIDITY_WALLET)],
    ["Operations wallet", CONTRACTS.OPERATIONS_WALLET, explorerUrlForAddress(CONTRACTS.OPERATIONS_WALLET)],
  ];
  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">Contract Addresses</h3>
      <dl className="divide-y divide-border/40 text-sm">
        {entries.map(([label, addr, url]) => (
          <div key={label} className="flex items-center justify-between py-2 gap-3 flex-wrap">
            <dt className="text-muted-foreground text-xs mono uppercase tracking-[0.14em]">{label}</dt>
            <dd>
              <ContractLink address={addr} explorerHref={url} extras={extrasForAddress(addr)} />
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

// Re-export for places that want USDC decimals constant
export { USDC_DECIMALS, SYN_DECIMALS };
