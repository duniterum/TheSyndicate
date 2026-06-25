import { useEffect, useMemo, useState } from "react";
import { useReadContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { parseUnits } from "viem";
import {
  ACTIVE_SALE,
  ACTIVE_SALE_VERSION,
  fmtSyn,
  fmtUsdc,
  useQuoteSyn,
  useUserBalances,
} from "@/lib/sale-hooks";
import { useWalletGate } from "@/lib/useWalletGate";
import {
  CONTRACTS,
  SOURCE_REGISTRY_V1_CONTRACT_ADDRESS,
  explorerUrlForAddress,
  txExplorerUrl,
  USDC_DECIMALS,
} from "@/lib/syndicate-config";
import { ERC20_ABI, SALE_V3_ABI, SOURCE_REGISTRY_V1_ABI } from "@/lib/sale-abi";
import { getV3HistoricalMember } from "@/lib/v3-historical-members";
import { useHolderIndex } from "@/lib/holder-index";
import {
  buildSourceAwareTestModeGate,
  SOURCE_AWARE_PRODUCTION_TEST_MODE_FLAG,
  SOURCE_AWARE_TEST_ALLOWED_BUYERS_FLAG,
  SOURCE_AWARE_TEST_MODE_FLAG,
  SOURCE_AWARE_TEST_QUERY_VALUE,
} from "@/lib/source-aware-test-mode";
import { type SourcePolicyRecord, ZERO_SOURCE_ID } from "@/lib/source-policy-observability";
import {
  REAL_CONDITION_SOURCE_TEST_PACKET,
  REAL_CONDITION_SOURCE_TEST_TERMS,
  sourceRecordMatchesRealConditionTestTerms,
} from "@/lib/source-real-condition-test";
import { ContractLink, ProofButton } from "./Primitives";

const USDC = CONTRACTS.USDC_CONTRACT_ADDRESS as `0x${string}`;
const SOURCE_REGISTRY = SOURCE_REGISTRY_V1_CONTRACT_ADDRESS as `0x${string}`;
const TEST_USDC_RAW = parseUnits("5", USDC_DECIMALS);
const TEST_SOURCE_ID = REAL_CONDITION_SOURCE_TEST_TERMS.sourceId as `0x${string}`;

type Phase = "idle" | "approving" | "buying" | "success";
type SourceConfigObject = {
  sourceWallet: string;
  sourceClass: number;
  commissionBps: number;
  status: number;
  scope: number;
  startTime: bigint;
  endTime: bigint;
  grossCap: bigint;
  perBuyerCap: bigint;
  appliesToRepeatPurchases: boolean;
  payoutWallet: string;
  metadataHash: string;
};
type SourceConfigTuple = readonly [
  string,
  number,
  number,
  number,
  number,
  bigint,
  bigint,
  bigint,
  bigint,
  boolean,
  string,
  string,
  string,
  bigint,
];
type SourceConfigRead = SourceConfigTuple | SourceConfigObject;

const sourceClasses = [
  "MEMBER_INTRODUCTION",
  "BUILDER_SOURCE",
  "AFFILIATE",
  "BD_NETWORK",
  "WHITELABEL",
  "SPONSORSHIP",
  "TREASURY_DEAL",
] as const;
const sourceStatuses = ["NONE", "ACTIVE", "PAUSED", "REVOKED"] as const;
const sourceScopes = ["FIRST_PURCHASE", "WINDOWED", "CAPPED", "LIFETIME", "CUSTOM"] as const;

function isSourceConfigTuple(config: SourceConfigRead): config is SourceConfigTuple {
  return Array.isArray(config);
}

function field<T>(config: SourceConfigRead, index: number, key: keyof SourceConfigObject): T {
  return (isSourceConfigTuple(config) ? config[index] : config[key]) as T;
}

function sourceRecordFromConfig(config: unknown): SourcePolicyRecord | null {
  if (!config) return null;
  const c = config as SourceConfigRead;
  const sourceWallet = field<string>(c, 0, "sourceWallet");
  if (!sourceWallet || /^0x0{40}$/i.test(sourceWallet)) return null;
  const sourceClass = sourceClasses[field<number>(c, 1, "sourceClass")];
  const status = sourceStatuses[field<number>(c, 3, "status")];
  const scope = sourceScopes[field<number>(c, 4, "scope")];
  if (!sourceClass || !status || !scope) return null;

  return {
    sourceId: TEST_SOURCE_ID,
    sourceWallet,
    sourceClass,
    status,
    commissionBps: Number(field<number>(c, 2, "commissionBps")),
    scope,
    startTime: Number(field<bigint>(c, 5, "startTime")),
    endTime: Number(field<bigint>(c, 6, "endTime")),
    grossCap: Number(field<bigint>(c, 7, "grossCap")),
    perBuyerCap: Number(field<bigint>(c, 8, "perBuyerCap")),
    appliesToRepeatPurchases: field<boolean>(c, 9, "appliesToRepeatPurchases"),
    payoutWallet: field<string>(c, 10, "payoutWallet"),
    metadataHash: field<string>(c, 11, "metadataHash"),
  };
}

export function SourceAwareLocalTestHarness({
  requestedSourceTest,
}: {
  requestedSourceTest?: string | null;
}) {
  const [hostname, setHostname] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setHostname(window.location.hostname);
  }, []);

  const wallet = useWalletGate();
  const sourceConfig = useReadContract({
    address: SOURCE_REGISTRY,
    abi: SOURCE_REGISTRY_V1_ABI,
    functionName: "sourceConfig",
    args: [TEST_SOURCE_ID],
    query: { refetchInterval: 20_000, staleTime: 10_000 },
  });
  const sourceActive = useReadContract({
    address: SOURCE_REGISTRY,
    abi: SOURCE_REGISTRY_V1_ABI,
    functionName: "isActive",
    args: [TEST_SOURCE_ID],
    query: { refetchInterval: 20_000, staleTime: 10_000 },
  });
  const liveSourceRecord = useMemo(() => sourceRecordFromConfig(sourceConfig.data), [sourceConfig.data]);
  const liveTermsMatch = liveSourceRecord
    ? sourceRecordMatchesRealConditionTestTerms(liveSourceRecord)
    : false;

  const gate = useMemo(
    () =>
      buildSourceAwareTestModeGate({
        isDev: import.meta.env.DEV,
        hostname,
        enabledFlag: import.meta.env.VITE_ENABLE_SOURCE_TEST_MODE,
        productionEnabledFlag: import.meta.env.VITE_ENABLE_PRODUCTION_SOURCE_TEST_MODE,
        allowedBuyerAddresses: import.meta.env.VITE_SOURCE_TEST_ALLOWED_BUYERS,
        connectedWallet: wallet.address,
        requestedSourceTest,
        target: REAL_CONDITION_SOURCE_TEST_TERMS,
        liveSourceStatus:
          liveSourceRecord && sourceActive.data === true ? liveSourceRecord.status : "PAUSED",
        liveSourceMatchesExpectedTerms: liveTermsMatch && sourceActive.data === true,
      }),
    [hostname, liveSourceRecord, liveTermsMatch, requestedSourceTest, sourceActive.data, wallet.address],
  );

  const userBal = useUserBalances();
  const holderIndex = useHolderIndex();
  const knownMember = wallet.address ? holderIndex.getByWallet(wallet.address) : undefined;
  const historicalMember = getV3HistoricalMember(wallet.address);
  const quote = useQuoteSyn(TEST_USDC_RAW, wallet.address, {
    sourceId: TEST_SOURCE_ID,
    enabled: gate.canQuoteNonZeroSourceId,
  });
  const approveTx = useWriteContract();
  const buyTx = useWriteContract();
  const approveReceipt = useWaitForTransactionReceipt({ hash: approveTx.data });
  const buyReceipt = useWaitForTransactionReceipt({ hash: buyTx.data });

  useEffect(() => {
    if (approveReceipt.isSuccess) {
      userBal.refetch();
      setPhase("idle");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [approveReceipt.isSuccess]);

  useEffect(() => {
    if (buyReceipt.isSuccess) {
      userBal.refetch();
      setPhase("success");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buyReceipt.isSuccess]);

  const needsApprove =
    userBal.usdcAllowance !== undefined && userBal.usdcAllowance < TEST_USDC_RAW;
  const insufficientUsdc =
    userBal.usdcBalance !== undefined && userBal.usdcBalance < TEST_USDC_RAW;
  const quoteReady = quote.data !== undefined;
  const walletBlocked =
    knownMember !== undefined ||
    historicalMember !== undefined ||
    ACTIVE_SALE_VERSION !== "v3";

  const canUseWalletControls =
    gate.canPrepareSourceAwareBuy &&
    wallet.isConnected &&
    !wallet.wrongChain &&
    !walletBlocked &&
    !insufficientUsdc &&
    userBal.usdcAllowance !== undefined &&
    userBal.usdcBalance !== undefined &&
    quoteReady;

  const sourceTerms = [
    ["sourceId", gate.sourceIdForTest],
    ["status", gate.sourceStatus],
    ["sourceClass", REAL_CONDITION_SOURCE_TEST_TERMS.sourceClass],
    ["sourceWallet", REAL_CONDITION_SOURCE_TEST_TERMS.sourceWallet],
    ["payoutWallet", REAL_CONDITION_SOURCE_TEST_TERMS.payoutWallet],
    ["commissionBps", REAL_CONDITION_SOURCE_TEST_TERMS.commissionBps.toString()],
    ["startTime", REAL_CONDITION_SOURCE_TEST_PACKET.startTimeUtc],
    ["endTime", REAL_CONDITION_SOURCE_TEST_PACKET.endTimeUtc],
    ["grossCap", `${fmtUsdc(BigInt(REAL_CONDITION_SOURCE_TEST_TERMS.grossCap ?? 0))} USDC`],
    ["perBuyerCap", `${fmtUsdc(BigInt(REAL_CONDITION_SOURCE_TEST_TERMS.perBuyerCap ?? 0))} USDC`],
    ["metadataHash", REAL_CONDITION_SOURCE_TEST_TERMS.metadataHash],
  ] as const;

  const readbackRows = [
    ["SourceRegistry read", sourceConfig.isLoading ? "Loading" : liveSourceRecord ? "Present" : "Missing"],
    ["isActive(sourceId)", sourceActive.data === true ? "true" : "false"],
    ["terms match packet", liveTermsMatch ? "true" : "false"],
    ["public/default buy", ZERO_SOURCE_ID],
    ["production mode", gate.isProductionInternalMode ? "enabled internally" : "not production-internal"],
  ] as const;

  const handleApprove = async () => {
    setMessage(null);
    setPhase("approving");
    try {
      await approveTx.writeContractAsync({
        address: USDC,
        abi: ERC20_ABI,
        functionName: "approve",
        account: wallet.address!,
        args: [ACTIVE_SALE, TEST_USDC_RAW],
      });
    } catch {
      setPhase("idle");
    }
  };

  const handleBuy = async () => {
    setMessage(null);
    setPhase("buying");
    try {
      const fresh = await quote.refetch();
      const minSynOut = fresh.data as bigint | undefined;
      if (minSynOut === undefined) {
        setMessage("Source-aware quote unavailable. Do not sign.");
        setPhase("idle");
        return;
      }
      await buyTx.writeContractAsync({
        address: ACTIVE_SALE,
        abi: SALE_V3_ABI,
        functionName: "buy",
        account: wallet.address!,
        args: [TEST_USDC_RAW, wallet.address!, TEST_SOURCE_ID, minSynOut, []],
      });
    } catch {
      setPhase("idle");
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-5 py-10">
      <header className="rounded-md border border-amber-500/40 bg-amber-500/10 p-5">
        <div className="mono text-[10px] uppercase tracking-[0.22em] text-amber-700 dark:text-amber-300">
          INTERNAL SOURCE TEST MODE / NOT PUBLIC REFERRAL
        </div>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          Internal source-aware test boundary
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          This page exists only for a controlled $5 source-attributed
          MembershipSaleV3 test after separate terms-update, ACTIVE, and
          readback approvals. It is not linked publicly, not a source dashboard,
          not a claim surface, and not referral activation.
        </p>
      </header>

      <section className="mt-5 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-md border border-border/60 bg-card/70 p-5">
          <div className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Gate status
          </div>
          <div className="mt-2 text-xl font-semibold">{gate.status.replaceAll("_", " ")}</div>
          <div className="mt-4 grid gap-2 text-sm">
            {gate.requiredWarnings.map((warning) => (
              <div key={warning} className="rounded border border-border/50 bg-background/45 px-3 py-2">
                {warning}
              </div>
            ))}
          </div>
          {gate.blockers.length > 0 && (
            <div className="mt-4 rounded-md border border-destructive/40 bg-destructive/10 p-3">
              <div className="mono text-[10px] uppercase tracking-[0.18em] text-destructive">
                Blockers
              </div>
              <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-muted-foreground">
                {gate.blockers.map((blocker) => (
                  <li key={blocker}>{blocker}</li>
                ))}
              </ul>
            </div>
          )}
        </article>

        <article className="rounded-md border border-border/60 bg-card/70 p-5">
          <div className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Required local entry
          </div>
          <dl className="mt-3 space-y-2 text-sm">
            <Row label="Route" value="/labs/source-attribution-test" />
            <Row label="Flag" value={`${SOURCE_AWARE_TEST_MODE_FLAG}=true`} />
            <Row label="Production flag" value={`${SOURCE_AWARE_PRODUCTION_TEST_MODE_FLAG}=true`} />
            <Row label="Allowlist" value={SOURCE_AWARE_TEST_ALLOWED_BUYERS_FLAG} />
            <Row label="Query" value={`sourceTest=${SOURCE_AWARE_TEST_QUERY_VALUE}`} />
            <Row label="Amount" value="$5.00 USDC only" />
            <Row label="Default public buy" value="ZERO_SOURCE_ID" />
          </dl>
        </article>
      </section>

      <section className="mt-5 rounded-md border border-border/60 bg-card/70 p-5">
        <div className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          Frozen source terms preview
        </div>
        <div className="mt-4 grid gap-2 md:grid-cols-2">
          {sourceTerms.map(([label, value]) => (
            <Row key={label} label={label} value={value} />
          ))}
        </div>
        <div className="mt-4 rounded-md border border-border/50 bg-background/45 p-3 text-sm leading-relaxed text-muted-foreground">
          Quote and buy controls stay locked until live SourceRegistry readback
          shows ACTIVE status and exact terms match for this packet. The current
          public/default path stays <code>{ZERO_SOURCE_ID}</code>.
        </div>
      </section>

      <section className="mt-5 rounded-md border border-border/60 bg-card/70 p-5">
        <div className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          Live SourceRegistry readback
        </div>
        <div className="mt-4 grid gap-2 md:grid-cols-2">
          {readbackRows.map(([label, value]) => (
            <Row key={label} label={label} value={value} />
          ))}
        </div>
      </section>

      <section className="mt-5 rounded-md border border-border/60 bg-card/70 p-5">
        <div className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          Local $5 test controls
        </div>
        {!gate.canPrepareSourceAwareBuy ? (
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Controls are intentionally unavailable. This is expected while the
            internal source remains PAUSED or the local gate is incomplete.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            <div className="grid gap-2 md:grid-cols-3">
              <Row label="Quote SYN" value={quote.data ? `${fmtSyn(quote.data)} SYN` : "Loading"} />
              <Row label="Acquisition commission" value={fmtUsdc(quote.acquisitionCost)} />
              <Row label="Net USDC routed" value={fmtUsdc(quote.protocolContribution)} />
            </div>
            {!wallet.isConnected ? (
              <button className="btn btn-primary" onClick={() => wallet.connectWallet()}>
                Connect wallet
              </button>
            ) : wallet.wrongChain ? (
              <button className="btn btn-primary" onClick={() => void wallet.switchToAvalanche()}>
                Switch to Avalanche
              </button>
            ) : walletBlocked ? (
              <p className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-muted-foreground">
                Fresh buyer wallet required. Historical or already seated wallets
                cannot run the controlled source-attributed test.
              </p>
            ) : needsApprove ? (
              <button
                className="btn btn-primary"
                disabled={!canUseWalletControls || phase === "approving"}
                onClick={handleApprove}
              >
                {phase === "approving" ? "Confirm approval" : "Approve $5 USDC"}
              </button>
            ) : (
              <button
                className="btn btn-primary"
                disabled={!canUseWalletControls || phase === "buying"}
                onClick={handleBuy}
              >
                {phase === "buying" ? "Confirm local test buy" : "Run local $5 source test"}
              </button>
            )}
            {message && <p className="text-sm text-destructive">{message}</p>}
            {buyReceipt.isSuccess && buyTx.data && (
              <div className="rounded-md border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm">
                Local source-aware test transaction confirmed.
                <div className="mt-2">
                  <ProofButton href={txExplorerUrl(buyTx.data)}>
                    View transaction
                  </ProofButton>
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      <section className="mt-5 rounded-md border border-border/60 bg-card/70 p-5">
        <div className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          Production boundary
        </div>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          This harness must never be linked from public navigation, never appear
          in the sitemap, never create a public source link, and never alter
          `/join`. If production renders this page without the explicit internal
          flags, allowlisted wallet, ACTIVE readback, and exact terms match, it
          must stay locked and show no wallet action.
        </p>
        <div className="mt-3">
          <ContractLink address={ACTIVE_SALE} explorerHref={explorerUrlForAddress(ACTIVE_SALE)} />
        </div>
      </section>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border/50 bg-background/45 px-3 py-2">
      <dt className="mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">{label}</dt>
      <dd className="mt-1 break-all text-sm font-medium text-foreground">{value}</dd>
    </div>
  );
}
