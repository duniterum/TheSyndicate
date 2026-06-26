// Identity Zone — one component, three states.
//   1. Disconnected / first-time : "You could be Member #N."
//   2. Connected wallet          : "You are Member #N · Chapter X · Footprint Y."
//   3. Returning visitor         : delegates to SinceYourLastVisit (already mounted inside).
//
// Source-of-truth hooks only. No invented numbers.

import { Link } from "@tanstack/react-router";
import { useAccount } from "wagmi";
import { useProtocolPulse } from "@/lib/protocol-pulse";
import { useHolderIndex } from "@/lib/holder-index";
import { Section, SectionHeader } from "./Primitives";
import { SinceYourLastVisit } from "./SinceYourLastVisit";

export function IdentityZone() {
  const { address, isConnected } = useAccount();
  const p = useProtocolPulse();
  const idx = useHolderIndex();

  const next = p.nextMemberNumber;
  const me = isConnected && address ? idx.getByWallet(address) : undefined;

  return (
    <Section id="identity-zone">
      <SectionHeader
        eyebrow="Where you fit"
        title={<>Your place in the <span className="text-gradient-gold">archive</span></>}
        description="Membership is wallet-based. Your number, chapter, and capital footprint are derived from the same on-chain data you can verify yourself."
      />

      {/* Always render the returning-visitor delta when present */}
      <SinceYourLastVisit />

      {me ? (
        <div className="mt-3 surface elevated p-4 md:p-5 border border-[var(--gold)]/35 bg-[var(--gold)]/[0.04]">
          <div className="mono text-[10px] uppercase tracking-[0.22em] text-[var(--gold)]">
            Your seat is recorded on-chain
          </div>
          <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Field label="Member" value={`#${me.founderNumber}`} />
            <Field label="Joining Chapter" value={chapterLabel(me.chapter)} />
            <Field label="Cohort" value={me.eligibility?.foundersBadge ? "Founder" : "Member"} />
            <Field label="Sealed" value={me.firstPurchaseBlock !== undefined ? `Block ${Number(me.firstPurchaseBlock).toLocaleString()}` : "—"} />
          </div>
          <div className="mt-3 text-xs text-muted-foreground">
            This position is permanent. The chapter you joined in, the block height your seat was sealed at,
            and your member number cannot be reassigned — by anyone, ever.
          </div>
          <div className="mt-3 flex flex-wrap gap-3">
            <a
              href={`/wallet/${address}`}
              className="mono text-[10px] uppercase tracking-[0.2em] text-[var(--navy-soft)] hover:text-[var(--gold)] underline-offset-4 hover:underline"
            >
              Your wallet page →
            </a>
            <Link
              to="/chapters"
              className="mono text-[10px] uppercase tracking-[0.2em] text-[var(--navy-soft)] hover:text-[var(--gold)] underline-offset-4 hover:underline"
            >
              Your chapter →
            </Link>
            <Link
              to="/activity"
              className="mono text-[10px] uppercase tracking-[0.2em] text-[var(--navy-soft)] hover:text-[var(--gold)] underline-offset-4 hover:underline"
            >
              Events you witnessed →
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-3 surface elevated p-4 md:p-5 border border-[var(--gold)]/25 bg-[var(--gold)]/[0.03]">
          <div className="mono text-[10px] uppercase tracking-[0.22em] text-[var(--gold)]">
            Your seat is open
          </div>
          <div className="mt-1 text-base md:text-lg text-foreground">
            {next !== undefined ? (
              <>You could be <span className="font-semibold">Member #{next}</span> — permanently recorded on Avalanche.</>
            ) : (
              <>You could be the next member — permanently recorded on Avalanche.</>
            )}
          </div>
          <div className="mt-1 text-sm text-muted-foreground">
            A seat is a numbered position in the archive. One wallet, one membership.
            The chapter you join in and the block your seat was sealed at become part of your permanent record.
          </div>
          <div className="mt-3 flex flex-wrap gap-3">
            <Link
              to="/join"
              className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium tracking-wide text-[oklch(0.22_0.025_260)]"
              style={{ background: "var(--gradient-gold)", boxShadow: "var(--shadow-glow-gold)" }}
            >
              Join The Syndicate →
            </Link>
            <Link
              to="/founders"
              className="mono text-[10px] uppercase tracking-[0.2em] text-[var(--navy-soft)] hover:text-[var(--gold)] underline-offset-4 hover:underline self-center"
            >
              See who joined first →
            </Link>
          </div>
        </div>
      )}
    </Section>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border/40 bg-background/40 px-3 py-2">
      <div className="mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">{label}</div>
      <div className="mono text-base font-semibold text-foreground">{value}</div>
    </div>
  );
}

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
