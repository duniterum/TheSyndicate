// ─────────────────────────────────────────────────────────────────────────
// CockpitProof — Wave C5 · "Verify & Context" + "Claim → Source"
//
// Answers, inside the cockpit, the trust questions:
//   • What can I verify?            → on-chain addresses + explorer links
//   • Which contracts power this?    → the contract roster below
//   • Which claims are LIVE?         → the Claim → Source table
//   • What is not live yet?          → PENDING rows, never hidden, never faked
//
// TRUTH RULES (pinned by cockpit-proof-gating.test.ts):
//   • Every address + status is read from syndicate-config CONTRACTS via
//     isLiveAddress / explorerUrlFor — NO hardcoded 0x… literals here.
//   • Status vocabulary is LIVE / PENDING only — never SIMULATED / MOCK / DEMO.
//   • Seat Record (ERC-721) is shown as PENDING (not deployed) — no fake supply,
//     no "Genesis NFT", no countdown, no financial-return language.
//   • Claim sources are limited to: contract read · indexed event ·
//     derived config · pending future contract.
// ─────────────────────────────────────────────────────────────────────────

import {
  CONTRACTS,
  type ContractKey,
  isLiveAddress,
  explorerUrlFor,
  explorerUrlForAddress,
} from "@/lib/syndicate-config";
import { GlassCard, StatusPill } from "@/components/syndicate/Primitives";

// ─── Verify & Context — the contracts + wallets that power the cockpit ───
type ProofEntry = { label: string; key: ContractKey; note?: string };

const PROOF_ENTRIES: ProofEntry[] = [
  { label: "SYN Token (ERC-20)", key: "SYN_CONTRACT_ADDRESS" },
  { label: "Membership Sale", key: "MEMBERSHIP_SALE_CONTRACT_ADDRESS" },
  { label: "Archive1155 (artifacts)", key: "ARCHIVE_NFT_CONTRACT_ADDRESS" },
  { label: "LP Pool · Trader Joe SYN/USDC", key: "LP_PAIR_ADDRESS" },
  {
    label: "Vault wallet",
    key: "VAULT_WALLET",
    note: "Receives 70% of every USDC purchase · public wallet — programmatic Vault contract PENDING",
  },
  { label: "Liquidity wallet", key: "LIQUIDITY_WALLET", note: "Receives 20% of every USDC purchase" },
  { label: "Operations wallet", key: "OPERATIONS_WALLET", note: "Receives 10% of every USDC purchase" },
];

const shortAddr = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;

function ProofRow({ entry }: { entry: ProofEntry }) {
  const addr = CONTRACTS[entry.key];
  const live = isLiveAddress(addr);
  const href = explorerUrlFor(entry.key) ?? explorerUrlForAddress(addr);

  return (
    <li className="flex flex-wrap items-center gap-2 py-2.5 min-w-0">
      <StatusPill status={live ? "LIVE" : "PENDING"} withDot={live} />
      <span className="text-sm text-foreground flex-1 min-w-0">
        {entry.label}
        {entry.note && (
          <span className="block text-[11px] text-muted-foreground leading-snug mt-0.5">
            {entry.note}
          </span>
        )}
      </span>
      {live && href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="mono text-[11px] text-muted-foreground hover:text-[var(--gold)] underline-offset-4 hover:underline shrink-0 tabular-nums"
        >
          {shortAddr(addr)} ↗
        </a>
      ) : (
        <span className="mono text-[11px] text-muted-foreground/60 shrink-0">
          not deployed
        </span>
      )}
    </li>
  );
}

// ─── Claim → Source — where every cockpit number actually comes from ───
type SourceKind = "contract read" | "indexed event" | "derived config" | "pending";

const KIND_TONE: Record<SourceKind, string> = {
  "contract read": "text-[var(--gold)] border-[var(--gold)]/40",
  "indexed event": "text-[var(--navy-soft)] border-[var(--navy-soft)]/40",
  "derived config": "text-foreground/80 border-border/60",
  pending: "text-muted-foreground border-border/50",
};

type ClaimEntry = { claim: string; source: string; kind: SourceKind };

const CLAIM_ENTRIES: ClaimEntry[] = [
  { claim: "Member number", source: "Holder index — purchase order from sale events", kind: "indexed event" },
  { claim: "SYN received", source: "Membership Sale — TokensPurchased events", kind: "indexed event" },
  { claim: "USDC routed", source: "Membership Sale — purchase amount, 70/20/10 split enforced on-chain", kind: "indexed event" },
  { claim: "Artifacts owned", source: "Archive1155 — balanceOf read", kind: "contract read" },
  { claim: "Artifact mintability", source: "Archive1155 — active + paused reads · mint shown only when active and not paused", kind: "contract read" },
  { claim: "Chapter", source: "Derived from member number · chapters.ts thresholds", kind: "derived config" },
  { claim: "Rank / recognition", source: "Derived from USDC routed · RANKS_V2 ladder", kind: "derived config" },
  { claim: "Live activity", source: "Protocol events — indexed on-chain movement", kind: "indexed event" },
  { claim: "Seat Record (ERC-721)", source: "Future identity contract — not deployed", kind: "pending" },
];

function KindBadge({ kind }: { kind: SourceKind }) {
  return (
    <span
      className={`mono text-[9px] uppercase tracking-[0.16em] px-1.5 py-0.5 rounded border shrink-0 ${KIND_TONE[kind]}`}
    >
      {kind}
    </span>
  );
}

function ClaimRow({ entry }: { entry: ClaimEntry }) {
  return (
    <li className="flex flex-wrap items-center gap-2 py-2.5 min-w-0">
      <span className="text-sm text-foreground w-full sm:w-40 shrink-0">
        {entry.claim}
      </span>
      <span className="text-xs text-muted-foreground flex-1 min-w-0">
        {entry.source}
      </span>
      <KindBadge kind={entry.kind} />
    </li>
  );
}

// ─── Public component ───────────────────────────────────────────────────
export function CockpitProof() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-3">
      {/* Verify & Context */}
      <GlassCard className="p-3 md:p-4">
        <div className="mb-2 flex items-center gap-2">
          <span className="mono text-[10px] uppercase tracking-[0.22em] text-[var(--gold)]">
            Verify & Context
          </span>
          <span className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            · contracts that power this cockpit
          </span>
        </div>
        <ul className="divide-y divide-border/40">
          {PROOF_ENTRIES.map((e) => (
            <ProofRow key={e.key} entry={e} />
          ))}
          {/* Future identity contract — honestly PENDING, not deployed. */}
          <li className="flex flex-wrap items-center gap-2 py-2.5 min-w-0">
            <StatusPill status="PENDING" withDot={false} />
            <span className="text-sm text-foreground flex-1 min-w-0">
              Seat Record (ERC-721)
              <span className="block text-[11px] text-muted-foreground leading-snug mt-0.5">
                Future identity contract — not deployed
              </span>
            </span>
            <span className="mono text-[11px] text-muted-foreground/60 shrink-0">
              not deployed
            </span>
          </li>
        </ul>
        <p className="mt-3 pt-3 border-t border-border/40 mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground leading-relaxed">
          Every LIVE row links to its on-chain address. PENDING means no contract
          exists yet — never simulated, never implied live.
        </p>
      </GlassCard>

      {/* Claim → Source */}
      <GlassCard className="p-3 md:p-4">
        <div className="mb-2 flex items-center gap-2">
          <span className="mono text-[10px] uppercase tracking-[0.22em] text-[var(--gold)]">
            Claim → Source
          </span>
          <span className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            · where every number comes from
          </span>
        </div>
        <ul className="divide-y divide-border/40">
          {CLAIM_ENTRIES.map((e) => (
            <ClaimRow key={e.claim} entry={e} />
          ))}
        </ul>
        <p className="mt-3 pt-3 border-t border-border/40 mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground leading-relaxed">
          Contract read = live on-chain. Indexed event = derived from indexed
          on-chain events. Derived config = computed from on-chain values.
          Pending = no contract yet.
        </p>
      </GlassCard>
    </div>
  );
}
