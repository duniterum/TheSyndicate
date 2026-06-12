// Controlled Public Chronicle Integration — doctrine + invariants (Sprint 17 / 1a).
//
// Pins the public bridge between the locked Chronicle and the Institutional
// Register genesis seed. This file is INTENTIONALLY separate from
// chronicle-doctrine.test.ts (the locked-registry guard) — leaving that guard
// untouched is itself evidence the locked entries were not altered.

import { describe, it, expect } from "vitest";
import { CHRONICLE_ENTRIES, CHRONICLE_BANNED_TERMS } from "../chronicle-entries";
import {
  GENESIS_FACTS,
  deriveGenesisRegisterEntries,
} from "../institutional-register-genesis";
import { findPublicVocabularyViolations } from "../institutional-register-public";
import {
  CHRONICLE_INSTITUTIONAL_BACKING,
  GENESIS_ENTRY_ID_PREFIX,
  INSTITUTIONAL_REGISTER_HREF,
  BACKING_LABEL,
  BACKING_NOTE,
  BACKING_TX_LABEL,
  BACKING_LINEAGE_LABEL,
  buildPublicChronicleView,
} from "../chronicle-public-integration";

const LOCKED_IDS = new Set(CHRONICLE_ENTRIES.map((e) => e.id));
const FACT_IDS = new Set(GENESIS_FACTS.map((f) => f.id));
const sorted = () => [...CHRONICLE_ENTRIES].sort((a, b) => a.order - b.order);

describe("Curated overlap map integrity", () => {
  it("every map key is a real locked Chronicle entry id", () => {
    for (const key of Object.keys(CHRONICLE_INSTITUTIONAL_BACKING)) {
      expect(LOCKED_IDS.has(key), `unknown locked id "${key}"`).toBe(true);
    }
  });

  it("every mapped value is a real genesis fact id (no dangling references)", () => {
    for (const factIds of Object.values(CHRONICLE_INSTITUTIONAL_BACKING)) {
      for (const factId of factIds) {
        expect(FACT_IDS.has(factId), `unknown genesis fact "${factId}"`).toBe(true);
      }
    }
  });

  it("every mapped fact resolves to an ACTIVE genesis register entry", () => {
    const entries = deriveGenesisRegisterEntries();
    const activeIds = new Set(
      entries.filter((e) => e.entryStatus === "active").map((e) => e.id),
    );
    for (const factIds of Object.values(CHRONICLE_INSTITUTIONAL_BACKING)) {
      for (const factId of factIds) {
        expect(
          activeIds.has(GENESIS_ENTRY_ID_PREFIX + factId),
          `fact "${factId}" does not resolve to an active register entry`,
        ).toBe(true);
      }
    }
  });
});

describe("buildPublicChronicleView — shape & determinism", () => {
  it("returns exactly one item per locked entry, same order", () => {
    const locked = sorted();
    const view = buildPublicChronicleView(locked, deriveGenesisRegisterEntries());
    expect(view).toHaveLength(locked.length);
    expect(view.map((i) => i.entry.id)).toEqual(locked.map((e) => e.id));
  });

  it("passes locked entries through unmutated and mutates neither input", () => {
    const locked = sorted();
    const lockedSnapshot = JSON.stringify(locked);
    const register = deriveGenesisRegisterEntries();
    const registerSnapshot = JSON.stringify(
      register,
      (_k, v) => (typeof v === "bigint" ? v.toString() : v),
    );

    const view = buildPublicChronicleView(locked, register);

    // Entries are the SAME objects, verbatim title/body/anchors.
    view.forEach((item, i) => {
      expect(item.entry).toBe(locked[i]);
      expect(item.entry.title).toBe(locked[i].title);
      expect(item.entry.body).toBe(locked[i].body);
      expect(item.entry.anchors).toEqual(locked[i].anchors);
    });
    // Inputs unchanged.
    expect(JSON.stringify(locked)).toBe(lockedSnapshot);
    expect(
      JSON.stringify(register, (_k, v) =>
        typeof v === "bigint" ? v.toString() : v,
      ),
    ).toBe(registerSnapshot);
  });

  it("is deterministic — identical output across repeated calls", () => {
    const a = buildPublicChronicleView(sorted(), deriveGenesisRegisterEntries());
    const b = buildPublicChronicleView(sorted(), deriveGenesisRegisterEntries());
    const norm = (v: unknown) =>
      JSON.stringify(v, (_k, val) =>
        typeof val === "bigint" ? val.toString() : val,
      );
    expect(norm(a)).toBe(norm(b));
  });

  it("exposes NO standalone derived list — only {entry, backing?}", () => {
    const view = buildPublicChronicleView(sorted(), deriveGenesisRegisterEntries());
    for (const item of view) {
      expect(Object.keys(item).sort()).toEqual(
        item.backing ? ["backing", "entry"] : ["entry"],
      );
    }
  });
});

describe("buildPublicChronicleView — backing correctness", () => {
  it("backs each mapped entry with a verified register entry + lineage link", () => {
    const view = buildPublicChronicleView(sorted(), deriveGenesisRegisterEntries());
    for (const item of view) {
      const mapped = CHRONICLE_INSTITUTIONAL_BACKING[item.entry.id];
      if (mapped && mapped.length > 0) {
        expect(item.backing, `expected backing for ${item.entry.id}`).toBeDefined();
        expect(item.backing!.lineageHref).toBe(INSTITUTIONAL_REGISTER_HREF);
        expect(item.backing!.registerEntryId.startsWith(GENESIS_ENTRY_ID_PREFIX)).toBe(
          true,
        );
      } else {
        expect(item.backing).toBeUndefined();
      }
    }
  });

  it("source-transaction link, when present, is a valid explorer URL", () => {
    const view = buildPublicChronicleView(sorted(), deriveGenesisRegisterEntries());
    for (const item of view) {
      if (item.backing?.sourceTxHref) {
        expect(item.backing.sourceTxHref).toMatch(/^https?:\/\/.+\/tx\/0x[a-fA-F0-9]{64}$/);
        expect(item.backing.sourceTxLabel).toBe(BACKING_TX_LABEL);
      }
    }
  });

  it("chapter-i-opened carries a source-transaction link (tx-locked fact)", () => {
    const view = buildPublicChronicleView(sorted(), deriveGenesisRegisterEntries());
    const chapter = view.find((i) => i.entry.id === "chapter-i-opened");
    expect(chapter?.backing?.sourceTxHref).toBeDefined();
  });
});

describe("buildPublicChronicleView — ACTIVE-only publication gate", () => {
  it("never backs an entry from a non-active register entry", () => {
    // Force the membership-sale fact to a non-active status — its backing must vanish.
    const register = deriveGenesisRegisterEntries().map((e) =>
      e.id === GENESIS_ENTRY_ID_PREFIX + "membership-sale-deployment"
        ? { ...e, entryStatus: "draft" as const }
        : e,
    );
    const view = buildPublicChronicleView(sorted(), register);
    const chapter = view.find((i) => i.entry.id === "chapter-i-opened");
    expect(chapter?.backing).toBeUndefined();
  });

  it("held (coverage-limited) genesis facts can never surface as backing", () => {
    const register = deriveGenesisRegisterEntries();
    const heldIds = new Set(
      register.filter((e) => e.entryStatus !== "active").map((e) => e.id),
    );
    const view = buildPublicChronicleView(sorted(), register);
    for (const item of view) {
      if (item.backing) {
        expect(heldIds.has(item.backing.registerEntryId)).toBe(false);
      }
    }
  });

  it("degrades silently when no register entries are supplied", () => {
    const view = buildPublicChronicleView(sorted(), []);
    expect(view).toHaveLength(CHRONICLE_ENTRIES.length);
    expect(view.every((i) => i.backing === undefined)).toBe(true);
  });
});

describe("Backing copy is sober (spec §5) and Chronicle-clean", () => {
  const copy = [BACKING_LABEL, BACKING_NOTE, BACKING_TX_LABEL, BACKING_LINEAGE_LABEL];

  it("passes the public sober-language guard", () => {
    for (const s of copy) {
      expect(findPublicVocabularyViolations(s), `violation in "${s}"`).toEqual([]);
    }
  });

  it("contains no Chronicle-banned vocabulary", () => {
    const haystack = copy.join("\n").toLowerCase();
    for (const term of CHRONICLE_BANNED_TERMS) {
      expect(haystack.includes(term), `banned term "${term}" in backing copy`).toBe(
        false,
      );
    }
  });
});
