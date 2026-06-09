import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Web3Provider } from "../components/syndicate/Web3Provider";
import { WalletAccountSynchronizer } from "../components/syndicate/WalletAccountSynchronizer";
import { WalletDebugPanel } from "../components/syndicate/WalletDebugPanel";
import { MobileJoinBar } from "../components/syndicate/MobileJoinBar";
import { StaleBuildBanner } from "../components/syndicate/StaleBuildBanner";
import { ThemeProvider, THEME_BOOT_SCRIPT } from "../lib/theme";
import { avascanTokenUrl, snowtraceTokenUrl } from "../lib/chain-registry";
import { SYNDICATE_CONFIG } from "../lib/syndicate-config";

const SYN_ADDR = SYNDICATE_CONFIG.TOKEN_CONTRACT_ADDRESS;

function NotFoundComponent() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "The Syndicate (SYN) — Experimental Utility Membership Token on Avalanche" },
      { name: "description", content: "The Syndicate is a transparent experimental utility membership system powered by SYN, a fixed-supply ERC20 token live on Avalanche C-Chain." },
      { name: "author", content: "The Syndicate" },
      { property: "og:site_name", content: "The Syndicate" },
      { property: "og:type", content: "website" },
      { property: "og:title", content: "The Syndicate (SYN) — Experimental Utility Membership Token on Avalanche" },
      { property: "og:description", content: "Fixed 1,000,000,000 SYN supply · No admin · No mint · No tax · Live on Avalanche C-Chain. Membership Sale contract is next." },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "The Syndicate (SYN) — Live on Avalanche" },
      { name: "twitter:description", content: "Transparent experimental utility membership token. Fixed supply. Live on Avalanche C-Chain." },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "apple-touch-icon", href: "/favicon.svg" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Work+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              "@id": "https://thesyndicate.money/#org",
              name: "The Syndicate",
              url: "https://thesyndicate.money/",
              sameAs: [
                avascanTokenUrl(SYN_ADDR) ?? "",
                snowtraceTokenUrl(SYN_ADDR) ?? "",
                "https://dexscreener.com/avalanche/0xe12491b79c9cfc6a07db8cd7fc8b3da0bb019389",
              ].filter(Boolean),
            },
            {
              "@type": "WebSite",
              "@id": "https://thesyndicate.money/#site",
              url: "https://thesyndicate.money/",
              name: "The Syndicate",
              publisher: { "@id": "https://thesyndicate.money/#org" },
            },
          ],
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" style={{ colorScheme: "light" }} suppressHydrationWarning>
      <head>
        {/* Set theme class BEFORE hydration to avoid a flash of light when user
            previously chose dark. Default = light when no preference exists. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} />
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Web3Provider>
          <WalletAccountSynchronizer />
          {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
          <Outlet />
          <MobileJoinBar />
          <WalletDebugPanel />
          <StaleBuildBanner />
        </Web3Provider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
