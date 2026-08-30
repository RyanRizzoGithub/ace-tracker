/** Stable colors per archetype, used across charts and badges. */
export const ARCHETYPE_COLORS: Record<string, string> = {
  convincer: "#4f46e5",
  driver: "#0891b2",
  negotiator: "#059669",
  inquisitor: "#d97706",
  "friend-maker": "#db2777",
  "peace-keeper": "#7c3aed",
};

/** A small ordered palette for plotting several traits at once. */
export const TRAIT_PALETTE = [
  "#4f46e5",
  "#0891b2",
  "#059669",
  "#d97706",
  "#db2777",
  "#7c3aed",
  "#dc2626",
  "#2563eb",
];

export const CONFIDENCE_COLORS = {
  AC: "var(--ac)",
  OC: "var(--oc)",
  UC: "var(--uc)",
} as const;
