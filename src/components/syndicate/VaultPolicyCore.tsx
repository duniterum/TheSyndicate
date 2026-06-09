import { useReadContracts } from "wagmi";
import { formatUnits } from "viem";
import { VAULT_ALLOCATION, CONTRACTS, USDC_DECIMALS, explorerUrlForAddress } from "@/lib/syndicate-config";
import { ERC20_ABI } from "@/lib/sale-abi";
import { GlassCard, Pill, Section, SectionHeader, StatusPill } from "@/components/syndicate/Primitives";

/**
 * The honest, always-visible 70/20/10 policy card.
 * Each bucket shows BOTH the policy percentage AND the live USDC currently
 * held by the routing wallet for that bucket. No mock numbers — every dollar
 * is read directly from USDC.balanceOf on the relevant wallet.
 */
const USDC = CONTRACTS.USDC_CONTRACT_ADDRESS as `0x${string}`;

const fmtUsd = (n: number | undefined) =>
  n === undefined ? "—" : `$${n.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;

export function VaultPolicyCore() {
  const q = useReadContracts({
    allowFailure: true,
    contracts: [
      { address: USDC, abi: ERC20_ABI, functionName: "balanceOf", args: [CONTRACTS.VAULT_WALLET as `0x${string}`] },
      { address: USDC, abi: ERC20_ABI, functionName: "balanceOf", args: [CONTRACTS.LIQUIDITY_WALLET as `0x${string}`] },
      { address: USDC, abi: ERC20_ABI, functionName: "balanceOf", args: [CONTRACTS.OPERATIONS_WALLET as `0x${string}`] },
    ],
    query: { refetchInterval: 60_000, staleTime: 30_000 },
  });
  const ok = (i: number) => {
    const r = q.data?.[i];
    if (!r || r.status !== "success") return undefined;
    return Number(formatUnits(r.result as bigint, USDC_DECIMALS));
  };

  const rows = [
    {
      label: "Vault",
      pct: VAULT_ALLOCATION.vaultAssets,
      hint: "Long-term Vault backing",
      live: ok(0),
      address: CONTRACTS.VAULT_WALLET,
    },
    {
      label: "Liquidity",
      pct: VAULT_ALLOCATION.liquidityReinforcement,
      hint: "DEX liquidity depth",
      live: ok(1),
      address: CONTRACTS.LIQUIDITY_WALLET,
    },
    {
      label: "Operations",
      pct: VAULT_ALLOCATION.operationsCommunity,
      hint: "Build, ops, and community",
      live: ok(2),
      address: CONTRACTS.OPERATIONS_WALLET,
    },
  ];

  return (
    <Section id="vault-policy-core">
      <SectionHeader
        eyebrow="USDC Routing — Live"
        title={<>70 / 20 / 10 with <span className="text-gradient-gold">real dollars</span></>}
        description="Every USDC purchase routes across three on-chain wallets. The percentages are the policy; the dollars are what each wallet holds right now."
      />
      <div className="flex items-center gap-2 mb-3">
        <StatusPill status="LIVE" />
        <span className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          USDC.balanceOf · refreshed every 60s
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {rows.map((r) => {
          const href = explorerUrlForAddress(r.address);
          return (
            <GlassCard key={r.label} className="p-5">
              <div className="flex items-center justify-between gap-2">
                <Pill tone="gold">{(r.pct * 100).toFixed(0)}%</Pill>
                <span className="mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">Live</span>
              </div>
              <div className="mt-3 text-base font-semibold">{r.label}</div>
              <div className="mt-1 mono text-2xl font-semibold text-gradient-gold leading-none">
                {fmtUsd(r.live)}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{r.hint}</p>
              {href && (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-block mono text-[10px] uppercase tracking-[0.18em] text-foreground hover:text-[var(--gold)]"
                >
                  Verify wallet ↗
                </a>
              )}
            </GlassCard>
          );
        })}
      </div>
      <p className="mt-4 text-xs text-muted-foreground border-l-2 border-emerald-500/40 pl-3 max-w-3xl">
        USDC routing is live through the deployed Membership Sale contract. The programmatic Vault contract remains <span className="mono">PENDING</span>; today the Vault is a public wallet — every inflow is verifiable on Avascan.
      </p>
    </Section>
  );
}
