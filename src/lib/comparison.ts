import { ALL_TRAITS, ARCHETYPES } from "./taxonomy";
import type { ConfidenceType, TraitDef } from "./taxonomy";
import type { DevelopmentPlan, ReportWithScores } from "./types";
import {
  FEEDBACK_QUADRANTS,
  feedbackValue,
  type FeedbackValue,
} from "./feedback";

/**
 * Year-over-year comparison of two reports. Everything here is deterministic
 * arithmetic on the stored trait scores; interpretation is left to the reader.
 *
 * Conventions (matching how the scores are reported):
 * - Changes are in points on the 1–6 scale, never percentages.
 * - Higher is better for Authentic Confidence (AC) traits; lower is better for
 *   Over Confidence (OC) and Under Confidence (UC) traits.
 */

/** Point changes smaller than this are treated as "held steady". */
export const STEADY_THRESHOLD = 0.05;
/** Mean side-change needed for a profile side to count as having moved. */
export const SIDE_MOVE_THRESHOLD = 0.2;

export type Direction = "better" | "worse" | "steady";

export interface TraitChange extends TraitDef {
  before: number | null;
  after: number | null;
  /** after − before, rounded to one decimal; null if either score is missing. */
  delta: number | null;
  direction: Direction | null;
}

export interface TypeAverages {
  AC: number | null;
  OC: number | null;
  UC: number | null;
}

export interface Headline {
  before: TypeAverages & { ratio: number | null };
  after: TypeAverages & { ratio: number | null };
  /** Relative change in the balance ratio, as a percentage. */
  ratioChangePct: number | null;
}

export interface Breadth {
  type: ConfidenceType;
  total: number;
  better: number;
  worse: number;
  steady: number;
}

export type PairPattern =
  | "moved-together-better"
  | "moved-together-worse"
  | "shadow-only-worse"
  | "shadow-only-better"
  | "authentic-only-better"
  | "authentic-only-worse"
  | "both-rose"
  | "both-fell"
  | "steady";

export interface PairCheck {
  archetypeKey: string;
  archetypeName: string;
  shadowType: ConfidenceType;
  /** Mean point change across the three AC traits. */
  authenticDelta: number | null;
  /** Mean point change across the three OC/UC traits. */
  shadowDelta: number | null;
  pattern: PairPattern | null;
  traits: TraitChange[];
}

export interface Standout {
  before: TraitChange | null;
  after: TraitChange | null;
}

/** What happened to the traits named in the earlier report's development plan. */
export interface PlanFollowUp {
  plan: DevelopmentPlan;
  great: TraitChange | null;
  growth: TraitChange | null;
}

export interface FeedbackChange {
  label: string;
  before: FeedbackValue | null;
  after: FeedbackValue | null;
  changed: boolean;
}

export interface Comparison {
  changes: TraitChange[];
  headline: Headline;
  breadth: Breadth[];
  improvements: TraitChange[];
  watch: TraitChange[];
  pairs: PairCheck[];
  /** Highest-scoring AC trait in each report. */
  topGreatTrait: Standout;
  /** Highest-scoring OC/UC trait in each report. */
  topGrowthTrait: Standout;
  labelChanged: boolean;
  planFollowUp: PlanFollowUp | null;
  feedback: FeedbackChange[];
}

const round = (n: number, places: number) => {
  const f = 10 ** places;
  return Math.round(n * f) / f;
};

const mean = (vals: number[]): number | null =>
  vals.length === 0 ? null : vals.reduce((a, b) => a + b, 0) / vals.length;

function scoreMap(report: ReportWithScores): Map<string, number> {
  const m = new Map<string, number>();
  for (const s of report.scores) {
    if (s.score !== null && s.score !== undefined) {
      m.set(s.trait.toLowerCase(), Number(s.score));
    }
  }
  return m;
}

export function directionOf(type: ConfidenceType, delta: number): Direction {
  if (Math.abs(delta) < STEADY_THRESHOLD) return "steady";
  const rose = delta > 0;
  return (type === "AC") === rose ? "better" : "worse";
}

/** Averages per confidence type, plus the Confidence Balance Ratio. */
export function typeAverages(
  report: ReportWithScores,
): TypeAverages & { ratio: number | null } {
  const scores = scoreMap(report);
  const avg = (type: ConfidenceType) =>
    mean(
      ALL_TRAITS.filter((t) => t.confidenceType === type)
        .map((t) => scores.get(t.trait.toLowerCase()))
        .filter((v): v is number => v !== undefined),
    );
  const AC = avg("AC");
  const OC = avg("OC");
  const UC = avg("UC");
  return { AC, OC, UC, ratio: balanceRatio(AC, OC, UC) };
}

/**
 * Confidence Balance Ratio = AC average ÷ the mean of the OC and UC averages.
 * Above 1 means authentic confidence outweighs the two shadow sides.
 */
export function balanceRatio(
  ac: number | null,
  oc: number | null,
  uc: number | null,
): number | null {
  if (ac === null || oc === null || uc === null) return null;
  const shadow = (oc + uc) / 2;
  return shadow === 0 ? null : ac / shadow;
}

function classifyPair(
  authentic: number | null,
  shadow: number | null,
): PairPattern | null {
  if (authentic === null || shadow === null) return null;
  const a = Math.abs(authentic) >= SIDE_MOVE_THRESHOLD ? Math.sign(authentic) : 0;
  const s = Math.abs(shadow) >= SIDE_MOVE_THRESHOLD ? Math.sign(shadow) : 0;
  if (a === 0 && s === 0) return "steady";
  if (a > 0 && s < 0) return "moved-together-better";
  if (a < 0 && s > 0) return "moved-together-worse";
  if (a === 0) return s > 0 ? "shadow-only-worse" : "shadow-only-better";
  if (s === 0) return a > 0 ? "authentic-only-better" : "authentic-only-worse";
  return a > 0 ? "both-rose" : "both-fell";
}

function topTrait(
  changes: TraitChange[],
  pick: (c: TraitChange) => number | null,
  include: (c: TraitChange) => boolean,
): TraitChange | null {
  let best: TraitChange | null = null;
  for (const c of changes) {
    const v = pick(c);
    if (!include(c) || v === null) continue;
    const bestV = best ? pick(best) : null;
    if (bestV === null || v > bestV) best = c;
  }
  return best;
}

/** Compares an earlier report ("before") against a later one ("after"). */
export function compareReports(
  before: ReportWithScores,
  after: ReportWithScores,
): Comparison {
  const b = scoreMap(before);
  const a = scoreMap(after);

  const changes: TraitChange[] = ALL_TRAITS.map((t) => {
    const key = t.trait.toLowerCase();
    const bv = b.get(key) ?? null;
    const av = a.get(key) ?? null;
    const delta = bv === null || av === null ? null : round(av - bv, 1);
    return {
      ...t,
      before: bv,
      after: av,
      delta,
      direction: delta === null ? null : directionOf(t.confidenceType, delta),
    };
  });

  const hb = typeAverages(before);
  const ha = typeAverages(after);
  const headline: Headline = {
    before: hb,
    after: ha,
    ratioChangePct:
      hb.ratio !== null && ha.ratio !== null && hb.ratio !== 0
        ? ((ha.ratio - hb.ratio) / hb.ratio) * 100
        : null,
  };

  const breadth: Breadth[] = (["AC", "OC", "UC"] as ConfidenceType[]).map(
    (type) => {
      const ofType = changes.filter(
        (c) => c.confidenceType === type && c.direction !== null,
      );
      return {
        type,
        total: ofType.length,
        better: ofType.filter((c) => c.direction === "better").length,
        worse: ofType.filter((c) => c.direction === "worse").length,
        steady: ofType.filter((c) => c.direction === "steady").length,
      };
    },
  );

  const bySize = (x: TraitChange, y: TraitChange) =>
    Math.abs(y.delta ?? 0) - Math.abs(x.delta ?? 0) ||
    x.trait.localeCompare(y.trait);
  const improvements = changes
    .filter((c) => c.direction === "better")
    .sort(bySize);
  const watch = changes.filter((c) => c.direction === "worse").sort(bySize);

  const pairs: PairCheck[] = ARCHETYPES.map((arch) => {
    const traits = changes.filter((c) => c.archetypeKey === arch.key);
    const sideMean = (type: ConfidenceType) => {
      const ds = traits
        .filter((c) => c.confidenceType === type && c.delta !== null)
        .map((c) => c.delta as number);
      const m = mean(ds);
      return m === null ? null : round(m, 2);
    };
    const authenticDelta = sideMean("AC");
    const shadowDelta = sideMean(arch.shadow.type);
    return {
      archetypeKey: arch.key,
      archetypeName: arch.name,
      shadowType: arch.shadow.type,
      authenticDelta,
      shadowDelta,
      pattern: classifyPair(authenticDelta, shadowDelta),
      traits,
    };
  });

  const findChange = (trait: string | null) =>
    trait
      ? (changes.find(
          (c) => c.trait.toLowerCase() === trait.trim().toLowerCase(),
        ) ?? null)
      : null;
  const planFollowUp: PlanFollowUp | null = before.plan
    ? {
        plan: before.plan,
        great: findChange(before.plan.great_trait),
        growth: findChange(before.plan.growth_trait),
      }
    : null;

  const feedback: FeedbackChange[] = FEEDBACK_QUADRANTS.map((q) => {
    const bv = feedbackValue(before, q.column);
    const av = feedbackValue(after, q.column);
    return {
      label: q.label,
      before: bv,
      after: av,
      changed: bv !== null && av !== null && bv !== av,
    };
  });

  const isAC = (c: TraitChange) => c.confidenceType === "AC";
  const isShadow = (c: TraitChange) => c.confidenceType !== "AC";

  return {
    changes,
    headline,
    breadth,
    improvements,
    watch,
    pairs,
    topGreatTrait: {
      before: topTrait(changes, (c) => c.before, isAC),
      after: topTrait(changes, (c) => c.after, isAC),
    },
    topGrowthTrait: {
      before: topTrait(changes, (c) => c.before, isShadow),
      after: topTrait(changes, (c) => c.after, isShadow),
    },
    labelChanged:
      !!before.headline_archetype &&
      !!after.headline_archetype &&
      before.headline_archetype.trim().toLowerCase() !==
        after.headline_archetype.trim().toLowerCase(),
    planFollowUp,
    feedback,
  };
}
