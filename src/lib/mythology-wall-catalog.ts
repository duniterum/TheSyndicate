// Mythology Wall — 9-slot public catalog.
//
// PUBLIC vocabulary only. Five visitor states: OPEN · IDENTITY · HIDDEN ·
// ARMED · FAR HORIZON. Operator vocabulary (renderer, ownerOnly,
// notConfigured, supply, price, mintable) does NOT live here — those
// fields live in archive-preview-catalog and only render inside the
// proof drawer.
//
// Authority: docs/NFT_DESIRE_ARCHITECTURE_PASS.md
//            docs/NFT_ARCHIVE_PRODUCT_RECALIBRATION.md

export type PublicSlotState =
  | "OPEN"          // user can participate now (IDs 1, 3)
  | "IDENTITY"      // future separate identity layer (ID 2)
  | "HIDDEN"        // mystery; not advertised (ID 4)
  | "ARMED"         // trigger real, artifact sealed (IDs 5–8)
  | "FAR_HORIZON";  // season-finale / chapter-closing artifact (ID 9)

export type ActKey = "I_AWAKENING" | "II_PROOF_OF_LIFE" | "III_LEGACY";

export type MythologySlot = {
  id: number;
  roman: string;
  name: string;
  act: ActKey;
  state: PublicSlotState;
  /** One-line mythology copy (visitor-facing). */
  mythology: string;
  /** One cliffhanger / sealing condition line for non-OPEN slots. */
  sealingLine?: string;
  /** Visual accent for the slot card. */
  accent: string;
};

export const ACTS: { key: ActKey; numeral: string; title: string; subtitle: string }[] = [
  { key: "I_AWAKENING",     numeral: "I",   title: "Awakening",     subtitle: "The protocol opens its archive." },
  { key: "II_PROOF_OF_LIFE", numeral: "II",  title: "Proof of Life", subtitle: "The protocol begins to record itself." },
  { key: "III_LEGACY",       numeral: "III", title: "Legacy",        subtitle: "The protocol writes its first history." },
];

export const MYTHOLOGY_SLOTS: MythologySlot[] = [
  {
    id: 1, roman: "I", name: "First Signal",
    act: "I_AWAKENING", state: "OPEN",
    mythology: "The opening signal of the protocol.",
    accent: "#D4AF37",
  },
  {
    id: 2, roman: "II", name: "Seat Record",
    act: "I_AWAKENING", state: "IDENTITY",
    mythology: "Your permanent on-chain seat in the Syndicate.",
    sealingLine: "Identity layer — opens when its own contract is live.",
    accent: "#8C8C8C",
  },
  {
    id: 3, roman: "III", name: "Patron Seal",
    act: "I_AWAKENING", state: "OPEN",
    mythology: "A flat seal for early patrons of the archive.",
    accent: "#C9A227",
  },
  {
    id: 4, roman: "IV", name: "Heart Signal",
    act: "II_PROOF_OF_LIFE", state: "HIDDEN",
    mythology: "A hidden discovery artifact.",
    sealingLine: "Sealed until discovered.",
    accent: "#E94CD6",
  },
  {
    id: 5, roman: "V", name: "Genesis Sealed",
    act: "II_PROOF_OF_LIFE", state: "ARMED",
    mythology: "The moment the Genesis cohort closes.",
    sealingLine: "Seals when the Genesis chapter closes.",
    accent: "#E5C76B",
  },
  {
    id: 6, roman: "VI", name: "First Liquidity",
    act: "II_PROOF_OF_LIFE", state: "ARMED",
    mythology: "The first time the protocol holds liquidity in public.",
    sealingLine: "Seals when liquidity history is written on-chain.",
    accent: "#7FB7FF",
  },
  {
    id: 7, roman: "VII", name: "First Routing",
    act: "III_LEGACY", state: "ARMED",
    mythology: "The first time protocol revenue routes on-chain.",
    sealingLine: "Seals when protocol routing becomes history.",
    accent: "#8CE0A6",
  },
  {
    id: 8, roman: "VIII", name: "Legacy Era I",
    act: "III_LEGACY", state: "ARMED",
    mythology: "The closing mark of the first era.",
    sealingLine: "Seals when Era I becomes legacy.",
    accent: "#B59E58",
  },
  {
    id: 9, roman: "IX", name: "Protocol Chronicle",
    act: "III_LEGACY", state: "FAR_HORIZON",
    mythology: "The Season Finale Artifact.",
    sealingLine: "Sealed when Chapter I closes.",
    accent: "#9AA3B2",
  },
];

export const STATE_LABEL: Record<PublicSlotState, string> = {
  OPEN: "OPEN",
  IDENTITY: "IDENTITY",
  HIDDEN: "HIDDEN",
  ARMED: "ARMED",
  FAR_HORIZON: "FAR HORIZON",
};
