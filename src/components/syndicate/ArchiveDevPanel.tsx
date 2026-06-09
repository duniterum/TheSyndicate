// ArchiveDevPanel — compact diagnostic panel for the First Signal mint.
//
// Visibility rule (constitutional: zero clutter in production):
//   - Shown when `import.meta.env.DEV` is true (preview / local dev), OR
//   - When the URL contains `?debug=1` (founder live verification on prod).
//   - Otherwise renders nothing.
//
// It surfaces the exact contract reads the mint flow depends on, so any
// "why is the CTA stuck?" question can be answered at a glance:
//   wallet · chainId · USDC balance · allowance · mint price · isMintable
//   · current CTA phase.
import { useEffect, useState } from "react";
import { useAccount, useChainId, useReadContracts } from "wagmi";
import { ERC20_ABI } from "@/lib/sale-abi";
import { ARCHIVE_NFT_ABI } from "@/lib/archive-nft-abi";
import {
  ARCHIVE_NFT_CONTRACT_ADDRESS,
  AVALANCHE_CHAIN_ID,
  CONTRACTS,
  USDC_DECIMALS,
} from "@/lib/syndicate-config";
import { decideMintCta } from "@/lib/mint-phase";
import type { ArchiveIdRead } from "@/lib/archive-nft-hooks";

const ARCHIVE = ARCHIVE_NFT_CONTRACT_ADDRESS as `0x${string}`;
const USDC = CONTRACTS.USDC_CONTRACT_ADDRESS as `0x${string}`;
const ID = 1n;

function shouldRender() {
  if (typeof import.meta !== "undefined" && (import.meta as any).env?.DEV) return true;
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("debug") === "1";
}

function fmtUsdc(v?: bigint) {
  if (v === undefined) return "—";
  return `${(Number(v) / 10 ** USDC_DECIMALS).toFixed(2)} USDC`;
}

function fmtAddr(a?: string) {
  return a ? `${a.slice(0, 6)}…${a.slice(-4)}` : "—";
}

export function ArchiveDevPanel({ read }: { read: ArchiveIdRead | undefined }) {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => setEnabled(shouldRender()), []);

  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const wallet = address as `0x${string}` | undefined;

  const reads = useReadContracts({
    allowFailure: true,
    contracts: wallet
      ? [
          { address: USDC, abi: ERC20_ABI, functionName: "balanceOf", args: [wallet] },
          { address: USDC, abi: ERC20_ABI, functionName: "allowance", args: [wallet, ARCHIVE] },
          { address: ARCHIVE, abi: ARCHIVE_NFT_ABI, functionName: "balanceOf", args: [wallet, ID] },
        ]
      : [],
    query: { enabled: Boolean(wallet) && enabled, refetchInterval: 15_000 },
  });

  if (!enabled) return null;

  const balance = reads.data?.[0]?.status === "success" ? (reads.data[0].result as bigint) : undefined;
  const allowance = reads.data?.[1]?.status === "success" ? (reads.data[1].result as bigint) : undefined;
  const owned = reads.data?.[2]?.status === "success" ? (reads.data[2].result as bigint) : undefined;

  const art = read?.artifact;
  const required = art?.priceUsdc;
  const phase = decideMintCta({
    eligibilityOk:
      !!art && art.definitionFrozen === true && art.active === true && art.rendererMode === 1 &&
      read?.remainingSupply !== undefined && (read?.remainingSupply ?? 0n) > 0n,
    isConnected,
    wrongChain: isConnected && chainId !== AVALANCHE_CHAIN_ID,
    isMintableConnected: read?.isMintableConnected,
    balance,
    allowance,
    required,
    mintConfirmed: false,
    mintInFlight: false,
  });

  const rows: Array<[string, string]> = [
    ["Wallet", isConnected ? fmtAddr(address) : "(not connected)"],
    ["Chain ID", String(chainId)],
    ["Expected chain", `${AVALANCHE_CHAIN_ID} (Avalanche)`],
    ["USDC balance", fmtUsdc(balance)],
    ["USDC allowance", fmtUsdc(allowance)],
    ["Mint price", fmtUsdc(required)],
    ["isMintable(wallet)", read?.isMintableConnected === undefined ? "—" : String(read.isMintableConnected)],
    ["Remaining supply", read?.remainingSupply !== undefined ? read.remainingSupply.toString() : "—"],
    ["You own (ID 1)", owned !== undefined ? owned.toString() : "—"],
    ["Renderer mode", art?.rendererMode !== undefined ? String(art.rendererMode) : "—"],
    ["Definition frozen", art?.definitionFrozen === undefined ? "—" : String(art.definitionFrozen)],
    ["CTA phase", phase],
  ];

  return (
    <aside
      aria-label="Archive dev panel"
      className="mt-4 rounded-md border border-dashed border-border/60 bg-background/60 p-3 text-[10px] mono"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="uppercase tracking-[0.18em] text-muted-foreground">
          Dev · Archive Mint Diagnostics
        </span>
        <span className="text-muted-foreground/60">?debug=1 to toggle</span>
      </div>
      <dl className="grid grid-cols-2 gap-x-3 gap-y-1">
        {rows.map(([k, v]) => (
          <div key={k} className="contents">
            <dt className="text-muted-foreground">{k}</dt>
            <dd className="text-foreground break-all">{v}</dd>
          </div>
        ))}
      </dl>
    </aside>
  );
}
