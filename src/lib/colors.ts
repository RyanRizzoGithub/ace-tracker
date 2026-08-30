/** Stable colors per archetype — muted, earthy tones that sit on the sand palette. */
export const ARCHETYPE_COLORS: Record<string, string> = {
  convincer: "#0f6e56", // teal
  driver: "#185fa5", // blue
  negotiator: "#993c1d", // coral
  inquisitor: "#b7791f", // ochre
  "friend-maker": "#7a4e6e", // plum
  "peace-keeper": "#5f7a52", // sage
};

/** A small ordered palette for plotting several traits at once. */
export const TRAIT_PALETTE = [
  "#0f6e56",
  "#185fa5",
  "#993c1d",
  "#b7791f",
  "#7a4e6e",
  "#5f7a52",
  "#0c447c",
  "#b8563e",
];

export const CONFIDENCE_COLORS = {
  AC: "var(--ac)",
  OC: "var(--oc)",
  UC: "var(--uc)",
} as const;
