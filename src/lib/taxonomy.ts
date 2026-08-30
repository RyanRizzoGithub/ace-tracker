/**
 * Canonical taxonomy for the Confidence Profile assessment.
 *
 * Every report scores the same fixed set of traits. Each of the six archetypes
 * has an "authentic confidence" (AC) side and a shadow side that is either
 * "over confidence" (OC) or "under confidence" (UC). Each side has three traits.
 *
 * This structure is derived directly from the assessment document and is the
 * source of truth the extractor maps to and the UI renders against.
 */

export type ConfidenceType = "AC" | "OC" | "UC";

export const CONFIDENCE_TYPE_LABELS: Record<ConfidenceType, string> = {
  AC: "Authentic Confidence",
  OC: "Over Confidence",
  UC: "Under Confidence",
};

export interface ArchetypeSide {
  type: ConfidenceType;
  traits: string[];
}

export interface Archetype {
  /** Canonical key, e.g. "convincer". */
  key: string;
  /** Display name, e.g. "Convincer". */
  name: string;
  /** The authentic-confidence side (always present). */
  authentic: ArchetypeSide;
  /** The shadow side (over- or under-confidence). */
  shadow: ArchetypeSide;
}

export const ARCHETYPES: Archetype[] = [
  {
    key: "convincer",
    name: "Convincer",
    authentic: { type: "AC", traits: ["Accomplished", "Focused", "Assertive"] },
    shadow: { type: "OC", traits: ["Directive", "Perfectionistic", "Uninfluenceable"] },
  },
  {
    key: "driver",
    name: "Driver",
    authentic: { type: "AC", traits: ["Progressive", "Influencing", "Urgent"] },
    shadow: { type: "OC", traits: ["Competitive", "Over-powering", "Restless"] },
  },
  {
    key: "negotiator",
    name: "Negotiator",
    authentic: { type: "AC", traits: ["Navigative", "Facilitative", "Steering"] },
    shadow: { type: "OC", traits: ["Consensus-building", "Political", "Aligning"] },
  },
  {
    key: "inquisitor",
    name: "Inquisitor",
    authentic: { type: "AC", traits: ["Clarifying", "Contributor", "Curious"] },
    shadow: { type: "UC", traits: ["Challenging", "Exhaustive", "Resistant"] },
  },
  {
    key: "friend-maker",
    name: "Friend Maker",
    authentic: { type: "AC", traits: ["Connective", "Empathic", "Welcoming"] },
    shadow: { type: "UC", traits: ["Resentful", "Sensitive", "Sacrificing"] },
  },
  {
    key: "peace-keeper",
    name: "Peace Keeper",
    authentic: { type: "AC", traits: ["Calm", "Harmonious", "Listener"] },
    shadow: { type: "UC", traits: ["Subtle", "Passive", "Echoing"] },
  },
];

export const ARCHETYPE_NAMES = ARCHETYPES.map((a) => a.name);

/** A flat descriptor of a single scorable trait. */
export interface TraitDef {
  archetypeKey: string;
  archetypeName: string;
  confidenceType: ConfidenceType;
  trait: string;
}

/** All 36 traits in canonical order (archetype × side × trait). */
export const ALL_TRAITS: TraitDef[] = ARCHETYPES.flatMap((a) =>
  [a.authentic, a.shadow].flatMap((side) =>
    side.traits.map((trait) => ({
      archetypeKey: a.key,
      archetypeName: a.name,
      confidenceType: side.type,
      trait,
    })),
  ),
);

/** Lower-cased trait name -> canonical descriptor, for tolerant extraction mapping. */
export const TRAIT_LOOKUP: Map<string, TraitDef> = new Map(
  ALL_TRAITS.map((t) => [t.trait.toLowerCase(), t]),
);

export function findArchetype(nameOrKey: string): Archetype | undefined {
  const q = nameOrKey.trim().toLowerCase();
  return ARCHETYPES.find((a) => a.key === q || a.name.toLowerCase() === q);
}
