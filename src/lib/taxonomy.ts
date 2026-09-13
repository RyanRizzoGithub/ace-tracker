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
  /**
   * One-line "top value" — what this profile is fundamentally seeking.
   * Sourced verbatim from the Confidence Profile reports.
   */
  topValue: string;
  /**
   * Short reference-guide description of the profile: who they are at their
   * best, how they behave, and where they tend to struggle. Sourced from the
   * "Confidence Profile Reference Guide" in the MyConfidence Professional
   * Report (© BenFauske.com).
   */
  blurb: string;
  /** The authentic-confidence side (always present). */
  authentic: ArchetypeSide;
  /** The shadow side (over- or under-confidence). */
  shadow: ArchetypeSide;
}

/**
 * The archetypes are listed in confidence-spectrum order: the three
 * under-confidence-leaning profiles (Peace Keeper, Friend Maker, Inquisitor)
 * followed by the three over-confidence-leaning profiles (Negotiator, Driver,
 * Convincer). This is the order the reports present them in.
 */
export const ARCHETYPES: Archetype[] = [
  {
    key: "peace-keeper",
    name: "Peace Keeper",
    topValue: "Seeking moments of calm.",
    blurb:
      "Peace Keepers are looking for moments of calm and they are at their best in relaxed and productive environments. They want to hear the ideas of others and they listen without the intent to respond. They may struggle to advocate for themselves. They know what they do not want but they don't always know what they do want.",
    authentic: { type: "AC", traits: ["Calm", "Harmonious", "Listener"] },
    shadow: { type: "UC", traits: ["Subtle", "Passive", "Echoing"] },
  },
  {
    key: "friend-maker",
    name: "Friend Maker",
    topValue: "Energized by moments of genuine connection.",
    blurb:
      "Friend Makers are looking for moments of genuine connection and they are at their best when they enjoy the people they are working with. They work hard to ensure results and they are great team players. They may struggle when relationships are not working and they may be influenced by the opinions of others.",
    authentic: { type: "AC", traits: ["Connective", "Empathic", "Welcoming"] },
    shadow: { type: "UC", traits: ["Resentful", "Sensitive", "Sacrificing"] },
  },
  {
    key: "inquisitor",
    name: "Inquisitor",
    topValue: "Interested in moments of clarity.",
    blurb:
      "Inquisitors are looking for moments of clarity and they are at their best when ideas are debated before decisions are made. They are loyal once they understand and buy-in to the solution. They want to discuss options and will visualize how things will work. If they cannot visualize, they may stall progress. They don't respond well to “because I said so.”",
    authentic: { type: "AC", traits: ["Clarifying", "Contributor", "Curious"] },
    shadow: { type: "UC", traits: ["Challenging", "Exhaustive", "Resistant"] },
  },
  {
    key: "negotiator",
    name: "Negotiator",
    topValue: "Facilitating moments of agreement.",
    blurb:
      "Negotiators are looking for moments of agreement and they are at their best when the environment balances the need for results and relationships. They perform well in the toughest situations because they do not tend to overreact. They believe winning together is better but this can cause them to take longer than expected to get results. They are in constant tension between getting along and getting things done.",
    authentic: { type: "AC", traits: ["Navigative", "Facilitative", "Steering"] },
    shadow: { type: "OC", traits: ["Consensus-building", "Political", "Aligning"] },
  },
  {
    key: "driver",
    name: "Driver",
    topValue: "Passionate about progress.",
    blurb:
      "Drivers are passionate about progress and they are at their best in a fast-moving and results-oriented environment. They are most interested in personally succeeding. They are great followers when they are completely aligned. They can lack patience and may exaggerate the importance of the immediate results. It is difficult for people to live up to their expectations.",
    authentic: { type: "AC", traits: ["Progressive", "Influencing", "Urgent"] },
    shadow: { type: "OC", traits: ["Competitive", "Over-powering", "Restless"] },
  },
  {
    key: "convincer",
    name: "Convincer",
    topValue: "Motivated by moments of accomplishment.",
    blurb:
      "Convincers are motivated by moments of accomplishment and they are at their best when they are working with clear roles and a high level of competence. They want to be trusted to do their jobs and they expect others to do the same. Nobody really lives up to their expectations because they may make others feel they could do the job better. They can make people feel unimportant and will not even notice the relational disconnects they create.",
    authentic: { type: "AC", traits: ["Accomplished", "Focused", "Assertive"] },
    shadow: { type: "OC", traits: ["Directive", "Perfectionistic", "Uninfluenceable"] },
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

/**
 * Plain-language definition of what a single trait means, taken verbatim from
 * the trait cards in the MyConfidence Professional Reports (© BenFauske.com).
 *
 * These are only present in the detailed per-profile reports, so definitions
 * are currently filled in for the two profiles we have full source text for
 * (Friend Maker and Driver). The remaining profiles' trait definitions can be
 * added here as their detailed reports become available — the UI treats a
 * missing entry gracefully and simply shows the trait name.
 */
export const TRAIT_DESCRIPTIONS: Record<string, string> = {
  // Friend Maker — authentic confidence
  Connective:
    "Connective individuals encourage guests or new people to feel welcome by behaving in a polite and friendly manner. They actively work to include new people in conversations or activities to give them a sense of belonging.",
  Empathic:
    "Empathic individuals have a high degree of understanding of the emotions of others.",
  Welcoming:
    "Welcoming individuals have a pleasant appearance and calm manner that encourages new people to feel accepted and comfortable in their new setting.",
  // Friend Maker — under confidence
  Resentful:
    "Resentful individuals have a persistent feeling of ill will that is the result of a negative experience with another person.",
  Sensitive:
    "Sensitive individuals are quick to detect or respond to slight changes, signals, or influences — both positive and negative.",
  Sacrificing:
    "Sacrificing individuals allow others to take advantage of them. They find that others often attempt to benefit unfairly from their work, and they may deliberately allow someone else to “take a win” from them.",
  // Driver — authentic confidence
  Progressive:
    "Progressive individuals advocate for change, improvement, or reform rather than seeking comfort in the status quo. They believe there is always a new, better, or more efficient way to get the work done.",
  Influencing:
    "Influencing individuals have the ability to positively or negatively affect the character, development, or behavior of someone or something.",
  Urgent:
    "Urgent individuals are able to provide a sincere, intense, and swift or persistent response to a situation.",
  // Driver — over confidence
  Competitive:
    "Competitive individuals believe there is a rivalry in every situation. You are either with them or against them, and they (or their team) will always be jockeying for the win.",
  "Over-powering":
    "Over-powering individuals overthrow or overtake a person or situation by displaying extremely strong or intense behavior. They tend to push others into the shadows.",
  Restless:
    "Restless individuals are unable to rest or relax as a result of anxiety or boredom. They have a persistent desire for change or action.",
};

/** Returns the definition for a trait name, or undefined if none is on file. */
export function traitDescription(trait: string): string | undefined {
  return TRAIT_DESCRIPTIONS[trait];
}
