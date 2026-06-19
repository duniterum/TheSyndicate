import { Link, useRouterState } from "@tanstack/react-router";

const LABELS: Record<string, string> = {
  activity: "Activity",
  ai: "AI Layer",
  chapters: "Chapters",
  docs: "Docs",
  episodes: "Chapters",
  faq: "FAQ",
  join: "Join",
  liquidity: "Liquidity",
  nfts: "Archive",
  ranks: "Ranks",
  registry: "Protocol Registry",
  roadmap: "Roadmap",
  token: "SYN Token",
  tokenomics: "Tokenomics",
  transparency: "Transparency",
  vault: "The Vault",
  whitepaper: "Whitepaper",
};

/**
 * Breadcrumbs — minimal IR-style trail. Rendered on every non-home page via
 * PageShell. Single source of truth for route → label mapping; emits BreadcrumbList
 * JSON-LD for crawlers.
 */
export function Breadcrumbs() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  if (!pathname || pathname === "/") return null;
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return null;

  const trail = segments.map((seg, i) => {
    const href = "/" + segments.slice(0, i + 1).join("/");
    const label = LABELS[seg] ?? seg.replace(/-/g, " ");
    return { href, label };
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://thesyndicate.money/" },
      ...trail.map((t, i) => ({
        "@type": "ListItem",
        position: i + 2,
        name: t.label,
        item: `https://thesyndicate.money${t.href}`,
      })),
    ],
  };

  return (
    <nav
      aria-label="Breadcrumb"
      className="mx-auto max-w-7xl px-5 md:px-8 pt-6 md:pt-8"
    >
      <ol className="flex flex-wrap items-center gap-1.5 mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        <li>
          <Link to="/" className="hover:text-[var(--gold)] transition-colors">
            Home
          </Link>
        </li>
        {trail.map((t, i) => {
          const isLast = i === trail.length - 1;
          return (
            <li key={t.href} className="flex items-center gap-1.5">
              <span aria-hidden className="text-muted-foreground/50">/</span>
              {isLast ? (
                <span className="text-foreground" aria-current="page">
                  {t.label}
                </span>
              ) : (
                <Link to={t.href as any} className="hover:text-[var(--gold)] transition-colors">
                  {t.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </nav>
  );
}
