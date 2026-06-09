// Visitor memory — purely client-side, no accounts, no tracking.
//
// Stores a single snapshot of the protocol state from the last time this
// browser visited the site. On next visit we diff current state vs the
// snapshot so the user sees "what changed since you last visited".
//
// Storage: localStorage, single JSON blob. Reset = clear the key.

import { useEffect, useState } from "react";

const KEY = "syndicate.lastVisit.v1";
const MIN_GAP_SECONDS = 600; // ignore reloads within 10 minutes

export type VisitSnapshot = {
  unix: number;
  members: number | undefined;
  usdcRaised: number | undefined;
  synSold: number | undefined;
  purchases: number | undefined;
  vaultUsdc: number | undefined;
  liquidityUsdc: number | undefined;
  /** Milestone IDs already reached at snapshot time. */
  milestonesReached: string[];
};

export type VisitorMemoryState = {
  previous: VisitSnapshot | undefined;
  /** True once we have committed the *current* snapshot (so deltas freeze). */
  ready: boolean;
};

function read(): VisitSnapshot | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed.unix !== "number") return undefined;
    return parsed as VisitSnapshot;
  } catch {
    return undefined;
  }
}

function write(snap: VisitSnapshot) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(snap));
  } catch {
    // quota / privacy mode — degrade silently
  }
}

/**
 * Read the previous snapshot ONCE on mount, then write a fresh snapshot
 * (debounced by MIN_GAP_SECONDS so refresh storms don't overwrite history).
 *
 * Pass the current state in; this hook handles persistence + diffing.
 */
export function useVisitorMemory(current: Omit<VisitSnapshot, "unix"> & { ready: boolean }): VisitorMemoryState {
  const [previous, setPrevious] = useState<VisitSnapshot | undefined>(undefined);
  const [ready, setReady] = useState(false);

  // Capture the previous snapshot once, on first mount.
  useEffect(() => {
    setPrevious(read());
    setReady(true);
  }, []);

  // Once current data is ready and stable enough, commit a new snapshot —
  // but only if enough time has elapsed since the previous visit (so a
  // page reload doesn't clobber yesterday's snapshot).
  useEffect(() => {
    if (!current.ready) return;
    const now = Math.floor(Date.now() / 1000);
    const prev = read();
    if (prev && now - prev.unix < MIN_GAP_SECONDS) return;
    write({ unix: now, ...current });
  }, [current.ready, current.members, current.usdcRaised, current.purchases]);

  return { previous, ready };
}

export function clearVisitorMemory() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
