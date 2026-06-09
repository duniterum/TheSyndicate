// Backend-truth "since last visit" snapshot.
//
// Storage = a single httpOnly cookie (`syn_lv`). The client never reads or
// mutates it. On every call the server returns the PREVIOUS snapshot, then
// writes a fresh one if enough time has elapsed (debounce against reloads).
//
// This deliberately avoids localStorage so the "what changed" story is
// derived from a backend-controlled source, not a value the visitor can
// edit in DevTools.
import { createServerFn } from "@tanstack/react-start";
import { getCookie, setCookie } from "@tanstack/react-start/server";

const COOKIE = "syn_lv";
const MIN_GAP_SECONDS = 60 * 10; // do not overwrite within 10 minutes
const MAX_AGE_SECONDS = 60 * 60 * 24 * 60; // 60 days

export type VisitSnapshot = {
  unix: number;
  members?: number;
  usdcRaised?: number;
  synSold?: number;
  vaultUsdc?: number;
  liquidityUsdc?: number;
  purchases?: number;
};

export type SinceLastVisit = {
  /** Previous snapshot (from cookie). undefined on first visit. */
  previous?: VisitSnapshot;
  /** Snapshot just written this call (may equal previous if debounce kept it). */
  current?: VisitSnapshot;
  /** True the first time we ever see this visitor. */
  firstTime: boolean;
};


function safeParse(raw: string | undefined): VisitSnapshot | undefined {
  if (!raw) return undefined;
  try {
    const v = JSON.parse(raw);
    if (!v || typeof v.unix !== "number") return undefined;
    return v as VisitSnapshot;
  } catch {
    return undefined;
  }
}

export const getAndRecordLastVisit = createServerFn({ method: "POST" })
  .inputValidator((data: Omit<VisitSnapshot, "unix">) => data ?? {})
  .handler(async ({ data }): Promise<SinceLastVisit> => {
    const previous = safeParse(getCookie(COOKIE));

    const now = Math.floor(Date.now() / 1000);
    let current: VisitSnapshot = previous ?? { unix: now, ...data };
    const debounce = previous && now - previous.unix < MIN_GAP_SECONDS;

    if (!previous || !debounce) {
      current = { unix: now, ...data };
      setCookie(COOKIE, JSON.stringify(current), {
        path: "/",
        maxAge: MAX_AGE_SECONDS,
        httpOnly: true,
        sameSite: "lax",
      });
    }

    return { previous, current, firstTime: !previous };
  });
