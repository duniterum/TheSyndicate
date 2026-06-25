import { useEffect, useMemo, useState } from "react";
import { useReadContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { AlertTriangle, CheckCircle2, Circle, LockKeyhole, Play, ShieldCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
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
type CeremonyStage =
  | "LOCKED"
  | "READY_FOR_APPROVAL"
  | "READY_FOR_BUY"
  | "APPROVING"
  | "BUYING"
  | "BUY_CONFIRMED";
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

function statusTone(ok: boolean): "green" | "red" {
  return ok ? "green" : "red";
}

function deriveCeremonyStage({
  buyConfirmed,
  phase,
  canPrepare,
  needsApprove,
}: {
  buyConfirmed: boolean;
  phase: Phase;
  canPrepare: boolean;
  needsApprove: boolean;
}): CeremonyStage {
  if (buyConfirmed || phase === "success") return "BUY_CONFIRMED";
  if (phase === "approving") return "APPROVING";
  if (phase === "buying") return "BUYING";
  if (!canPrepare) return "LOCKED";
  return needsApprove ? "READY_FOR_APPROVAL" : "READY_FOR_BUY";
}

function stageCopy(stage: CeremonyStage) {
  switch (stage) {
    case "READY_FOR_APPROVAL":
      return {
        label: "Next action: approve exactly 5 USDC",
        detail:
          "Stay on this page. This approval only lets MembershipSaleV3 spend the test amount; it is not the buy.",
      };
    case "READY_FOR_BUY":
      return {
        label: "Next action: start controlled $5 test buy",
        detail:
          "Approval is already satisfied. The next wallet action is the MembershipSaleV3 buy with the frozen non-zero sourceId.",
      };
    case "APPROVING":
      return {
        label: "Wallet action open: approval",
        detail: "Confirm only if the spender is MembershipSaleV3 and the amount is 5 USDC.",
      };
    case "BUYING":
      return {
        label: "Wallet action open: controlled buy",
        detail: "Confirm only if the target is MembershipSaleV3 and the sourceId matches the packet.",
      };
    case "BUY_CONFIRMED":
      return {
        label: "Stop: wait for readback",
        detail:
          "The buy has confirmed. Do not re-pause from this page; paste the transaction hash for receipt and payout readback first.",
      };
    default:
      return {
        label: "Locked: ceremony prerequisites incomplete",
        detail:
          "The console is showing blockers. Do not go to /join and do not attempt a separate contract call.",
      };
  }
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
  const approvalSatisfied =
    userBal.usdcAllowance !== undefined && userBal.usdcAllowance >= TEST_USDC_RAW;
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
  const stage = deriveCeremonyStage({
    buyConfirmed: buyReceipt.isSuccess,
    phase,
    canPrepare: canUseWalletControls,
    needsApprove,
  });
  const currentStage = stageCopy(stage);

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

  const readinessItems = [
    {
      label: "Terms updated",
      detail: "Latest readback matches the before-July packet.",
      done: liveTermsMatch,
    },
    {
      label: "Source ACTIVE",
      detail: "SourceRegistry reports isActive(sourceId) = true.",
      done: sourceActive.data === true && gate.sourceStatus === "ACTIVE",
    },
    {
      label: "Fresh buyer connected",
      detail: "Only the allowlisted fresh wallet may run this test.",
      done: wallet.isConnected && !wallet.wrongChain && !walletBlocked && gate.connectedWalletAllowed,
    },
    {
      label: "5 USDC approval",
      detail: "Approval is a checkpoint, not the buy.",
      done: approvalSatisfied,
    },
    {
      label: "Controlled $5 buy",
      detail: "After success, stop and wait for readback before re-pause.",
      done: buyReceipt.isSuccess,
    },
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
    <div className="mx-auto max-w-6xl px-5 py-10">
      <header className="rounded-md border border-amber-500/40 bg-amber-500/10 p-5">
        <div className="mono text-[10px] uppercase tracking-[0.22em] text-amber-700 dark:text-amber-300">
          INTERNAL SOURCE TEST MODE / NOT PUBLIC REFERRAL
        </div>
        <div className="mt-3 grid gap-4 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Source Attribution Operator Console
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
              Stay on this page. It is the ceremony cockpit for one controlled
              $5 source-attributed MembershipSaleV3 test. Do not return to
              `/join`, do not use a public referral link, and do not re-pause
              until the buy receipt has been read back.
            </p>
          </div>
          <div className="rounded-md border border-amber-500/30 bg-background/50 p-3">
            <div className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Current ceremony step
            </div>
            <div className="mt-2 text-lg font-semibold">{currentStage.label}</div>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {currentStage.detail}
            </p>
          </div>
        </div>
      </header>

      <section className="mt-5 grid gap-4 xl:grid-cols-[1fr_1.2fr]">
        <CeremonyCard stage={stage} txHash={buyTx.data} />
        <article className="rounded-md border border-border/60 bg-card/70 p-5">
          <div className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Ceremony checklist
          </div>
          <div className="mt-4 space-y-2">
            {readinessItems.map((item) => (
              <ChecklistRow key={item.label} {...item} />
            ))}
          </div>
          <div className="mt-4 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm leading-relaxed text-muted-foreground">
            Stop condition: if any wallet popup, page state, sourceId, amount,
            spender, target, or claim/referral language differs from this
            console, cancel and read back before trying again.
          </div>
        </article>
      </section>

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
            Required entry and actors
          </div>
          <dl className="mt-3 space-y-2 text-sm">
            <Row label="Operator stays on" value="/labs/source-attribution-test" />
            <Row label="Query" value={`sourceTest=${SOURCE_AWARE_TEST_QUERY_VALUE}`} />
            <Row label="Production flag" value={`${SOURCE_AWARE_PRODUCTION_TEST_MODE_FLAG}=true`} />
            <Row label="Allowlist" value={SOURCE_AWARE_TEST_ALLOWED_BUYERS_FLAG} />
            <Row label="Local flag" value={`${SOURCE_AWARE_TEST_MODE_FLAG}=true`} />
            <Row label="Fresh buyer action" value="Approve if needed, then buy exactly 5 USDC" />
            <Row label="Founder owner action" value="Re-pause only after receipt readback" />
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
            <StatusRow key={label} label={label} value={value} tone={statusTone(value === "true" || value === "Present" || value === ZERO_SOURCE_ID || value === "enabled internally")} />
          ))}
        </div>
      </section>

      <section className="mt-5 rounded-md border border-border/60 bg-card/70 p-5">
        <div className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          Wallet action panel
        </div>
        {!gate.canPrepareSourceAwareBuy ? (
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Controls are intentionally unavailable. This is expected while the
            internal source remains PAUSED, the live terms do not match, the
            buyer is not allowlisted, or the internal gate is incomplete.
          </p>
        ) : (
          <div className="mt-4 space-y-4">
            <div className="grid gap-2 md:grid-cols-3">
              <Row label="Quote SYN" value={quote.data ? `${fmtSyn(quote.data)} SYN` : "Loading"} />
              <Row label="Acquisition commission" value={fmtUsdc(quote.acquisitionCost)} />
              <Row label="Net USDC routed" value={fmtUsdc(quote.protocolContribution)} />
            </div>
            <div className="rounded-md border border-border/50 bg-background/45 p-3 text-sm leading-relaxed text-muted-foreground">
              The approval, if needed, is only Step A. The buy is Step B. After
              Step B succeeds, stop here and paste the buy transaction hash for
              readback before any re-pause action.
            </div>
            {!wallet.isConnected ? (
              <button className="btn btn-primary gap-2" onClick={() => wallet.connectWallet()}>
                <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                Connect fresh buyer wallet
              </button>
            ) : wallet.wrongChain ? (
              <button className="btn btn-primary gap-2" onClick={() => void wallet.switchToAvalanche()}>
                <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                Switch to Avalanche
              </button>
            ) : walletBlocked ? (
              <p className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-muted-foreground">
                Fresh buyer wallet required. Historical or already seated wallets
                cannot run the controlled source-attributed test.
              </p>
            ) : insufficientUsdc ? (
              <p className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-muted-foreground">
                The connected fresh buyer wallet needs at least 5 USDC before
                this controlled test can continue.
              </p>
            ) : needsApprove ? (
              <button
                className="btn btn-primary gap-2"
                disabled={!canUseWalletControls || phase === "approving"}
                onClick={handleApprove}
              >
                <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                {phase === "approving" ? "Confirm 5 USDC approval" : "Approve exactly 5 USDC"}
              </button>
            ) : (
              <button
                className="btn btn-primary gap-2"
                disabled={!canUseWalletControls || phase === "buying"}
                onClick={handleBuy}
              >
                <Play className="h-4 w-4" aria-hidden="true" />
                {phase === "buying" ? "Confirm controlled $5 buy" : "Start controlled $5 test buy"}
              </button>
            )}
            {approveReceipt.isSuccess && approveTx.data && !buyReceipt.isSuccess && (
              <div className="rounded-md border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm">
                Approval confirmed. Stay on this page: the controlled $5 buy is
                still the next action.
                <div className="mt-2">
                  <ProofButton href={txExplorerUrl(approveTx.data)}>
                    View approval transaction
                  </ProofButton>
                </div>
              </div>
            )}
            {message && <p className="text-sm text-destructive">{message}</p>}
            {buyReceipt.isSuccess && buyTx.data && (
              <div className="rounded-md border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm">
                Controlled source-aware buy transaction confirmed. Stop here and
                paste this transaction hash for readback before re-pause.
                <div className="mt-2">
                  <ProofButton href={txExplorerUrl(buyTx.data)}>
                    View buy transaction
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
          This console must never be linked from public navigation, never appear
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

function CeremonyCard({ stage, txHash }: { stage: CeremonyStage; txHash?: `0x${string}` }) {
  const iconByStage: Record<CeremonyStage, LucideIcon> = {
    LOCKED: LockKeyhole,
    READY_FOR_APPROVAL: ShieldCheck,
    READY_FOR_BUY: Play,
    APPROVING: ShieldCheck,
    BUYING: Play,
    BUY_CONFIRMED: CheckCircle2,
  };
  const Icon = iconByStage[stage];
  const isTerminal = stage === "BUY_CONFIRMED";
  return (
    <article className="rounded-md border border-border/60 bg-card/70 p-5">
      <div className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        Mission control
      </div>
      <div className="mt-4 flex items-start gap-3">
        <div className="rounded-full border border-border/60 bg-background/60 p-2">
          <Icon className="h-5 w-5 text-amber-600 dark:text-amber-300" aria-hidden="true" />
        </div>
        <div>
          <div className="text-xl font-semibold">
            {isTerminal ? "Buy complete: freeze for readback" : "One controlled internal source test"}
          </div>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            This console is not a referral product. It exists to keep one real
            operator ceremony legible: read state, approve if needed, buy once,
            stop, read back, then re-pause from the owner wallet.
          </p>
        </div>
      </div>
      <div className="mt-5 grid gap-2 text-sm">
        <StepPill active={stage === "READY_FOR_APPROVAL" || stage === "APPROVING"} done={stage !== "LOCKED" && stage !== "READY_FOR_APPROVAL" && stage !== "APPROVING"} label="A. Approve 5 USDC if needed" />
        <StepPill active={stage === "READY_FOR_BUY" || stage === "BUYING"} done={isTerminal} label="B. Start controlled $5 buy" />
        <StepPill active={isTerminal} done={false} label="C. Stop and wait for readback" />
        <StepPill active={false} done={false} label="D. Re-pause only after readback" />
      </div>
      {txHash && (
        <div className="mt-4">
          <ProofButton href={txExplorerUrl(txHash)}>View latest wallet transaction</ProofButton>
        </div>
      )}
    </article>
  );
}

function StepPill({ active, done, label }: { active: boolean; done: boolean; label: string }) {
  const Icon = done ? CheckCircle2 : active ? AlertTriangle : Circle;
  return (
    <div
      className={[
        "flex items-center gap-2 rounded border px-3 py-2",
        done
          ? "border-emerald-500/35 bg-emerald-500/10"
          : active
            ? "border-amber-500/40 bg-amber-500/10"
            : "border-border/50 bg-background/45",
      ].join(" ")}
    >
      <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

function ChecklistRow({
  label,
  detail,
  done,
}: {
  label: string;
  detail: string;
  done: boolean;
}) {
  const Icon = done ? CheckCircle2 : Circle;
  return (
    <div className="flex gap-3 rounded-md border border-border/50 bg-background/45 p-3">
      <Icon
        className={["mt-0.5 h-4 w-4 shrink-0", done ? "text-emerald-600" : "text-muted-foreground"].join(" ")}
        aria-hidden="true"
      />
      <div>
        <div className="text-sm font-medium">{label}</div>
        <div className="mt-1 text-xs leading-relaxed text-muted-foreground">{detail}</div>
      </div>
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

function StatusRow({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "green" | "red";
}) {
  return (
    <div className="rounded-md border border-border/50 bg-background/45 px-3 py-2">
      <dt className="mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">{label}</dt>
      <dd className="mt-1 flex items-center gap-2 break-all text-sm font-medium text-foreground">
        <span
          className={["h-2 w-2 rounded-full", tone === "green" ? "bg-emerald-500" : "bg-destructive"].join(" ")}
          aria-hidden="true"
        />
        {value}
      </dd>
    </div>
  );
}
