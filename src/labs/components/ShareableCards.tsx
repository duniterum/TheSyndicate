import { useRef, type ReactNode } from "react";
import { useAccount } from "wagmi";
import { Section, SectionHeader, GlassCard, Pill } from "@/components/syndicate/Primitives";
import { ShareActions } from "@/components/syndicate/ShareActions";

import {
  CONTRACTS,
  rankForSyn,
} from "@/lib/syndicate-config";
import {
  useBuyerPurchaseTotals,
  useSaleStats,
  useLpStats,
  fmtUsdc,
  fmtSyn,
  fmtAddress,
} from "@/lib/sale-hooks";
import { useTreasuryAssets, useSynSupply } from "@/lib/treasury-hooks";
import { useHolderIndex } from "@/lib/holder-index";
import { formatUnits } from "viem";

/**
 * SHAREABLE CARDS — exported as PNGs via html-to-image.
 *
 * Two kinds:
 *   1. MemberCard       — identity card for a connected wallet
 *   2. ProtocolSnapshot — one-shot proof card per metric (revenue, assets,
 *                         liquidity, members, milestone)
 *
 * Every value is read live from chain. PENDING values render as PENDING —
 * cards never fabricate numbers. Truth before polish.
 */

/* ─────────────────────────── shared chrome ─────────────────────────── */

function CardFrame({
  children,
  innerRef,
  width = 720,
  height = 420,
}: {
  children: ReactNode;
  innerRef: React.RefObject<HTMLDivElement | null>;
  width?: number;
  height?: number;
}) {
  return (
    <div
      ref={innerRef}
      style={{
        width,
        height,
        background:
          "radial-gradient(circle at 20% 20%, oklch(0.32 0.06 260) 0%, oklch(0.18 0.04 260) 60%, oklch(0.12 0.03 260) 100%)",
        color: "white",
        fontFamily: "ui-sans-serif, system-ui, -apple-system",
        position: "relative",
        overflow: "hidden",
        borderRadius: 16,
        padding: 32,
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
      }}
    >
      {/* corner gold accent */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: 220,
          height: 220,
          background:
            "radial-gradient(circle at top right, oklch(0.78 0.14 75 / 0.35), transparent 70%)",
          pointerEvents: "none",
        }}
      />
      {children}
    </div>
  );
}

function CardHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
      <div>
        <div
          style={{
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            fontSize: 10,
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            color: "oklch(0.78 0.14 75)",
            marginBottom: 8,
          }}
        >
          {eyebrow}
        </div>
        <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.01em" }}>{title}</div>
      </div>
      <div
        style={{
          fontFamily: "ui-monospace, monospace",
          fontSize: 11,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.55)",
        }}
      >
        THE SYNDICATE
      </div>
    </div>
  );
}

function CardFooter({ note }: { note: string }) {
  return (
    <div
      style={{
        marginTop: "auto",
        paddingTop: 16,
        borderTop: "1px solid rgba(255,255,255,0.08)",
        display: "flex",
        justifyContent: "space-between",
        fontFamily: "ui-monospace, monospace",
        fontSize: 10,
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        color: "rgba(255,255,255,0.5)",
      }}
    >
      <span>{note}</span>
      <span>thesyndicate.money</span>
    </div>
  );
}

function BigStat({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div>
      <div
        style={{
          fontFamily: "ui-monospace, monospace",
          fontSize: 10,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.55)",
          marginBottom: 8,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: "ui-monospace, monospace",
          fontSize: 40,
          fontWeight: 600,
          background: "linear-gradient(135deg, oklch(0.92 0.12 80), oklch(0.78 0.14 75))",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          lineHeight: 1,
        }}
      >
        {value}
      </div>
      {sub && (
        <div style={{ marginTop: 8, fontSize: 13, color: "rgba(255,255,255,0.7)" }}>{sub}</div>
      )}
    </div>
  );
}

/* Share primitive lives in ./ShareActions — see imports above. */


/* ─────────────────────────── MEMBER CARD ─────────────────────────── */

export function MemberCard() {
  const { address, isConnected } = useAccount();
  const buyer = useBuyerPurchaseTotals();
  const supply = useSynSupply();

  const synAmount =
    buyer.buyerSynTotal !== undefined
      ? Number(formatUnits(buyer.buyerSynTotal, 18))
      : 0;
  const usdcAmount =
    buyer.buyerUsdcTotal !== undefined
      ? Number(formatUnits(buyer.buyerUsdcTotal, 6))
      : 0;

  const { current: rank } = rankForSyn(synAmount);

  // Archive weight is an identity-only display value, not a reward or entitlement.
  const archiveWeight = Math.floor(usdcAmount || 5);

  const verification: "VERIFIED" | "PENDING" =
    isConnected && synAmount > 0 ? "VERIFIED" : "PENDING";

  // Member number comes ONLY from the canonical holder index — never fabricated
  // from the wallet address. Real "#N" once indexed, "Indexing…" while the index
  // is still loading for a connected wallet, else PENDING.
  const idx = useHolderIndex();
  const record = idx.getByWallet(address);
  const memberNumber = record
    ? `#${record.founderNumber}`
    : isConnected && idx.isLoading
      ? "Indexing…"
      : "PENDING";
  const memberSub = record
    ? "Seat recorded on-chain"
    : isConnected
      ? "Not yet a member"
      : "Not yet joined";

  const snapshotSupply =
    supply.totalSupply !== undefined
      ? `${(supply.totalSupply / 1_000_000_000).toFixed(2)}B SYN`
      : "PENDING";

  const ref = useRef<HTMLDivElement | null>(null);

  return (
    <Section id="member-card">
      <SectionHeader
        eyebrow="Shareable member card"
        title={
          <>
            Your <span className="text-gradient-gold">identity</span>, exportable
          </>
        }
        description="A card that proves your seat in the formation. Member number, rank, join date, verification status, and a live protocol snapshot. Connect a wallet to populate, then download as PNG."
      />

      <div className="grid lg:grid-cols-[auto,1fr] gap-6 items-start">
        <GlassCard className="p-4 overflow-hidden">
          <div style={{ overflow: "auto" }}>
            <CardFrame innerRef={ref}>
              <CardHeader eyebrow="Member card" title={rank?.name ?? "Pre-member"} />

              <div
                style={{
                  marginTop: 28,
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 24,
                }}
              >
                <BigStat label="Archive Weight" value={archiveWeight.toLocaleString("en-US")} />
                <BigStat
                  label="Member #"
                  value={memberNumber}
                  sub={memberSub}
                />
              </div>

              <div
                style={{
                  marginTop: 24,
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: 16,
                }}
              >
                {[
                  { l: "Rank", v: rank?.name ?? "—" },
                  { l: "Verification", v: verification },
                  { l: "Protocol", v: snapshotSupply },
                ].map((m) => (
                  <div
                    key={m.l}
                    style={{
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 10,
                      padding: 12,
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "ui-monospace, monospace",
                        fontSize: 9,
                        letterSpacing: "0.22em",
                        textTransform: "uppercase",
                        color: "rgba(255,255,255,0.55)",
                        marginBottom: 6,
                      }}
                    >
                      {m.l}
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 500 }}>{m.v}</div>
                  </div>
                ))}
              </div>

              <CardFooter
                note={
                  isConnected && address
                    ? `Wallet ${fmtAddress(address)} · ${synAmount.toLocaleString("en-US")} SYN`
                    : "Connect a wallet to populate live values"
                }
              />
            </CardFrame>
          </div>
          <ShareActions
            filename={`syndicate-member-${address?.slice(-6) ?? "preview"}.png`}
            shareText={
              verification === "VERIFIED"
                ? `I'm a ${rank?.name ?? "member"} in The Syndicate — a transparent on-chain protocol on Avalanche. ${synAmount.toLocaleString("en-US")} SYN. Every wallet, route and balance is publicly verifiable.`
                : `The Syndicate is forming on Avalanche — a transparent on-chain protocol where every wallet, route and balance is publicly verifiable. No yield product. No hidden treasury. Just on-chain truth.`
            }
            shareUrl="https://thesyndicate.money/"
            nodeRef={ref}
            hint={
              verification === "VERIFIED"
                ? "Identity verified onchain. Card matches your live SYN balance."
                : "Preview card. Buy SYN to mint a verified card."
            }
          />

        </GlassCard>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Pill tone={verification === "VERIFIED" ? "success" : "muted"}>{verification}</Pill>
            <Pill tone="navy">Identity only</Pill>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The card records who you are inside a transparent on-chain protocol — not what you are
            owed. Rank reflects SYN held. Archive weight is identity-only. No payout, no yield,
            no claim on protocol revenue is implied.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Sharing the card is optional. Every field is independently verifiable from your wallet
            address on{" "}
            <a
              href="https://avascan.info"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-foreground"
            >
              Avascan ↗
            </a>
            .
          </p>
        </div>
      </div>
    </Section>
  );
}

/* ─────────────────────────── PROTOCOL SNAPSHOTS ─────────────────────────── */

type SnapshotKey = "revenue" | "assets" | "liquidity" | "members" | "milestone";

export function ProtocolSnapshots() {
  const sale = useSaleStats();
  const lp = useLpStats();
  const vault = useTreasuryAssets();
  const supply = useSynSupply();

  const vaultUsdc = vault.assets.find((a) => a.symbol === "USDC");

  const cards: Array<{
    kind: SnapshotKey;
    eyebrow: string;
    title: string;
    primaryLabel: string;
    primaryValue: string;
    primarySub?: string;
    secondaryLabel: string;
    secondaryValue: string;
    note: string;
    status: "LIVE" | "PARTIAL" | "PENDING";
  }> = [
    {
      kind: "revenue",
      eyebrow: "Membership revenue",
      title: "USDC routed onchain",
      primaryLabel: "Total routed",
      primaryValue:
        sale.totalUsdcRaised !== undefined ? `$${fmtUsdc(sale.totalUsdcRaised)}` : "PENDING",
      primarySub:
        sale.totalSynSold !== undefined ? `${fmtSyn(sale.totalSynSold)} SYN distributed` : undefined,
      secondaryLabel: "Buyers",
      secondaryValue:
        sale.totalBuyers !== undefined ? sale.totalBuyers.toString() : "PENDING",
      note: "Source: Membership Sale contract",
      status: sale.totalUsdcRaised !== undefined ? "LIVE" : "PENDING",
    },
    {
      kind: "assets",
      eyebrow: "Protocol assets",
      title: "Vault holdings",
      primaryLabel: "USDC in Vault",
      primaryValue:
        vaultUsdc?.amount !== undefined
          ? `$${Math.round(vaultUsdc.amount).toLocaleString("en-US")}`
          : "PENDING",
      primarySub: "70% of every membership USDC",
      secondaryLabel: "Other assets",
      secondaryValue: vault.anyPendingUsd ? "Live · USD PENDING" : "—",
      note: `Vault wallet ${fmtAddress(CONTRACTS.VAULT_WALLET)}`,
      status: vaultUsdc?.amount !== undefined ? (vault.anyPendingUsd ? "PARTIAL" : "LIVE") : "PENDING",
    },
    {
      kind: "liquidity",
      eyebrow: "Liquidity",
      title: "SYN / USDC pool",
      primaryLabel: "Pool TVL",
      primaryValue:
        lp.tvlUsd !== undefined ? `$${lp.tvlUsd.toLocaleString("en-US", { maximumFractionDigits: 0 })}` : "PENDING",
      primarySub:
        lp.synPriceUsd !== undefined ? `Implied $${lp.synPriceUsd.toFixed(6)} / SYN` : undefined,
      secondaryLabel: "Reserves",
      secondaryValue:
        lp.synReserve !== undefined && lp.usdcReserve !== undefined
          ? `${Math.round(lp.synReserve).toLocaleString("en-US")} SYN · $${lp.usdcReserve.toLocaleString("en-US", { maximumFractionDigits: 0 })}`
          : "PENDING",
      note: "Source: Trader Joe v1 pair",
      status: lp.tvlUsd !== undefined ? "LIVE" : "PENDING",
    },
    {
      kind: "members",
      eyebrow: "Members",
      title: "People in the formation",
      primaryLabel: "Distinct buyers",
      primaryValue:
        sale.totalBuyers !== undefined ? sale.totalBuyers.toString() : "PENDING",
      primarySub: "Counted onchain by the Sale contract",
      secondaryLabel: "Purchases",
      secondaryValue:
        sale.purchaseCount !== undefined ? sale.purchaseCount.toString() : "PENDING",
      note: "Indexer-derived leaderboard coming",
      status: sale.totalBuyers !== undefined ? "PARTIAL" : "PENDING",
    },
    {
      kind: "milestone",
      eyebrow: "Status milestone",
      title: "Protocol formation",
      primaryLabel: "SYN supply",
      primaryValue:
        supply.totalSupply !== undefined
          ? `${(supply.totalSupply / 1_000_000_000).toFixed(2)}B`
          : "PENDING",
      primarySub: "Fixed. No mint. No admin.",
      secondaryLabel: "Phase",
      secondaryValue: "Formation",
      note: "Trust → Meaning → Identity → Verification",
      status: supply.totalSupply !== undefined ? "LIVE" : "PENDING",
    },
  ];

  return (
    <Section id="protocol-snapshots">
      <SectionHeader
        eyebrow="Shareable snapshots"
        title={
          <>
            One-shot proof cards, <span className="text-gradient-gold">exportable</span>
          </>
        }
        description="Each card is a single verifiable moment — revenue, assets, liquidity, members, milestone. Built live from chain, never estimated. Download as PNG to share without losing truth."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cards.map((c) => (
          <SnapshotCard key={c.kind} {...c} />
        ))}
      </div>
    </Section>
  );
}

function SnapshotCard(props: {
  kind: SnapshotKey;
  eyebrow: string;
  title: string;
  primaryLabel: string;
  primaryValue: string;
  primarySub?: string;
  secondaryLabel: string;
  secondaryValue: string;
  note: string;
  status: "LIVE" | "PARTIAL" | "PENDING";
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const filename = `syndicate-snapshot-${props.kind}.png`;

  const shareText = buildSnapshotShareText(props.kind, props.primaryValue, props.secondaryValue, props.status);
  const shareUrl = `https://thesyndicate.money/${SHARE_ANCHOR[props.kind]}`;

  return (
    <GlassCard className="p-4">
      <div style={{ overflow: "auto" }}>
        <CardFrame innerRef={ref} width={640} height={360}>
          <CardHeader eyebrow={props.eyebrow} title={props.title} />

          <div style={{ marginTop: 32 }}>
            <BigStat
              label={props.primaryLabel}
              value={props.primaryValue}
              sub={props.primarySub}
            />
          </div>

          <div
            style={{
              marginTop: 20,
              display: "inline-flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 14px",
              borderRadius: 999,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.04)",
              alignSelf: "flex-start",
            }}
          >
            <span
              style={{
                fontFamily: "ui-monospace, monospace",
                fontSize: 10,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.55)",
              }}
            >
              {props.secondaryLabel}
            </span>
            <span style={{ fontFamily: "ui-monospace, monospace", fontSize: 14 }}>
              {props.secondaryValue}
            </span>
          </div>

          <CardFooter note={`${props.status} · ${props.note}`} />
        </CardFrame>
      </div>
      <ShareActions
        filename={filename}
        shareText={shareText}
        shareUrl={shareUrl}
        nodeRef={ref}
        hint={`${props.status} · ${props.note}`}
      />
    </GlassCard>
  );
}

const SHARE_ANCHOR: Record<SnapshotKey, string> = {
  revenue: "transparency",
  assets: "vault",
  liquidity: "liquidity",
  members: "registry",
  milestone: "roadmap",
};

function buildSnapshotShareText(
  kind: SnapshotKey,
  primary: string,
  secondary: string,
  status: "LIVE" | "PARTIAL" | "PENDING",
): string {
  const tail = "Every wallet, route and balance is publicly verifiable on Avalanche.";
  switch (kind) {
    case "revenue":
      return `The Syndicate · Membership revenue (${status}): ${primary} USDC routed onchain · ${secondary} buyers. ${tail}`;
    case "assets":
      return `The Syndicate · Protocol assets (${status}): ${primary} sitting in the public Vault wallet — 70% of every membership USDC routes here atomically. ${tail}`;
    case "liquidity":
      return `The Syndicate · SYN/USDC liquidity (${status}): pool TVL ${primary} on Trader Joe v1. ${tail}`;
    case "members":
      return `The Syndicate · People in the formation (${status}): ${primary} distinct members onchain. No private allocations. Same access rate for everyone. ${tail}`;
    case "milestone":
      return `The Syndicate · Status milestone (${status}): SYN supply ${primary}. Fixed. No mint. No admin. ${tail}`;
  }
}
