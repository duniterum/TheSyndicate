import { useReadContract } from "wagmi";
import { GlassCard, Section, SectionHeader, ContractLink, Pill } from "@/components/syndicate/Primitives";
import { SALE_V2_ABI } from "@/lib/sale-abi";
import { ARCHIVE_NFT_ABI } from "@/lib/archive-nft-abi";
import {
  AVALANCHE_CHAIN_ID,
  CONTRACTS,
  MEMBERSHIP_SALE_V2_CONTRACT_ADDRESS,
  SALE_V2_LIVE,
  explorerUrlForAddress,
} from "@/lib/syndicate-config";

// Live, read-only custody surface for /registry. Every address shown here is
// read directly from chain via the contract's own getter — never hardcoded — so
// it self-updates if authority ever moves. When a read is unavailable the row
// degrades to "—" with a verify-on-explorer link; it never fabricates an
// address. Neutral by design: these are administrative keys only and confer no
// rights to members.

const COMMON_QUERY = { refetchInterval: 60_000, staleTime: 30_000 } as const;

const isAddr = (a?: string): a is `0x${string}` =>
  !!a && /^0x[a-fA-F0-9]{40}$/.test(a);

const ACTIVE_SALE_ADDR =
  SALE_V2_LIVE && MEMBERSHIP_SALE_V2_CONTRACT_ADDRESS
    ? MEMBERSHIP_SALE_V2_CONTRACT_ADDRESS
    : CONTRACTS.MEMBERSHIP_SALE_CONTRACT_ADDRESS;

const ARCHIVE_ADDR = CONTRACTS.ARCHIVE_NFT_CONTRACT_ADDRESS;

type CustodyRow = {
  key: string;
  scope: string;
  role: string;
  contractHref: string | null;
  data: `0x${string}` | undefined;
  isLoading: boolean;
  enabled: boolean;
};

function CustodyValue({ row }: { row: CustodyRow }) {
  if (!row.enabled) {
    return <span className="mono text-xs text-muted-foreground">PENDING</span>;
  }
  if (isAddr(row.data)) {
    return (
      <ContractLink address={row.data} explorerHref={explorerUrlForAddress(row.data)} />
    );
  }
  if (row.isLoading) {
    return <span className="mono text-xs text-muted-foreground">Reading on-chain…</span>;
  }
  return (
    <span className="mono text-xs text-muted-foreground">
      —{" "}
      {row.contractHref ? (
        <a
          href={row.contractHref}
          target="_blank"
          rel="noopener noreferrer"
          className="underline-offset-4 hover:underline hover:text-[var(--gold)]"
        >
          verify on explorer ↗
        </a>
      ) : null}
    </span>
  );
}

export function RegistryCustody() {
  const saleOwner = useReadContract({
    address: isAddr(ACTIVE_SALE_ADDR) ? ACTIVE_SALE_ADDR : undefined,
    abi: SALE_V2_ABI,
    functionName: "owner",
    chainId: AVALANCHE_CHAIN_ID,
    query: { ...COMMON_QUERY, enabled: SALE_V2_LIVE && isAddr(ACTIVE_SALE_ADDR) },
  });
  const archiveOwner = useReadContract({
    address: isAddr(ARCHIVE_ADDR) ? ARCHIVE_ADDR : undefined,
    abi: ARCHIVE_NFT_ABI,
    functionName: "owner",
    chainId: AVALANCHE_CHAIN_ID,
    query: { ...COMMON_QUERY, enabled: isAddr(ARCHIVE_ADDR) },
  });
  const archiveTreasury = useReadContract({
    address: isAddr(ARCHIVE_ADDR) ? ARCHIVE_ADDR : undefined,
    abi: ARCHIVE_NFT_ABI,
    functionName: "treasury",
    chainId: AVALANCHE_CHAIN_ID,
    query: { ...COMMON_QUERY, enabled: isAddr(ARCHIVE_ADDR) },
  });

  const saleHref = explorerUrlForAddress(ACTIVE_SALE_ADDR);
  const archiveHref = explorerUrlForAddress(ARCHIVE_ADDR);

  const rows: CustodyRow[] = [
    {
      key: "sale-owner",
      scope: "Active Membership Sale (V2)",
      role: "Owner / admin",
      contractHref: saleHref,
      data: saleOwner.data as `0x${string}` | undefined,
      isLoading: saleOwner.isLoading,
      enabled: SALE_V2_LIVE && isAddr(ACTIVE_SALE_ADDR),
    },
    {
      key: "archive-owner",
      scope: "Archive (ERC-1155)",
      role: "Owner / admin",
      contractHref: archiveHref,
      data: archiveOwner.data as `0x${string}` | undefined,
      isLoading: archiveOwner.isLoading,
      enabled: isAddr(ARCHIVE_ADDR),
    },
    {
      key: "archive-treasury",
      scope: "Archive (ERC-1155)",
      role: "Archive treasury",
      contractHref: archiveHref,
      data: archiveTreasury.data as `0x${string}` | undefined,
      isLoading: archiveTreasury.isLoading,
      enabled: isAddr(ARCHIVE_ADDR),
    },
  ];

  return (
    <Section id="custody">
      <SectionHeader
        eyebrow="06 — Custody"
        title="Custody & admin keys"
        description="Administrative addresses behind the live contracts, read directly from chain. These keys administer the contracts only — they confer no ownership or governance rights to members. Verify every value on the explorer."
      />
      <GlassCard className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] mono uppercase tracking-[0.18em] text-muted-foreground border-b border-border/40">
                <th className="py-3 px-4">Contract</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Address</th>
                <th className="py-3 px-4">Source</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.key} className="border-b border-border/20 last:border-0 align-top">
                  <td className="py-3 px-4 font-medium">{r.scope}</td>
                  <td className="py-3 px-4 text-xs text-muted-foreground">{r.role}</td>
                  <td className="py-3 px-4">
                    <CustodyValue row={r} />
                  </td>
                  <td className="py-3 px-4">
                    <Pill tone="muted">Live on-chain read</Pill>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
      <p className="mt-3 text-xs text-muted-foreground leading-relaxed max-w-3xl">
        Distinct from the allocation and routing wallets above. The Vault, Liquidity, Operations,
        Founder, and Membership Distribution wallets hold or route funds; the addresses here hold
        contract-administration authority (e.g. pause, parameters, proceeds withdrawal). All are
        public and verifiable on Avalanche C-Chain.
      </p>
    </Section>
  );
}
