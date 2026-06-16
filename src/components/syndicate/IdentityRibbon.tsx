// Identity Ribbon — slim persistent seat-context strip.
//
// Mounted once by PageShell. Three states only:
//   1. No wallet            → "Connect wallet to see your seat" + next-member preview if live.
//   2. Wallet, not a member → "No seat yet" + Join CTA.
//   3. Wallet + seat        → Member # · Chapter · First Signal / Patron Seal ownership.
//
// Source-of-truth hooks only. No fake ownership. No localStorage as proof of
// ownership. No wealth / yield / governance language. Operator vocabulary
// banned here — visitor copy only.
//
// Authority: docs/SYNDICATE_OPERATING_SYSTEM.md (Identity Engine).

import { Link } from "@tanstack/react-router";
import { useReadContract } from "wagmi";
import { useWalletSession } from "@/lib/wallet-session";
import { useHolderIndex } from "@/lib/holder-index";
import { useProtocolPulse } from "@/lib/protocol-pulse";
import { ARCHIVE_NFT_ABI } from "@/lib/archive-nft-abi";
import { ARCHIVE_NFT_CONTRACT_ADDRESS } from "@/lib/syndicate-config";
import { CHAIN_REGISTRY } from "@/lib/chain-registry";

function chapterLabel(c: string | undefined): string {
  switch (c) {
    case "genesis-signal":     return "Genesis Signal";
    case "first-thousand":     return "First Thousand";
    case "the-expansion":      return "The Expansion";
    case "first-ten-thousand": return "First Ten Thousand";
    case "open-era":           return "Open Era";
    default:                   return "—";
  }
}

function useOwnsArtifact(address: `0x${string}` | null, id: number): boolean | undefined {
  const { data } = useReadContract({
    abi: ARCHIVE_NFT_ABI,
    address: ARCHIVE_NFT_CONTRACT_ADDRESS as `0x${string}`,
    functionName: "balanceOf",
    args: address ? [address, BigInt(id)] : undefined,
    chainId: CHAIN_REGISTRY.id,
    query: { enabled: !!address },
  });
  if (data === undefined) return undefined;
  try { return (data as bigint) > 0n; } catch { return undefined; }
}

export function IdentityRibbon() {
  const session = useWalletSession();
  const idx = useHolderIndex();
  const pulse = useProtocolPulse();

  const me = session.address ? idx.getByWallet(session.address) : undefined;
  const ownsFirstSignal = useOwnsArtifact(session.address, 1);
  const ownsPatronSeal = useOwnsArtifact(session.address, 3);

  // State 1 — no wallet
  if (!session.isConnected || !session.address) {
    return (
      <div
        role="region"
        aria-label="Your seat"
        className="border-b"
        style={{ background: "color-mix(in oklab, var(--gold) 4%, var(--background))", borderColor: "var(--border)" }}
      >
        <div className="mx-auto max-w-7xl px-5 md:px-8 py-2 flex flex-wrap items-center gap-x-4 gap-y-1">
          <span className="mono inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            <span className="size-1.5 rounded-full pulse-dot" style={{ background: "var(--accent)" }} />
            Your seat
          </span>
          <span className="text-xs md:text-sm text-foreground/85">
            Connect wallet to see your place in the archive.
          </span>
          {pulse.nextMemberNumber !== undefined && (
            <span className="mono text-[10px] uppercase tracking-[0.18em] text-[var(--gold)]">
              Next seat preview · Member #{pulse.nextMemberNumber}
            </span>
          )}
          <Link
            to="/join"
            className="ml-auto mono text-[10px] uppercase tracking-[0.22em] text-[var(--navy-soft)] hover:text-[var(--gold)] underline-offset-4 hover:underline"
          >
            Join The Syndicate →
          </Link>
        </div>
      </div>
    );
  }

  // State 2 — wallet connected, no member record yet
  if (!me) {
    return (
      <div
        role="region"
        aria-label="Your seat"
        className="border-b"
        style={{ background: "color-mix(in oklab, var(--gold) 4%, var(--background))", borderColor: "var(--border)" }}
      >
        <div className="mx-auto max-w-7xl px-5 md:px-8 py-2 flex flex-wrap items-center gap-x-4 gap-y-1">
          <span className="mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            {session.short} · no seat yet
          </span>
          <span className="text-xs md:text-sm text-foreground/85">
            This wallet has not joined. Take your place to be recorded on-chain.
          </span>
          {pulse.nextMemberNumber !== undefined && (
            <span className="mono text-[10px] uppercase tracking-[0.18em] text-[var(--gold)]">
              Next seat preview · #{pulse.nextMemberNumber}
            </span>
          )}
          <Link
            to="/join"
            className="ml-auto mono text-[10px] uppercase tracking-[0.22em] text-[var(--navy-soft)] hover:text-[var(--gold)] underline-offset-4 hover:underline"
          >
            Join The Syndicate →
          </Link>
        </div>
      </div>
    );
  }

  // State 3 — wallet connected, member
  return (
    <div
      role="region"
      aria-label="Your seat"
      className="border-b"
      style={{ background: "color-mix(in oklab, var(--gold) 6%, var(--background))", borderColor: "var(--border)" }}
    >
      <div className="mx-auto max-w-7xl px-5 md:px-8 py-2 flex flex-wrap items-center gap-x-4 gap-y-1">
        <span className="mono inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.22em] text-[var(--gold)]">
          <span className="size-1.5 rounded-full pulse-dot" style={{ background: "var(--accent)" }} />
          Your seat
        </span>
        <span className="mono text-xs md:text-sm font-semibold text-foreground">
          Member #{me.founderNumber}
        </span>
        <span className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          · {chapterLabel(me.chapter)}
        </span>
        {me.eligibility?.foundersBadge && (
          <span className="mono text-[10px] uppercase tracking-[0.2em] text-[var(--gold)]">
            · Founder
          </span>
        )}
        <span className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          · First Signal {ownsFirstSignal === undefined ? "…" : ownsFirstSignal ? "✓ owned" : "—"}
        </span>
        <span className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          · Patron Seal {ownsPatronSeal === undefined ? "…" : ownsPatronSeal ? "✓ owned" : "—"}
        </span>
        <Link
          to="/my-syndicate"
          className="ml-auto mono text-[10px] uppercase tracking-[0.22em] text-[var(--navy-soft)] hover:text-[var(--gold)] underline-offset-4 hover:underline"
        >
          My Syndicate →
        </Link>
      </div>
    </div>
  );
}
