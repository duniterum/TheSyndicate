import { useEffect, useMemo, useState } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseUnits } from "viem";
import {
  ACTIVE_SALE,
  ACTIVE_SALE_VERSION,
  fmtSyn,
  fmtUsdc,
  useQuoteSyn,
  useUserBalances,
  ZERO_SOURCE_ID,
} from "@/lib/sale-hooks";
import { useWalletGate } from "@/lib/useWalletGate";
import { CONTRACTS, explorerUrlForAddress, txExplorerUrl, USDC_DECIMALS } from "@/lib/syndicate-config";
import { ERC20_ABI, SALE_V3_ABI } from "@/lib/sale-abi";
import { getV3HistoricalMember } from "@/lib/v3-historical-members";
import { useHolderIndex } from "@/lib/holder-index";
import {
  buildSourceAwareTestModeGate,
  SOURCE_AWARE_TEST_MODE_FLAG,
  SOURCE_AWARE_TEST_QUERY_VALUE,
} from "@/lib/source-aware-test-mode";
import { INTERNAL_PROTOCOL_TEST_SOURCE_001 } from "@/lib/source-policy-observability";
import { ContractLink, ProofButton } from "./Primitives";

const USDC = CONTRACTS.USDC_CONTRACT_ADDRESS as `0x${string}`;
const TEST_USDC_RAW = parseUnits("5", USDC_DECIMALS);
const TEST_SOURCE_ID = INTERNAL_PROTOCOL_TEST_SOURCE_001.sourceId as `0x${string}`;

type Phase = "idle" | "approving" | "buying" | "success";

export function SourceAwareLocalTestHarness({
  requestedSourceTest,
}: {
  requestedSourceTest?: string | null;
}) {
  const [hostname, setHostname] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setHostname(window.location.hostname);
  }, []);

  const gate = useMemo(
    () =>
      buildSourceAwareTestModeGate({
        isDev: import.meta.env.DEV,
        hostname,
        enabledFlag: import.meta.env.VITE_ENABLE_SOURCE_TEST_MODE,
        requestedSourceTest,
      }),
    [hostname, requestedSourceTest],
  );

  const wallet = useWalletGate();
  const userBal = useUserBalances();
  const holderIndex = useHolderIndex();
  const knownMember = wallet.address ? holderIndex.getByWallet(wallet.address) : undefined;
  const historicalMember = getV3HistoricalMember(wallet.address);
  const quote = useQuoteSyn(TEST_USDC_RAW, wallet.address, {
    sourceId: TEST_SOURCE_ID,
    enabled: gate.canQuoteNonZeroSourceId,
  });
  const approveTx = useWriteContract();
  const buyTx = useWriteContract();
  const approveReceipt = useWaitForTransactionReceipt({ hash: approveTx.data });
  const buyReceipt = useWaitForTransactionReceipt({ hash: buyTx.data });

  useEffect(() => {
    if (approveReceipt.isSuccess) {
      userBal.refetch();
      setPhase("idle");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [approveReceipt.isSuccess]);

  useEffect(() => {
    if (buyReceipt.isSuccess) {
      userBal.refetch();
      setPhase("success");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buyReceipt.isSuccess]);

  const needsApprove =
    userBal.usdcAllowance !== undefined && userBal.usdcAllowance < TEST_USDC_RAW;
  const insufficientUsdc =
    userBal.usdcBalance !== undefined && userBal.usdcBalance < TEST_USDC_RAW;
  const quoteReady = quote.data !== undefined;
  const walletBlocked =
    knownMember !== undefined ||
    historicalMember !== undefined ||
    ACTIVE_SALE_VERSION !== "v3";

  const canUseWalletControls =
    gate.canPrepareSourceAwareBuy &&
    wallet.isConnected &&
    !wallet.wrongChain &&
    !walletBlocked &&
    !insufficientUsdc &&
    userBal.usdcAllowance !== undefined &&
    userBal.usdcBalance !== undefined &&
    quoteReady;

  const sourceTerms = [
    ["sourceId", gate.sourceIdForTest],
    ["status", gate.sourceStatus],
    ["sourceClass", INTERNAL_PROTOCOL_TEST_SOURCE_001.sourceClass],
    ["sourceWallet", INTERNAL_PROTOCOL_TEST_SOURCE_001.sourceWallet],
    ["payoutWallet", INTERNAL_PROTOCOL_TEST_SOURCE_001.payoutWallet],
    ["commissionBps", INTERNAL_PROTOCOL_TEST_SOURCE_001.commissionBps.toString()],
    ["grossCap", `${fmtUsdc(BigInt(INTERNAL_PROTOCOL_TEST_SOURCE_001.grossCap ?? 0))} USDC`],
    ["perBuyerCap", `${fmtUsdc(BigInt(INTERNAL_PROTOCOL_TEST_SOURCE_001.perBuyerCap ?? 0))} USDC`],
  ] as const;

  const handleApprove = async () => {
    setMessage(null);
    setPhase("approving");
    try {
      await approveTx.writeContractAsync({
        address: USDC,
        abi: ERC20_ABI,
        functionName: "approve",
        account: wallet.address!,
        args: [ACTIVE_SALE, TEST_USDC_RAW],
      });
    } catch {
      setPhase("idle");
    }
  };

  const handleBuy = async () => {
    setMessage(null);
    setPhase("buying");
    try {
      const fresh = await quote.refetch();
      const minSynOut = fresh.data as bigint | undefined;
      if (minSynOut === undefined) {
        setMessage("Source-aware quote unavailable. Do not sign.");
        setPhase("idle");
        return;
      }
      await buyTx.writeContractAsync({
        address: ACTIVE_SALE,
        abi: SALE_V3_ABI,
        functionName: "buy",
        account: wallet.address!,
        args: [TEST_USDC_RAW, wallet.address!, TEST_SOURCE_ID, minSynOut, []],
      });
    } catch {
      setPhase("idle");
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-5 py-10">
      <header className="rounded-md border border-amber-500/40 bg-amber-500/10 p-5">
        <div className="mono text-[10px] uppercase tracking-[0.22em] text-amber-700 dark:text-amber-300">
          INTERNAL SOURCE TEST MODE / NOT PUBLIC REFERRAL
        </div>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          Localhost-only source-aware test boundary
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          This page exists only to prepare a future controlled $5
          source-attributed MembershipSaleV3 test after a separate ACTIVE
          ceremony. It is not linked publicly, not a source dashboard, not a
          claim surface, and not referral activation.
        </p>
      </header>

      <section className="mt-5 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-md border border-border/60 bg-card/70 p-5">
          <div className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Gate status
          </div>
          <div className="mt-2 text-xl font-semibold">{gate.status.replaceAll("_", " ")}</div>
          <div className="mt-4 grid gap-2 text-sm">
            {gate.requiredWarnings.map((warning) => (
              <div key={warning} className="rounded border border-border/50 bg-background/45 px-3 py-2">
                {warning}
              </div>
            ))}
          </div>
          {gate.blockers.length > 0 && (
            <div className="mt-4 rounded-md border border-destructive/40 bg-destructive/10 p-3">
              <div className="mono text-[10px] uppercase tracking-[0.18em] text-destructive">
                Blockers
              </div>
              <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-muted-foreground">
                {gate.blockers.map((blocker) => (
                  <li key={blocker}>{blocker}</li>
                ))}
              </ul>
            </div>
          )}
        </article>

        <article className="rounded-md border border-border/60 bg-card/70 p-5">
          <div className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Required local entry
          </div>
          <dl className="mt-3 space-y-2 text-sm">
            <Row label="Route" value="/labs/source-attribution-test" />
            <Row label="Flag" value={`${SOURCE_AWARE_TEST_MODE_FLAG}=true`} />
            <Row label="Query" value={`sourceTest=${SOURCE_AWARE_TEST_QUERY_VALUE}`} />
            <Row label="Amount" value="$5.00 USDC only" />
            <Row label="Default public buy" value="ZERO_SOURCE_ID" />
          </dl>
        </article>
      </section>

      <section className="mt-5 rounded-md border border-border/60 bg-card/70 p-5">
        <div className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          Frozen source terms preview
        </div>
        <div className="mt-4 grid gap-2 md:grid-cols-2">
          {sourceTerms.map(([label, value]) => (
            <Row key={label} label={label} value={value} />
          ))}
        </div>
        <div className="mt-4 rounded-md border border-border/50 bg-background/45 p-3 text-sm leading-relaxed text-muted-foreground">
          Quote and buy controls stay locked until the source is ACTIVE in the
          current read model. The current public/default path stays{" "}
          <code>{ZERO_SOURCE_ID}</code>.
        </div>
      </section>

      <section className="mt-5 rounded-md border border-border/60 bg-card/70 p-5">
        <div className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          Local $5 test controls
        </div>
        {!gate.canPrepareSourceAwareBuy ? (
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Controls are intentionally unavailable. This is expected while the
            internal source remains PAUSED or the local gate is incomplete.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            <div className="grid gap-2 md:grid-cols-3">
              <Row label="Quote SYN" value={quote.data ? `${fmtSyn(quote.data)} SYN` : "Loading"} />
              <Row label="Acquisition commission" value={fmtUsdc(quote.acquisitionCost)} />
              <Row label="Net USDC routed" value={fmtUsdc(quote.protocolContribution)} />
            </div>
            {!wallet.isConnected ? (
              <button className="btn btn-primary" onClick={() => wallet.connectWallet()}>
                Connect wallet
              </button>
            ) : wallet.wrongChain ? (
              <button className="btn btn-primary" onClick={() => void wallet.switchToAvalanche()}>
                Switch to Avalanche
              </button>
            ) : walletBlocked ? (
              <p className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-muted-foreground">
                Fresh buyer wallet required. Historical or already seated wallets
                cannot run the controlled source-attributed test.
              </p>
            ) : needsApprove ? (
              <button
                className="btn btn-primary"
                disabled={!canUseWalletControls || phase === "approving"}
                onClick={handleApprove}
              >
                {phase === "approving" ? "Confirm approval" : "Approve $5 USDC"}
              </button>
            ) : (
              <button
                className="btn btn-primary"
                disabled={!canUseWalletControls || phase === "buying"}
                onClick={handleBuy}
              >
                {phase === "buying" ? "Confirm local test buy" : "Run local $5 source test"}
              </button>
            )}
            {message && <p className="text-sm text-destructive">{message}</p>}
            {buyReceipt.isSuccess && buyTx.data && (
              <div className="rounded-md border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm">
                Local source-aware test transaction confirmed.
                <div className="mt-2">
                  <ProofButton href={txExplorerUrl(buyTx.data)}>
                    View transaction
                  </ProofButton>
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      <section className="mt-5 rounded-md border border-border/60 bg-card/70 p-5">
        <div className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          Production boundary
        </div>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          This harness must never be linked from public navigation, never appear
          in the sitemap, never create a public source link, and never alter
          `/join`. If production renders this page, it must stay locked and show
          no wallet action.
        </p>
        <div className="mt-3">
          <ContractLink address={ACTIVE_SALE} explorerHref={explorerUrlForAddress(ACTIVE_SALE)} />
        </div>
      </section>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border/50 bg-background/45 px-3 py-2">
      <dt className="mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">{label}</dt>
      <dd className="mt-1 break-all text-sm font-medium text-foreground">{value}</dd>
    </div>
  );
}
