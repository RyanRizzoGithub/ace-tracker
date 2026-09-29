import type { Comparison, TraitChange } from "./comparison";
import { CONFIDENCE_TYPE_LABELS } from "./taxonomy";
import { traitContent } from "./trait-content";
import type { ReportWithScores } from "./types";

/**
 * Builds the plain-text brief sent to Claude when a coach asks for a draft of
 * their review notes. Everything numeric comes from compareReports(); Claude
 * only interprets.
 */

const fmt = (n: number | null, p = 1) => (n === null ? "n/a" : n.toFixed(p));
const signed = (n: number | null, p = 1) =>
  n === null ? "n/a" : `${n > 0 ? "+" : ""}${n.toFixed(p)}`;

function line(t: TraitChange) {
  return `- ${t.trait} (${t.archetypeName} ${t.confidenceType}): ${fmt(t.before)} → ${fmt(t.after)} (${signed(t.delta)}, ${t.direction ?? "n/a"})`;
}

function define(t: TraitChange) {
  const c = traitContent(t.trait);
  return c ? `- ${t.trait}: ${c.summary} Higher: ${c.higher} Lower: ${c.lower}` : "";
}

export const REVIEW_SYSTEM = `You help a confidence coach prepare a year-over-year review of a client's
Confidence Profile (ACE) assessment. You write a first draft; the coach edits it
before anything reaches the client.

Principles:
- Each report is a snapshot, not a verdict. Look for patterns (related traits
  moving together, one side of a profile moving without the other), not single
  numbers. A trait that held steady is not a shortfall.
- Changes are in points on a 1–6 scale. Higher is better for Authentic
  Confidence traits; lower is better for Over and Under Confidence traits.
- Name what improved before what needs watching, and be specific.
- Offer interpretations as possibilities or questions, never diagnoses.
- The profile label comes from separate questions, not the trait scores; don't
  explain a label change with trait data.
- Plain, warm, direct language. Address the client as "you". No jargon, no
  hype, no therapy-speak.`;

export function buildReviewBrief(
  c: Comparison,
  before: ReportWithScores,
  after: ReportWithScores,
): string {
  const h = c.headline;
  const moved = c.changes
    .filter((t) => t.delta !== null && Math.abs(t.delta) >= 0.3)
    .sort((a, b) => Math.abs(b.delta!) - Math.abs(a.delta!));

  const parts: string[] = [];
  parts.push(
    `Reports: ${before.report_date} (profile: ${before.headline_archetype ?? "unknown"}) → ${after.report_date} (profile: ${after.headline_archetype ?? "unknown"}).`,
  );

  if (c.planFollowUp) {
    const p = c.planFollowUp.plan;
    parts.push(
      [
        "Development plan the client wrote after the earlier report (their words):",
        `- Great trait to leverage: ${p.great_trait ?? "n/a"}${p.great_trait_words ? ` — "${p.great_trait_words}"` : ""}`,
        `- Growth trait to resolve: ${p.growth_trait ?? "n/a"}${p.growth_trait_words ? ` — "${p.growth_trait_words}"` : ""}`,
        p.life_change ? `- How life would change: "${p.life_change}"` : "",
        "What happened to those traits:",
        c.planFollowUp.great ? line(c.planFollowUp.great) : "- Great trait: no score",
        c.planFollowUp.growth ? line(c.planFollowUp.growth) : "- Growth trait: no score",
      ]
        .filter(Boolean)
        .join("\n"),
    );
  }

  parts.push(
    [
      "Headline averages (before → after):",
      `- ${CONFIDENCE_TYPE_LABELS.AC} (18 traits): ${fmt(h.before.AC, 2)} → ${fmt(h.after.AC, 2)}`,
      `- ${CONFIDENCE_TYPE_LABELS.OC} (9 traits): ${fmt(h.before.OC, 2)} → ${fmt(h.after.OC, 2)}`,
      `- ${CONFIDENCE_TYPE_LABELS.UC} (9 traits): ${fmt(h.before.UC, 2)} → ${fmt(h.after.UC, 2)}`,
      `- Balance ratio (AC ÷ mean of OC and UC): ${fmt(h.before.ratio, 2)} → ${fmt(h.after.ratio, 2)} (${signed(h.ratioChangePct)}%)`,
      ...c.breadth.map(
        (b) =>
          `- ${CONFIDENCE_TYPE_LABELS[b.type]}: ${b.better} of ${b.total} improved, ${b.worse} worsened`,
      ),
    ].join("\n"),
  );

  parts.push(
    ["Traits that moved 0.3 points or more:", ...moved.map(line)].join("\n"),
  );

  parts.push(
    [
      "Paired-trait check (mean change of each profile's authentic side vs its shadow side):",
      ...c.pairs.map(
        (p) =>
          `- ${p.archetypeName}: AC ${signed(p.authenticDelta, 2)}, ${p.shadowType} ${signed(p.shadowDelta, 2)} → ${p.pattern ?? "n/a"}`,
      ),
    ].join("\n"),
  );

  const g = c.topGrowthTrait;
  parts.push(
    `Highest over/under-confidence score: ${g.before?.trait ?? "n/a"} ${fmt(g.before?.before ?? null)} → ${g.after?.trait ?? "n/a"} ${fmt(g.after?.after ?? null)}.`,
  );

  const fb = c.feedback.filter((f) => f.before || f.after);
  if (fb.length) {
    parts.push(
      [
        "Feedback quadrants (before → after):",
        ...fb.map((f) => `- ${f.label}: ${f.before ?? "n/a"} → ${f.after ?? "n/a"}`),
      ].join("\n"),
    );
  }

  const relevant = new Map<string, TraitChange>();
  for (const t of [...moved, c.planFollowUp?.great, c.planFollowUp?.growth, g.after]) {
    if (t) relevant.set(t.trait, t);
  }
  const defs = [...relevant.values()].map(define).filter(Boolean);
  parts.push(["What the relevant traits mean:", ...defs].join("\n"));

  parts.push(`Write:
- summary: 2–4 short paragraphs for the client. Open with where they started
  (their plan, if there is one), then what's getting better, then what's worth
  watching. Refer to specific traits and point changes.
- focusTrait: the single trait most worth sitting with, usually a high or
  rising shadow trait or one that moved against the grain of everything else.
- focusNote: 1–2 paragraphs on that trait, offering a reframe as a question.
- questions: exactly three reflection questions, each tied to a trait that
  moved the most, specific enough to answer from the last month of their life.`);

  return parts.join("\n\n");
}
