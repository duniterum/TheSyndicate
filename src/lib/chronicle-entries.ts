// Protocol Chronicle — day-one entry registry.
//
// Constitutional sources:
//   • docs/PROTOCOL_CHRONICLE_MVP_EXECUTION_SPEC.md
//   • docs/PROTOCOL_CHRONICLE_FINAL_READINESS_REVIEW.md
//
// SIX-PART SELECTION GATE — every entry must satisfy all six:
//   1. on-chain anchor  (verifiable block / tx / address)
//   2. significance     (changes protocol state in a way future readers must know)
//   3. permanence       (still true in 10 years)
//   4. singularity      (happens once, or once per chapter)
//   5. voice fit        (protocol's first-person past/present-perfect)
//   6. protocol-centric (subject is a protocol primitive — NEVER a wallet,
//                       member number, founder, collector, or buyer)
//
// Adding an entry whose subject is a person / wallet / member-number is a
// constitutional violation and is blocked by chronicle-doctrine.test.ts.

import {
  CONTRACTS,
  SALE_DEPLOYMENT_BLOCK,
  ARCHIVE_NFT_EXPLORERS,
  explorerUrlForAddress,
} from "./syndicate-config";

/** Subject categories allowed by clause 6 (protocol-centric). */
export type ChronicleSubject = "chapter" | "archive";

export type ChronicleAnchor = {
  /** Short human label for the anchor link, e.g. "Membership Sale contract ↗" */
  label: string;
  /** Verifiable URL — explorer link to the contract / tx / block. */
  href: string;
};

export type ChronicleEntry = {
  /** Stable, URL-safe id. Never rename — used as DOM anchor and analytics key. */
  id: string;
  /** Subject category — must be one of ChronicleSubject (protocol primitives). */
  subject: ChronicleSubject;
  /**
   * Ordering key. ENTRIES ARE READ OLDEST → NEWEST.
   * Lower number = earlier. Equal numbers retain declaration order.
   */
  order: number;
  /** Headline, protocol voice, past tense. */
  title: string;
  /**
   * One paragraph, protocol's first-person plural / impersonal past tense.
   * No founder voice. No member naming. No CTA. No banned vocabulary.
   */
  body: string;
  /** One sentence answering "what changed because of this?". */
  whatChanged: string;
  /** 1–3 verifiable anchors. At least one is required. */
  anchors: ChronicleAnchor[];
};

// Canonical explorer URLs — go through the helpers so the explorer-canonical
// guard sees zero literal explorer hosts in this file.
const SALE_ADDR_HREF =
  explorerUrlForAddress(CONTRACTS.MEMBERSHIP_SALE_CONTRACT_ADDRESS) ?? "";

const ARCHIVE_ADDR_HREF = ARCHIVE_NFT_EXPLORERS.avascan;

/**
 * The three day-one Chronicle entries — locked by
 * docs/PROTOCOL_CHRONICLE_FINAL_READINESS_REVIEW.md.
 *
 * No additions are permitted without re-running the six-part gate AND a
 * constitutional review pass. The "Member #1 joined" entry was explicitly
 * REMOVED because its subject is a wallet/seat (member-centric), not a
 * protocol primitive. The first-seat fact is folded into Entry 1 as one
 * sentence describing the chapter's first member-state transition.
 */
export const CHRONICLE_ENTRIES: ReadonlyArray<ChronicleEntry> = [
  {
    id: "chapter-i-opened",
    subject: "chapter",
    order: 1,
    title: "Chapter I opened.",
    body:
      "The protocol's first chapter began when the Membership Sale contract " +
      "went live on Avalanche. Chapter I exists as a permanent coordinate: " +
      "every seat claimed within it carries that chapter as part of its " +
      "on-chain identity. The chapter is open and accumulating; the first " +
      "seat was claimed in the same window, marking the moment the chapter " +
      "transitioned from empty to inhabited.",
    whatChanged:
      "Chapter I existed for the first time, and the protocol acquired a place " +
      "for seats to be claimed in. Every later fact is anchored to this opening.",
    anchors: [
      {
        label: `Membership Sale contract ↗ · deployed at block ${SALE_DEPLOYMENT_BLOCK.toString()}`,
        href: SALE_ADDR_HREF,
      },
    ],
  },
  {
    id: "first-artifact-mintable",
    subject: "archive",
    order: 2,
    title: "The first artifact became mintable — First Signal.",
    body:
      "The protocol's archive began with a single artifact. First Signal " +
      "was activated on the Archive1155 contract and opened for public mint. " +
      "It is the first object the protocol ever issued; what comes after is " +
      "the second object, the third, and so on. The archive begins here.",
    whatChanged:
      "The archive went from empty to one. The category 'first artifact' " +
      "now has a permanent referent.",
    anchors: [
      { label: "Archive contract ↗", href: ARCHIVE_ADDR_HREF },
    ],
  },
  {
    id: "second-artifact-mintable",
    subject: "archive",
    order: 3,
    title: "A second artifact joined the archive — Patron Seal.",
    body:
      "The archive expanded for the first time. Patron Seal was activated on " +
      "the same Archive1155 contract, establishing that the archive is a " +
      "series and not a single object. The existence of the second artifact " +
      "is what makes the first one part of a lineage rather than a singleton.",
    whatChanged:
      "The archive went from one to two. The protocol acquired the concept " +
      "of an archive as a growing set rather than a single object.",
    anchors: [
      { label: "Archive contract ↗", href: ARCHIVE_ADDR_HREF },
    ],
  },
];

// ─── Selection-gate validators (pure; consumed by tests) ───────────────────

/** Vocabulary forbidden in Chronicle entries (founder/marketing/peer-comparison drift). */
export const CHRONICLE_BANNED_TERMS: ReadonlyArray<string> = [
  // founder / person framing
  "founder",
  "founders",
  "our team",
  "we built",
  // member-centric / wallet-centric framing (case-insensitive)
  "member #",
  "member#",
  "wallet 0x",
  "address 0x",
  // marketing / hype
  "huge",
  "incredible",
  "exciting",
  "amazing",
  "don't miss",
  "last chance",
  "join now",
  "mint now",
  "buy now",
  // investment / yield framing
  "roi",
  "yield",
  "returns",
  "dividend",
  "profit share",
  "appreciation",
  "passive income",
];

/** Subjects that violate clause 6 (protocol-centricity). */
export const CHRONICLE_FORBIDDEN_SUBJECT_PATTERNS: ReadonlyArray<RegExp> = [
  /\bmember\s*#\s*\d+/i,
  /\bwallet\s+0x[a-f0-9]+/i,
  /\bfounder\b/i,
  /\bcollector\b/i,
  /\bbuyer\b/i,
];

/**
 * Validate a single entry against the six-part gate.
 * Returns the list of violations (empty = passes).
 */
export function validateChronicleEntry(e: ChronicleEntry): string[] {
  const errs: string[] = [];
  // 1. on-chain anchor
  if (!e.anchors.length || !e.anchors.every((a) => /^https?:\/\//.test(a.href))) {
    errs.push(`[${e.id}] missing verifiable anchor URL`);
  }
  // 5. voice fit — no future tense markers, no first-person singular
  if (/\b(will|going to|soon|upcoming|tomorrow)\b/i.test(e.body)) {
    errs.push(`[${e.id}] body uses future tense / "soon" — Chronicle is past tense only`);
  }
  // First-person singular detection — allow "Chapter I/II/III" roman numerals.
  if (/\bI\s+(am|have|will|was|did|think|believe)\b/.test(e.body) ||
      /\bmy\s+\w/.test(e.body)) {
    errs.push(`[${e.id}] body uses first-person singular — Chronicle voice is impersonal`);
  }
  // 6. protocol-centric — subject category + forbidden patterns
  if (e.subject !== "chapter" && e.subject !== "archive") {
    errs.push(`[${e.id}] subject "${e.subject}" is not a protocol primitive`);
  }
  for (const pat of CHRONICLE_FORBIDDEN_SUBJECT_PATTERNS) {
    if (pat.test(e.title) || pat.test(e.body)) {
      errs.push(`[${e.id}] matches forbidden subject pattern ${pat}`);
    }
  }
  // banned vocabulary (case-insensitive, word-ish)
  const haystack = `${e.title}\n${e.body}\n${e.whatChanged}`.toLowerCase();
  for (const term of CHRONICLE_BANNED_TERMS) {
    if (haystack.includes(term)) {
      // Allow the literal anchor URL to contain 0x; only flag prose.
      const prose = `${e.title}\n${e.body}\n${e.whatChanged}`.toLowerCase();
      if (prose.includes(term)) {
        errs.push(`[${e.id}] contains banned term: "${term}"`);
      }
    }
  }
  return errs;
}

/** Validate ordering is strictly ascending and oldest → newest. */
export function validateChronicleOrdering(
  entries: ReadonlyArray<ChronicleEntry>,
): string[] {
  const errs: string[] = [];
  for (let i = 1; i < entries.length; i++) {
    if (entries[i].order <= entries[i - 1].order) {
      errs.push(
        `entry "${entries[i].id}" (order ${entries[i].order}) is not strictly after "${entries[i - 1].id}" (order ${entries[i - 1].order}) — Chronicle reads oldest → newest`,
      );
    }
  }
  return errs;
}
