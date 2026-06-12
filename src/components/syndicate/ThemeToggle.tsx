// ThemeToggle — light/dark switcher.
//
// Variants:
//   - "icon"   (default) compact icon button for the header desktop cluster
//   - "pill"   labeled pill for the mobile drawer
//   - "mini"   ultra-compact for the sticky mobile CTA bar
//
// Persisted via lib/theme. Default = dark (Obsidian Cockpit); no system follow on first visit.

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/theme";
import { track } from "@/lib/analytics";

type Variant = "icon" | "pill" | "mini";

export function ThemeToggle({ variant = "icon", className = "" }: { variant?: Variant; className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const next: "light" | "dark" = isDark ? "light" : "dark";

  const onClick = () => {
    try { track("theme_toggle", { from: theme, to: next, surface: variant }); } catch { /* analytics best-effort */ }
    toggleTheme();
  };

  const label = `Switch to ${next} mode`;

  if (variant === "pill") {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={label}
        title={label}
        className={
          "inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-xs font-medium text-foreground hover:border-[color:var(--gold)]/60 transition-colors " +
          className
        }
      >
        {isDark ? <Sun className="size-4" aria-hidden /> : <Moon className="size-4" aria-hidden />}
        <span>{isDark ? "Light mode" : "Dark mode"}</span>
      </button>
    );
  }

  if (variant === "mini") {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={label}
        title={label}
        className={
          "inline-flex items-center justify-center size-9 rounded-md border border-border bg-card text-foreground active:scale-[0.97] transition-transform " +
          className
        }
      >
        {isDark ? <Sun className="size-4" aria-hidden /> : <Moon className="size-4" aria-hidden />}
      </button>
    );
  }

  // icon (default)
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={
        "inline-flex items-center justify-center size-9 rounded-md border border-border text-foreground hover:border-[#E3A92B] hover:text-[#E3A92B] transition-colors " +
        className
      }
    >
      {isDark ? <Sun className="size-4" aria-hidden /> : <Moon className="size-4" aria-hidden />}
    </button>
  );
}
