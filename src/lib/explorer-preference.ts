// Persisted user preference for which Avalanche C-Chain explorer the app
// should show first when rendering in-app transaction links.
//
// • Persisted in localStorage under STORAGE_KEY so the choice survives page
//   reloads and follows the user across sessions on the same device. Devices
//   sync only via the user's own browser sync — we never transmit it.
// • Defaults to "snowtrace" (matches the canonical wallet-facing default
//   documented in chain-registry.ts).
// • Reordering only — we always return all three explorer links so a
//   broken/blocked host can be sidestepped. The wallet-facing chain config
//   stays Snowtrace (bare origin) regardless of preference.

import { useEffect, useState, useCallback } from "react";

export type ExplorerId = "snowtrace" | "avascan" | "routescan";
export const EXPLORER_IDS: readonly ExplorerId[] = ["snowtrace", "avascan", "routescan"] as const;
export const DEFAULT_EXPLORER: ExplorerId = "snowtrace";

export const STORAGE_KEY = "syndicate.explorer.preferred.v1";
const EVENT = "syndicate:explorer-preference-change";

function isExplorerId(v: unknown): v is ExplorerId {
  return typeof v === "string" && (EXPLORER_IDS as readonly string[]).includes(v);
}

/** Synchronous read — safe on server (returns default). */
export function readExplorerPreference(): ExplorerId {
  if (typeof window === "undefined") return DEFAULT_EXPLORER;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return isExplorerId(raw) ? raw : DEFAULT_EXPLORER;
  } catch {
    return DEFAULT_EXPLORER;
  }
}

/** Persist a new preference and broadcast to in-tab subscribers. */
export function writeExplorerPreference(id: ExplorerId): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, id);
  } catch {
    /* quota / privacy mode — ignore */
  }
  try {
    window.dispatchEvent(new CustomEvent(EVENT, { detail: id }));
  } catch {
    /* ignore */
  }
}

/**
 * Reorder a fan-out of explorer links so the user's preferred explorer is
 * first. Unknown labels keep their original order at the tail.
 */
export function applyPreferenceOrder<T extends { label: string }>(
  items: readonly T[],
  preference: ExplorerId = readExplorerPreference(),
): T[] {
  if (items.length <= 1) return [...items];
  const preferred = items.find((i) => i.label.toLowerCase() === preference);
  if (!preferred) return [...items];
  return [preferred, ...items.filter((i) => i !== preferred)];
}

/** React hook — reactive read + setter, syncs across tabs and components. */
export function useExplorerPreference(): readonly [ExplorerId, (id: ExplorerId) => void] {
  const [pref, setPref] = useState<ExplorerId>(() => readExplorerPreference());

  useEffect(() => {
    // Resync on mount in case SSR returned the default but storage has a value.
    setPref(readExplorerPreference());
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && isExplorerId(e.newValue)) setPref(e.newValue);
    };
    const onCustom = (e: Event) => {
      const detail = (e as CustomEvent<unknown>).detail;
      if (isExplorerId(detail)) setPref(detail);
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener(EVENT, onCustom);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(EVENT, onCustom);
    };
  }, []);

  const set = useCallback((id: ExplorerId) => {
    setPref(id);
    writeExplorerPreference(id);
  }, []);

  return [pref, set] as const;
}
