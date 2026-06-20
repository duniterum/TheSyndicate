export type V3PreviewStatus = "CANDIDATE" | "PENDING" | "NOT LIVE";

export type V3EraPreview = {
  era: string;
  name: string;
  seatRange: string;
  synPerUsdc: number;
  impliedSynPrice: number;
  minimumUsdc: number;
  chapter: string;
};

export type V3SourceProgression = {
  label: string;
  category: "Introduction Recognition" | "Reviewed Source Terms";
  condition: string;
  commissionBps: number;
  status: V3PreviewStatus;
  reviewRequired: boolean;
};

export type V3SourceClassPreview = {
  sourceClass: string;
  assignment: "Autonomous public source" | "Founder/operator assigned";
  purpose: string;
  defaultPolicy: string;
};

export type V3QuoteInput = {
  grossUsdc: number;
  era: V3EraPreview;
  source?: V3SourceProgression | null;
};

export type V3QuotePreview = {
  grossUsdc: number;
  acquisitionCost: number;
  protocolContribution: number;
  vaultAmount: number;
  liquidityAmount: number;
  operationsAmount: number;
  synDelivered: number;
  commissionBps: number;
};

export const V3_PREVIEW_STATUS: V3PreviewStatus[] = ["CANDIDATE", "PENDING", "NOT LIVE"];

export const V3_ERA_PREVIEW: V3EraPreview[] = [
  {
    era: "I",
    name: "Genesis",
    seatRange: "#1 - #333",
    synPerUsdc: 100,
    impliedSynPrice: 0.01,
    minimumUsdc: 5,
    chapter: "Chapter I - Genesis Signal",
  },
  {
    era: "II",
    name: "First Thousand",
    seatRange: "#334 - #1,000",
    synPerUsdc: 50,
    impliedSynPrice: 0.02,
    minimumUsdc: 10,
    chapter: "Chapter II - First Thousand",
  },
  {
    era: "III",
    name: "The Expansion",
    seatRange: "#1,001 - #3,333",
    synPerUsdc: 40,
    impliedSynPrice: 0.025,
    minimumUsdc: 10,
    chapter: "Chapter III - The Expansion",
  },
  {
    era: "IV",
    name: "First Ten Thousand",
    seatRange: "#3,334 - #10,000",
    synPerUsdc: 16,
    impliedSynPrice: 0.0625,
    minimumUsdc: 25,
    chapter: "Chapter IV - First Ten Thousand",
  },
  {
    era: "V",
    name: "Open Era I",
    seatRange: "#10,001 - #25,000",
    synPerUsdc: 12,
    impliedSynPrice: 0.083333,
    minimumUsdc: 25,
    chapter: "Chapter V - Open Era",
  },
  {
    era: "VI",
    name: "Open Era II",
    seatRange: "#25,001 - #50,000",
    synPerUsdc: 6,
    impliedSynPrice: 0.166667,
    minimumUsdc: 50,
    chapter: "Chapter V - Open Era",
  },
  {
    era: "VII",
    name: "Hundred Thousand",
    seatRange: "#50,001 - #100,000",
    synPerUsdc: 4,
    impliedSynPrice: 0.25,
    minimumUsdc: 50,
    chapter: "Chapter V - Open Era",
  },
  {
    era: "VIII",
    name: "Quarter Million",
    seatRange: "#100,001 - #250,000",
    synPerUsdc: 2,
    impliedSynPrice: 0.5,
    minimumUsdc: 100,
    chapter: "Chapter V - Open Era",
  },
  {
    era: "IX",
    name: "First Million",
    seatRange: "#250,001 - #1,000,000",
    synPerUsdc: 1,
    impliedSynPrice: 1,
    minimumUsdc: 100,
    chapter: "Chapter V - Open Era",
  },
];

export const V3_PUBLIC_SOURCE_PROGRESSION: V3SourceProgression[] = [
  {
    label: "Initiator",
    category: "Introduction Recognition",
    condition: "First verified seated member introduced",
    commissionBps: 500,
    status: "CANDIDATE",
    reviewRequired: false,
  },
  {
    label: "Advocate",
    category: "Introduction Recognition",
    condition: "5 seated members introduced and source health clean",
    commissionBps: 600,
    status: "CANDIDATE",
    reviewRequired: false,
  },
  {
    label: "Connector",
    category: "Introduction Recognition",
    condition: "20 seated members introduced and source health clean",
    commissionBps: 800,
    status: "CANDIDATE",
    reviewRequired: false,
  },
  {
    label: "Catalyst",
    category: "Introduction Recognition",
    condition: "75 seated members introduced and source health clean",
    commissionBps: 1000,
    status: "CANDIDATE",
    reviewRequired: false,
  },
  {
    label: "Steward",
    category: "Introduction Recognition",
    condition: "250 seated members introduced, clean source history, review flag clear",
    commissionBps: 1200,
    status: "CANDIDATE",
    reviewRequired: false,
  },
  {
    label: "Reviewed Source Terms",
    category: "Reviewed Source Terms",
    condition: "1,000 seated members introduced, clean history, founder review required",
    commissionBps: 1500,
    status: "PENDING",
    reviewRequired: true,
  },
];

export const V3_SOURCE_CLASSES: V3SourceClassPreview[] = [
  {
    sourceClass: "MEMBER_INTRODUCTION",
    assignment: "Autonomous public source",
    purpose: "A seated member introduces a buyer.",
    defaultPolicy: "Introduction progression, capped, no member ownership.",
  },
  {
    sourceClass: "BUILDER_SOURCE",
    assignment: "Founder/operator assigned",
    purpose: "Builder/operator growth channel.",
    defaultPolicy: "Custom source terms, visible policy action.",
  },
  {
    sourceClass: "AFFILIATE",
    assignment: "Founder/operator assigned",
    purpose: "Approved public marketing channel.",
    defaultPolicy: "Custom source terms, visible policy action.",
  },
  {
    sourceClass: "BD_NETWORK",
    assignment: "Founder/operator assigned",
    purpose: "Business-development channel.",
    defaultPolicy: "Custom source terms, visible policy action.",
  },
  {
    sourceClass: "WHITELABEL",
    assignment: "Founder/operator assigned",
    purpose: "Embedded or institutional source.",
    defaultPolicy: "Custom source terms, visible policy action.",
  },
  {
    sourceClass: "SPONSORSHIP",
    assignment: "Founder/operator assigned",
    purpose: "Campaign or sponsorship source.",
    defaultPolicy: "Custom source terms, visible policy action.",
  },
  {
    sourceClass: "TREASURY_DEAL",
    assignment: "Founder/operator assigned",
    purpose: "Strategic institution-level source.",
    defaultPolicy: "Custom source terms, visible policy action.",
  },
];

export function formatUsdc(value: number): string {
  return `${value.toLocaleString("en-US", {
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 6,
  })} USDC`;
}

export function formatSyn(value: number): string {
  return `${value.toLocaleString("en-US", {
    maximumFractionDigits: 2,
  })} SYN`;
}

export function formatBps(bps: number): string {
  return `${(bps / 100).toLocaleString("en-US", {
    maximumFractionDigits: 2,
  })}%`;
}

export function previewV3Quote({ grossUsdc, era, source }: V3QuoteInput): V3QuotePreview {
  const normalizedGross = Number.isFinite(grossUsdc) && grossUsdc > 0 ? grossUsdc : 0;
  const commissionBps = source?.commissionBps ?? 0;
  const acquisitionCost = roundUsdc((normalizedGross * commissionBps) / 10_000);
  const protocolContribution = roundUsdc(normalizedGross - acquisitionCost);
  const vaultAmount = roundUsdc(protocolContribution * 0.7);
  const liquidityAmount = roundUsdc(protocolContribution * 0.2);
  const operationsAmount = roundUsdc(protocolContribution - vaultAmount - liquidityAmount);

  return {
    grossUsdc: normalizedGross,
    acquisitionCost,
    protocolContribution,
    vaultAmount,
    liquidityAmount,
    operationsAmount,
    synDelivered: roundSyn(normalizedGross * era.synPerUsdc),
    commissionBps,
  };
}

function roundUsdc(value: number): number {
  return Math.round(value * 1_000_000) / 1_000_000;
}

function roundSyn(value: number): number {
  return Math.round(value * 100) / 100;
}
