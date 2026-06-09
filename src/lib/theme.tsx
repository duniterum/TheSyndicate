// Theme system for The Syndicate.
//
// Default = DARK (Obsidian Cockpit, approved Direction A). Light remains
// available via the ThemeToggle in the header (desktop) and mobile drawer /
// sticky mobile CTA bar. The preference is persisted to localStorage under
// STORAGE_KEY. We deliberately do NOT auto-follow `prefers-color-scheme` on
// first visit — the brand decision is "obsidian dark is default".
//
// To avoid a flash of incorrect theme on first paint, an inline script is
// injected in src/routes/__root.tsx (RootShell) that reads the same key and
// toggles the `.dark` class on <html> before React hydrates.

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Theme = "light" | "dark";
export const STORAGE_KEY = "syndicate.theme";

type Ctx = {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<Ctx | undefined>(undefined);

function readInitial(): Theme {
  if (typeof document === "undefined") return "dark";
  // Trust the class applied by the inline script in RootShell — single source.
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function apply(theme: Theme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (theme === "dark") root.classList.add("dark");
  else root.classList.remove("dark");
  root.style.colorScheme = theme;
  try { window.localStorage.setItem(STORAGE_KEY, theme); } catch { /* ignore */ }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Initial render MUST match the server (always "light") to avoid a hydration
  // mismatch. The boot script in RootShell has already applied the correct
  // `.dark` class to <html>, so the page looks right before React hydrates.
  // After mount we sync React state to that class — no flash, no mismatch.
  const [theme, setThemeState] = useState<Theme>("light");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setThemeState(readInitial());
    setHydrated(true);
  }, []);

  // Only write back to the DOM once we've synced from it, so the first
  // post-mount pass doesn't strip the class the boot script set.
  useEffect(() => {
    if (hydrated) apply(theme);
  }, [theme, hydrated]);

  const setTheme = useCallback((t: Theme) => setThemeState(t), []);
  const toggleTheme = useCallback(() => setThemeState((t) => (t === "dark" ? "light" : "dark")), []);

  const value = useMemo<Ctx>(() => ({ theme, setTheme, toggleTheme }), [theme, setTheme, toggleTheme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Ctx {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    // Safe fallback when used outside provider (e.g. early-mount components).
    return {
      theme: readInitial(),
      setTheme: (t) => apply(t),
      toggleTheme: () => apply(readInitial() === "dark" ? "light" : "dark"),
    };
  }
  return ctx;
}

/**
 * Inline script source — injected verbatim into the HTML <head> by
 * RootShell to set the correct class before React hydrates.
 */
export const THEME_BOOT_SCRIPT = `
(function(){try{
  var k='${STORAGE_KEY}';
  var s=localStorage.getItem(k);
  var theme=(s==='dark'||s==='light')?s:'dark';
  var r=document.documentElement;
  if(theme==='dark')r.classList.add('dark');else r.classList.remove('dark');
  r.style.colorScheme=theme;
}catch(e){}})();
`.trim();
