export const CONTRIBUTION_RECOGNITION_DOCTRINE = {
  seatIdentity: "Seat identity is binary.",
  contributionDepth: "Contribution depth is variable.",
  recognition: "Recognition is multi-axis and evolves over time.",
  capital:
    "The Syndicate recognizes capital without reducing identity to capital.",
  capitalFootprint:
    "Capital footprint reflects verified USDC routed through protocol receipts; it is one recognition axis, not the whole member identity.",
} as const;

export const CONTRIBUTION_RECOGNITION_AXES = [
  "verified USDC routed",
  "builder work",
  "operational contribution",
  "legal and compliance support",
  "audit and security work",
  "infrastructure support",
  "verified introductions",
  "documentation and preservation",
  "time and continuity",
  "chapter and historical position",
] as const;

export const CONTRIBUTION_RECOGNITION_GUARDRAILS = [
  "No rank or band grants payout, yield, governance rights, Vault claim, discount, or private terms.",
  "No capital amount buys member identity; it records capital footprint.",
  "No recognition axis replaces the binary member seat.",
  "No public copy may frame USDC as a purchasable title, wealth leaderboard, or investment return.",
] as const;

