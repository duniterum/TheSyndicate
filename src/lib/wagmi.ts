// Wagmi config with a fallback transport on Avalanche C-Chain.
//
// We try the primary public RPC first, then fall back to a secondary
// endpoint on failure. Endpoint reachability is surfaced separately by
// `useArchiveRpcHealth()` in `archive-rpc-health.ts`; viem's `fallback`
// transport handles the actual retry/rotation under the hood.
import { createConfig } from "wagmi";
import { fallback, http } from "viem";
import { avalanche as wagmiAvalanche } from "wagmi/chains";
import { injected } from "wagmi/connectors";
import {
  AVALANCHE_RPC_ENDPOINTS,
} from "./syndicate-config";

// IMPORTANT: blockExplorers.default MUST be a bare origin (no path).
// MetaMask, viem.getExplorerLink, and other wallet UIs append
// "/tx/<hash>" or "/address/<addr>" to the configured URL. Avascan's
// canonical paths live under "/blockchain/c/...", so using Avascan as
// the default explorer produced dead links like
// "https://avascan.info/tx/<hash>" → 404. Snowtrace's tx/address paths
// are stable at the origin (Etherscan-style), so we use Snowtrace as
// the wallet-facing default and keep Avascan + Routescan as named
// extras for in-app links that build the full canonical path themselves.
export const avalanche = {
  ...wagmiAvalanche,
  blockExplorers: {
    default: {
      name: "Snowtrace",
      url: "https://snowtrace.io",
    },
    snowtrace: {
      name: "Snowtrace",
      url: "https://snowtrace.io",
    },
    routescan: {
      name: "Routescan",
      url: "https://routescan.io",
    },
    avascan: {
      name: "Avascan",
      url: "https://avascan.info/blockchain/c",
    },
  },
} as const;

export const wagmiConfig = createConfig({
  chains: [avalanche],
  connectors: [injected({ shimDisconnect: true })],
  transports: {
    [avalanche.id]: fallback(
      [
        ...AVALANCHE_RPC_ENDPOINTS.map((endpoint) =>
          http(endpoint.url, { name: endpoint.label }),
        ),
      ],
      { rank: false, retryCount: 1 },
    ),
  },
  ssr: true,
});

declare module "wagmi" {
  interface Register {
    config: typeof wagmiConfig;
  }
}
