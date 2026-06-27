export const PRODUCT_OS_V1_REVIEW_TOKEN = "SYNDICATE_PRODUCT_OS_V1";
export const PRODUCT_OS_V1_ROUTE = "/labs/product-os-v1";
export const PRODUCT_OS_V1_REVIEW_URL = `${PRODUCT_OS_V1_ROUTE}?review=${PRODUCT_OS_V1_REVIEW_TOKEN}`;

export const PRODUCT_OS_V1_BOUNDARY_LABELS = [
  "READ-ONLY PREVIEW",
  "FOUNDER REVIEW",
  "NO WALLET WRITES",
  "NO SOURCE ACTIVATION",
  "NO CLAIM UI",
  "NOT PRODUCTION AUTH",
] as const;

export const PRODUCT_OS_V1_PROOF_CARDS = [
  {
    title: "Activity",
    eyebrow: "Public heartbeat",
    body: "A concise view of visible protocol movement, shown as read-only preview data.",
  },
  {
    title: "Economy / Transparency",
    eyebrow: "Routing model",
    body: "Shows the 70% / 20% / 10% allocation model without inventing live totals.",
  },
  {
    title: "Registry Proof",
    eyebrow: "Contract status",
    body: "Frames how verified contract and module status could be summarized later.",
  },
  {
    title: "Evolution",
    eyebrow: "Protocol episodes",
    body: "Turns meaningful changes into a readable institutional timeline.",
  },
  {
    title: "Chronicle",
    eyebrow: "Curated memory",
    body: "Separates routine activity from canon-worthy moments.",
  },
  {
    title: "Archive",
    eyebrow: "Memory candidates",
    body: "Previews milestone memory without implying ownership or minting.",
  },
  {
    title: "Recognition",
    eyebrow: "Contribution signals",
    body: "Shows recognition as a multi-axis signal system, not a wealth leaderboard.",
  },
  {
    title: "Fire / Proof of Burn",
    eyebrow: "Burn proof ritual",
    body: "Shows the path from a future burn candidate to public proof without live execution.",
  },
] as const;

export const PRODUCT_OS_V1_RECOGNITION_AXES = [
  "Capital",
  "Builder",
  "Connector",
  "Operator",
  "Verifier",
  "Historian",
  "Steward",
  "Infrastructure",
  "Security",
  "Time / Loyalty",
] as const;

export const PRODUCT_OS_V1_TOOLKIT_GROUPS = [
  "Membership",
  "Wallet / Import SYN",
  "DEX / Swap / Chart",
  "Liquidity / LP",
  "Share Proof",
  "Referral Status",
  "Builder / Contributor",
  "Operator-only",
] as const;

export const PRODUCT_OS_V1_MEMBER_PREVIEW = [
  "My Syndicate",
  "member sigil concept",
  "receipts",
  "since you joined",
  "contribution depth",
  "share proof",
  "settings/privacy",
] as const;

export const PRODUCT_OS_V1_OPERATOR_PREVIEW = [
  "Founder Console concept",
  "Truth Drift",
  "Release Gates",
  "Candidate Queues",
  "Handoff Generator",
  "Audit Log",
] as const;

export const PRODUCT_OS_V1_FIRE_FLOW = [
  "Founder Burn / Community Burn / Protocol Burn concept",
  "on-chain burn proof",
  "Activity",
  "Fire Ledger",
  "Share Card",
  "Chronicle candidate",
  "Archive memory candidate",
] as const;

export const PRODUCT_OS_V1_INACTIVE_BOUNDARIES = [
  "No referral/source activation.",
  "No claim UI activation.",
  "No live wallet writes.",
  "No fake DEX or LP links.",
  "No fake explorer links.",
  "No real founder controls.",
  "No production auth.",
  "No homepage replacement.",
] as const;
