// Member + Wallet Dashboard — the cockpit on /my-syndicate.
//
// Truth rules:
//   • No fake ownership. balances read live from contracts via wagmi.
//   • member#/chapter derived from indexed TokensPurchased (holder-index).
//   • If a value is unknown, surface "Not indexed yet" — never invent.
//   • No yield / reward / wealth language.
import { Link as RouterLink } from "@tanstack/react-router";
import { useAccount, useBalance, useReadContract } from "wagmi";

import { formatUnits } from "viem";
import {
  CONTRACTS,
  USDC_DECIMALS,
  SYN_DECIMALS,
  ARCHIVE_NFT_CONTRACT_ADDRESS,
  explorerUrlForAddress,
  txExplorerUrl,
} from "@/lib/syndicate-config";
import { ERC20_ABI } from "@/lib/sale-abi";
import { ARCHIVE_NFT_ABI } from "@/lib/archive-nft-abi";
import { useHolderIndex } from "@/lib/holder-index";
import { useWalletSession } from "@/lib/wallet-session";
import { getChapterByMemberNumber, isFounder } from "@/lib/chapters";
import { GlassCard, Pill, Section, SectionHeader, StatusPill } from "./Primitives";
import { SourceTag, type LiveSource } from "./SourceTag";
import { SinceLastVisitStory } from "./SinceLastVisitStory";

const ARCHIVE = ARCHIVE_NFT_CONTRACT_ADDRESS as `0x${string}`;
const SYN = CONTRACTS.SYN_CONTRACT_ADDRESS as `0x${string}`;
const USDC = CONTRACTS.USDC_CONTRACT_ADDRESS as `0x${string}`;
const fmt = (n: number, d = 2) =>
  n.toLocaleString("en-US", { maximumFractionDigits: d });

export function MemberWalletDashboard() {
  const wallet = useWalletSession();
  const { address } = useAccount();
  const idx = useHolderIndex();
  const record = address ? idx.getByWallet(address) : undefined;

  // Native AVAX balance.
  const avax = useBalance({ address, query: { enabled: Boolean(address), refetchInterval: 60_000 } });

  // ERC20 balances.
  const usdc = useReadContract({
    address: USDC,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address), refetchInterval: 60_000 },
  });
  const syn = useReadContract({
    address: SYN,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address), refetchInterval: 60_000 },
  });

  // Archive1155 balances for IDs 1 + 3.
  const firstSignal = useReadContract({
    address: ARCHIVE,
    abi: ARCHIVE_NFT_ABI,
    functionName: "balanceOf",
    args: address ? [address, 1n] : undefined,
    query: { enabled: Boolean(address), refetchInterval: 60_000 },
  });
  const patronSeal = useReadContract({
    address: ARCHIVE,
    abi: ARCHIVE_NFT_ABI,
    functionName: "balanceOf",
    args: address ? [address, 3n] : undefined,
    query: { enabled: Boolean(address), refetchInterval: 60_000 },
  });

  if (!wallet.isConnected || !address) {
    return (
      <Section id="member-dashboard">
        <SectionHeader
          eyebrow="Your cockpit"
          title={<>Connect to open your <span className="text-gradient-gold">dashboard</span></>}
          description="Identity, wallet, holdings, and your on-chain history with the protocol — all live, all verifiable."
        />
        <SinceLastVisitStory />
        <GlassCard className="p-6 mt-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground flex items-center gap-2">
                Wallet <Pill tone="muted">Disconnected</Pill>
              </div>
              <p className="text-sm text-foreground/90">
                Connect a wallet to load your member number, chapter, holdings, and on-chain history.
              </p>
              <p className="text-[11px] text-muted-foreground">
                Read-only. We never request signatures until you choose to buy or mint.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <RouterLink
                to="/join"
                className="mono text-[11px] uppercase tracking-[0.18em] px-4 py-2 rounded-md border border-[var(--gold)]/40 text-[var(--gold)] hover:bg-[var(--gold)]/10"
              >
                Join the Membership Sale →
              </RouterLink>
              <RouterLink
                to="/transparency"
                className="mono text-[11px] uppercase tracking-[0.18em] px-4 py-2 rounded-md border border-border/60 hover:border-[var(--gold)]/40 hover:text-foreground"
              >
                Verify the protocol →
              </RouterLink>
            </div>
          </div>
        </GlassCard>
      </Section>
    );
  }

  // Derived identity.
  const memberNumber = record?.memberNumber;
  const chapter = memberNumber ? getChapterByMemberNumber(memberNumber) : undefined;
  const founder = memberNumber ? isFounder(memberNumber) : false;

  // Balances → numbers.
  const avaxN = avax.data ? Number(formatUnits(avax.data.value, avax.data.decimals)) : undefined;
  const usdcN = usdc.data !== undefined ? Number(formatUnits(usdc.data as bigint, USDC_DECIMALS)) : undefined;
  const synN = syn.data !== undefined ? Number(formatUnits(syn.data as bigint, SYN_DECIMALS)) : undefined;
  const fsN = firstSignal.data !== undefined ? Number(firstSignal.data as bigint) : undefined;
  const psN = patronSeal.data !== undefined ? Number(patronSeal.data as bigint) : undefined;

  // Next personal action — single, never two.
  const nextAction = !record
    ? { label: "Join the Membership Sale", to: "/join" as const, hint: "Buy SYN to claim your member number." }
    : fsN === 0
    ? { label: "Mint The First Signal", to: "/nft" as const, hint: "Chapter I mint is open at 0.50 USDC." }
    : psN === 0
    ? { label: "Mint the Patron Seal", to: "/nft" as const, hint: "Patron Seal mint is open at 5.00 USDC." }
    : { label: "Explore the Archive", to: "/archive" as const, hint: "See every artifact in the registry." };

  return (
    <Section id="member-dashboard">
      <SectionHeader
        eyebrow="Your cockpit"
        title={<>Member <span className="text-gradient-gold">dashboard</span></>}
        description="Identity, wallet, holdings, and on-chain history — all derived live from Avalanche. Nothing fabricated."
      />

      {/* Top strip: status + wallet + network */}
      <GlassCard className="p-4 mb-4">
        <div className="flex flex-wrap items-center gap-3">
          <StatusPill status={wallet.wrongNetwork ? "PARTIAL" : "LIVE"} />
          <span className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Wallet</span>
          <a
            href={explorerUrlForAddress(address) ?? "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="mono text-sm text-foreground hover:text-[var(--gold)] underline-offset-4 hover:underline"
          >
            {wallet.short} ↗
          </a>
          <span className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">·</span>
          <Pill tone={wallet.wrongNetwork ? "warning" : "success"}>
            {wallet.wrongNetwork ? `Wrong network (id ${wallet.chainId})` : "Avalanche C-Chain"}
          </Pill>
          {wallet.wrongNetwork && (
            <button
              onClick={() => void wallet.switchToExpectedChain()}
              className="ml-auto mono text-[10px] uppercase tracking-[0.18em] px-3 py-1.5 rounded-md border border-amber-500/40 text-amber-700 dark:text-amber-400 hover:bg-amber-500/10"
            >
              Switch network
            </button>
          )}
        </div>
      </GlassCard>

      {/* Two columns: Identity + Wallet/Holdings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Identity */}
        <GlassCard className="p-5">
          <div className="mono text-[10px] uppercase tracking-[0.18em] text-[var(--gold)] mb-3">Identity</div>
          <ul className="space-y-2 text-sm">
            <Row
              label="Member #"
              value={memberNumber ? `#${memberNumber}` : "Not yet a member"}
              source={memberNumber ? "INDEXED" : "—"}
            />
            <Row
              label="Chapter"
              value={chapter ? `${chapter.label} (${chapter.range})` : "—"}
              source={chapter ? "DERIVED" : "—"}
            />
            <Row
              label="Cohort"
              value={founder ? "Genesis · Founder cohort (#1–#333)" : memberNumber ? `Post-Founder (#${memberNumber})` : "—"}
              source={memberNumber ? "DERIVED" : "—"}
            />
            <Row
              label="First purchase"
              value={
                record ? (
                  <a
                    href={txExplorerUrl(record.firstPurchaseTx)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mono text-xs hover:text-[var(--gold)] underline-offset-4 hover:underline"
                  >
                    {record.firstPurchaseTx.slice(0, 10)}…{record.firstPurchaseTx.slice(-6)} ↗
                  </a>
                ) : (
                  "—"
                )
              }
              source={record ? "LIVE" : "—"}
            />
            {founder && (
              <li className="pt-2">
                <Pill tone="warning">★ Genesis · Founder cohort</Pill>
              </li>
            )}
          </ul>
        </GlassCard>

        {/* Wallet + Holdings */}
        <GlassCard className="p-5">
          <div className="flex items-center justify-between mb-3 gap-2">
            <div className="mono text-[10px] uppercase tracking-[0.18em] text-[var(--gold)]">
              Wallet & holdings
            </div>
            <div className="flex items-center gap-2">
              <SourceTag source="LIVE" />
              <button
                type="button"
                onClick={() => {
                  void avax.refetch();
                  void usdc.refetch();
                  void syn.refetch();
                  void firstSignal.refetch();
                  void patronSeal.refetch();
                }}
                className="mono text-[10px] uppercase tracking-[0.18em] rounded-md border border-border/60 px-2 py-1 hover:border-[var(--gold)]/50 hover:text-foreground"
                aria-label="Refresh balances"
              >
                ↻
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Tile label="AVAX" value={avaxN !== undefined ? fmt(avaxN, 4) : "—"} hint="Gas balance" loading={avax.isLoading} source="LIVE" />
            <Tile label="USDC" value={usdcN !== undefined ? `$${fmt(usdcN, 2)}` : "—"} hint="Payment token" loading={usdc.isLoading} source="LIVE" />
            <Tile label="SYN" value={synN !== undefined ? fmt(synN, 0) : "—"} hint="Seat token" emphasize loading={syn.isLoading} source="LIVE" />
            <Tile
              label="First Signal"
              value={fsN !== undefined ? String(fsN) : "—"}
              hint="Archive ID 1"
              emphasize={(fsN ?? 0) > 0}
              loading={firstSignal.isLoading}
              source="LIVE"
            />
            <Tile
              label="Patron Seal"
              value={psN !== undefined ? String(psN) : "—"}
              hint="Archive ID 3"
              emphasize={(psN ?? 0) > 0}
              loading={patronSeal.isLoading}
              source="LIVE"
            />
            <Tile
              label="Purchases"
              value={record ? String(record.purchaseCount) : "0"}
              hint="Indexed"
              source="INDEXED"
            />
          </div>
          {(avax.isError || usdc.isError || syn.isError) && (
            <p className="mt-3 text-[11px] text-amber-600 dark:text-amber-400">
              Some balances failed to load.{" "}
              <button
                type="button"
                className="underline underline-offset-2 hover:text-foreground"
                onClick={() => {
                  void avax.refetch(); void usdc.refetch(); void syn.refetch();
                }}
              >
                Retry
              </button>
              .
            </p>
          )}
          {/* Zero-balance hint: no gas → cannot transact. */}
          {avaxN !== undefined && avaxN < 0.02 && (
            <div className="mt-3 rounded-md border border-amber-500/40 bg-amber-500/[0.05] p-3">
              <div className="mono text-[10px] uppercase tracking-[0.18em] text-amber-700 dark:text-amber-400 mb-1">
                Low AVAX gas
              </div>
              <p className="text-xs text-foreground/85">
                You need a small amount of AVAX to pay gas before you can buy SYN or mint
                an artifact. Fund this wallet with AVAX, then return here.
              </p>
            </div>
          )}
          {avaxN !== undefined && avaxN >= 0.02 && usdcN !== undefined && usdcN < 0.5 && (synN ?? 0) === 0 && (
            <div className="mt-3 rounded-md border border-[var(--gold)]/30 bg-[var(--gold)]/[0.04] p-3 flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs text-foreground/85">
                You're ready to join — add USDC and you can claim your member number.
              </p>
              <RouterLink
                to="/join"
                className="mono text-[10px] uppercase tracking-[0.18em] px-3 py-1.5 rounded-md border border-[var(--gold)]/40 text-[var(--gold)] hover:bg-[var(--gold)]/10"
              >
                Open join →
              </RouterLink>
            </div>
          )}
          <p className="mt-3 text-[10px] mono uppercase tracking-[0.18em] text-muted-foreground">
            Source · LIVE balanceOf reads · refreshes every 60s
          </p>
        </GlassCard>
      </div>

      {/* Since-last-visit story (backend cookie, no localStorage). */}
      <div className="mt-4">
        <SinceLastVisitStory />
      </div>

      {/* What changed + Next action */}
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <GlassCard className="p-5 lg:col-span-2">
          <div className="mono text-[10px] uppercase tracking-[0.18em] text-[var(--gold)] mb-2">
            On-chain story
          </div>
          {!record ? (
            <p className="text-sm text-muted-foreground">
              No SYN purchases recorded for this wallet yet. Join the Membership Sale to claim
              your member number and start your on-chain history.
            </p>
          ) : (
            <ul className="space-y-2 text-sm">
              <Row
                label="Latest purchase"
                value={
                  <a
                    href={txExplorerUrl(record.lastPurchaseTx)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mono text-xs hover:text-[var(--gold)] underline-offset-4 hover:underline"
                  >
                    {record.lastPurchaseTx.slice(0, 10)}…{record.lastPurchaseTx.slice(-6)} ↗
                  </a>
                }
                source="LIVE"
              />
              <Row label="Latest USDC" value={`$${fmt(record.lastPurchaseUsdc ?? 0, 2)}`} source="INDEXED" />
              <Row label="Latest SYN" value={fmt(record.lastPurchaseSyn ?? 0, 0)} source="INDEXED" />
            </ul>
          )}
        </GlassCard>

        <GlassCard className="p-5 flex flex-col justify-between">
          <div>
            <div className="mono text-[10px] uppercase tracking-[0.18em] text-[var(--gold)] mb-2">
              Next action
            </div>
            <p className="text-sm text-foreground/90 leading-snug">{nextAction.hint}</p>
          </div>
          <RouterLink
            to={nextAction.to}
            className="mt-3 mono text-[11px] uppercase tracking-[0.18em] px-4 py-2 rounded-md border border-[var(--gold)]/40 text-[var(--gold)] hover:bg-[var(--gold)]/10 text-center"
          >
            {nextAction.label} →
          </RouterLink>
        </GlassCard>
      </div>
    </Section>
  );
}

function Row({
  label,
  value,
  source,
}: {
  label: string;
  value: React.ReactNode;
  source?: string;
}) {
  return (
    <li className="flex items-center justify-between gap-3 flex-wrap">
      <span className="text-muted-foreground text-sm">{label}</span>
      <span className="flex items-center gap-2">
        <span className="text-sm">{value}</span>
        {source && source !== "—" && (
          <span className="mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/70">
            {source}
          </span>
        )}
      </span>
    </li>
  );
}

function Tile({
  label,
  value,
  hint,
  emphasize = false,
  loading = false,
  source,
}: {
  label: string;
  value: string;
  hint?: string;
  emphasize?: boolean;
  loading?: boolean;
  source?: LiveSource;
}) {
  const isEmpty = value === "—";
  return (
    <div
      className={`surface elevated p-3 flex flex-col gap-1 ${
        emphasize ? "border-[var(--gold)]/30 bg-[var(--gold)]/[0.03]" : ""
      }`}
    >
      <div className="mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground flex items-center justify-between">
        <span>{label}</span>
        {source && <SourceTag source={source} size="xs" />}
      </div>
      {loading && isEmpty ? (
        <div className="h-4 w-16 rounded bg-foreground/[0.06] animate-pulse mt-1" />
      ) : (
        <div className="mono text-base font-semibold leading-none mt-1 truncate">{value}</div>
      )}
      {hint && <div className="text-[10px] text-muted-foreground mt-0.5">{hint}</div>}
    </div>
  );
}
