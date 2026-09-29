import {
  compareReports,
  directionOf,
  type Direction,
  type PairCheck,
  type PairPattern,
  type TraitChange,
} from "@/lib/comparison";
import { CONFIDENCE_TYPE_LABELS, type ConfidenceType } from "@/lib/taxonomy";
import { ARCHETYPE_COLORS, CONFIDENCE_COLORS } from "@/lib/colors";
import type { ReportWithScores, ReviewNote } from "@/lib/types";
import TraitInfo from "@/components/TraitInfo";

function PlanTrait({
  label,
  trait,
  words,
  change,
}: {
  label: string;
  trait: string | null;
  words: string | null;
  change: TraitChange | null;
}) {
  if (!trait) return null;
  const style = change?.direction ? DIRECTION_STYLES[change.direction] : null;
  return (
    <div className="rounded-[var(--radius-sm)] border border-[var(--sand-mid)] p-4">
      <div className="eyebrow mb-1">{label}</div>
      {change ? (
        <TraitInfo trait={trait} confidenceType={change.confidenceType} className="font-semibold">
          <DeltaChip delta={change.delta} direction={change.direction} />
        </TraitInfo>
      ) : (
        <div className="font-semibold">{trait}</div>
      )}
      {words && (
        <p className="mt-2 text-sm italic leading-relaxed text-[var(--ink-mid)]">
          &ldquo;{words}&rdquo;
        </p>
      )}
      {change && (
        <p className="mt-2 text-sm text-[var(--ink-mid)]">
          <span className="font-mono">
            {fmt(change.before)} → {fmt(change.after)}
          </span>
          {style && (
            <span className="ml-2" style={{ color: style.color }}>
              {change.direction === "steady"
                ? change.confidenceType === "AC"
                  ? "held steady: a strength that's staying built"
                  : "held steady"
                : change.direction === "better"
                  ? "moved in the direction you set out to go"
                  : "moved the other way; worth a conversation"}
            </span>
          )}
        </p>
      )}
    </div>
  );
}

function CoachReview({ note }: { note: ReviewNote }) {
  const paragraphs = (s: string | null) =>
    (s ?? "").split(/\n\s*\n/).filter((p) => p.trim());
  return (
    <section className="card p-6" style={{ borderTop: "3px solid var(--teal-dark)" }}>
      <div className="eyebrow mb-1">From your coach</div>
      <h2 className="mb-3 text-lg font-semibold">Your review</h2>
      <div className="space-y-3 leading-relaxed text-[var(--ink-mid)]">
        {paragraphs(note.summary).map((p, i) => (
          <p key={i} className="whitespace-pre-line">{p}</p>
        ))}
      </div>
      {note.focus_trait && (
        <div className="mt-5 rounded-[var(--radius-sm)] bg-[var(--sand)] p-4">
          <div className="eyebrow mb-1">The one worth sitting with</div>
          <div className="mb-2 font-semibold">{note.focus_trait}</div>
          <div className="space-y-2 text-sm leading-relaxed text-[var(--ink-mid)]">
            {paragraphs(note.focus_note).map((p, i) => (
              <p key={i} className="whitespace-pre-line">{p}</p>
            ))}
          </div>
        </div>
      )}
      {note.questions.length > 0 && (
        <div className="mt-5">
          <div className="eyebrow mb-2">Questions worth sitting with</div>
          <ol className="space-y-2">
            {note.questions.map((q, i) => (
              <li key={i} className="flex gap-3 text-sm leading-relaxed">
                <span className="font-semibold text-[var(--teal-dark)]">{i + 1}</span>
                <span>{q}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </section>
  );
}

const DIRECTION_STYLES: Record<Direction, { color: string; bg: string; label: string }> = {
  better: { color: "var(--teal-dark)", bg: "var(--teal-light)", label: "better" },
  worse: { color: "var(--coral)", bg: "var(--coral-light)", label: "worth watching" },
  steady: { color: "var(--ink-light)", bg: "var(--sand)", label: "held steady" },
};

const SHADOW_WORD: Record<ConfidenceType, string> = {
  AC: "authentic",
  OC: "over-confidence",
  UC: "under-confidence",
};

function formatDate(d: string, style: "long" | "medium" = "long") {
  return new Date(d + "T00:00:00").toLocaleDateString(undefined, {
    dateStyle: style,
  });
}

function fmt(n: number | null, places = 1) {
  return n === null ? "—" : n.toFixed(places);
}

function fmtDelta(n: number | null, places = 1) {
  if (n === null) return "—";
  const v = Number(n.toFixed(places));
  if (v === 0) return (0).toFixed(places);
  return (v > 0 ? "+" : "−") + Math.abs(v).toFixed(places);
}

function DeltaChip({
  delta,
  direction,
  places = 1,
  suffix = "",
}: {
  delta: number | null;
  direction: Direction | null;
  places?: number;
  suffix?: string;
}) {
  const s = direction ? DIRECTION_STYLES[direction] : DIRECTION_STYLES.steady;
  return (
    <span
      className="badge font-mono"
      style={{ color: s.color, background: s.bg }}
    >
      {fmtDelta(delta, places)}
      {suffix}
    </span>
  );
}

function pairCopy(p: PairCheck): { tone: Direction; text: string } {
  const shadow = SHADOW_WORD[p.shadowType];
  const copy: Record<PairPattern, { tone: Direction; text: string }> = {
    "moved-together-better": {
      tone: "better",
      text: `Both sides moved together: authentic traits rose while the ${shadow} side fell. This is the strongest sign of a real shift.`,
    },
    "moved-together-worse": {
      tone: "worse",
      text: `Both sides slipped together: authentic traits fell while the ${shadow} side rose.`,
    },
    "shadow-only-worse": {
      tone: "worse",
      text: `The ${shadow} side rose without a matching rise in authentic traits. The underlying pressure may have found a new outlet.`,
    },
    "shadow-only-better": {
      tone: "better",
      text: `The ${shadow} side eased while authentic traits held roughly steady. Real progress, not yet matched by authentic growth.`,
    },
    "authentic-only-better": {
      tone: "better",
      text: `Authentic traits rose while the ${shadow} side held steady.`,
    },
    "authentic-only-worse": {
      tone: "worse",
      text: `Authentic traits softened with nothing offsetting it on the ${shadow} side. Worth naming rather than letting it hide.`,
    },
    "both-rose": {
      tone: "steady",
      text: `Both sides rose: more of this profile is showing up overall, some of it calibrated and some of it not.`,
    },
    "both-fell": {
      tone: "steady",
      text: `Both sides eased: this profile is showing up less overall.`,
    },
    steady: {
      tone: "steady",
      text: `Held steady on both sides.`,
    },
  };
  return p.pattern
    ? copy[p.pattern]
    : { tone: "steady", text: "Not enough scores to compare." };
}

function MoverList({
  title,
  items,
  empty,
}: {
  title: string;
  items: TraitChange[];
  empty: string;
}) {
  return (
    <div>
      <div className="eyebrow mb-2">{title}</div>
      {items.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">{empty}</p>
      ) : (
        <ul className="space-y-2">
          {items.map((t) => (
            <li key={t.trait} className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="font-medium">{t.trait}</div>
                <div className="text-xs text-[var(--muted)]">
                  {t.archetypeName} · {t.confidenceType} · {fmt(t.before)} →{" "}
                  {fmt(t.after)}
                </div>
              </div>
              <DeltaChip delta={t.delta} direction={t.direction} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function breadthSentence(
  type: ConfidenceType,
  total: number,
  better: number,
  worse: number,
): string {
  const label = CONFIDENCE_TYPE_LABELS[type].toLowerCase();
  if (type === "AC") {
    return `${better} of ${total} ${label} traits rose, ${worse} fell.`;
  }
  return `${better} of ${total} ${label} traits dropped, ${worse} rose.`;
}

export default function ComparisonView({
  before,
  after,
  sharedNote,
  noteOnlyInPrint = false,
}: {
  before: ReportWithScores;
  after: ReportWithScores;
  /** A coach's review to show read-only (to the client, or when printing). */
  sharedNote?: ReviewNote | null;
  /** Show the review only on paper (the coach edits it on screen instead). */
  noteOnlyInPrint?: boolean;
}) {
  const c = compareReports(before, after);
  const { headline } = c;

  const tiles: {
    label: string;
    sub: string;
    type: ConfidenceType | "ratio";
    b: number | null;
    a: number | null;
  }[] = [
    { label: "Authentic", sub: "avg of 18 · higher is better", type: "AC", b: headline.before.AC, a: headline.after.AC },
    { label: "Over-confidence", sub: "avg of 9 · lower is better", type: "OC", b: headline.before.OC, a: headline.after.OC },
    { label: "Under-confidence", sub: "avg of 9 · lower is better", type: "UC", b: headline.before.UC, a: headline.after.UC },
    { label: "Balance ratio", sub: "authentic ÷ shadow · higher is better", type: "ratio", b: headline.before.ratio, a: headline.after.ratio },
  ];

  const standouts = [
    { label: "Strongest great trait", s: c.topGreatTrait },
    { label: "Most pronounced growth trait", s: c.topGrowthTrait },
  ];

  return (
    <div className="space-y-6">
      <div className="card border-l-4 p-5" style={{ borderLeftColor: "var(--teal-dark)" }}>
        <div className="eyebrow mb-1">Before you read this</div>
        <p className="leading-relaxed text-[var(--ink-mid)]">
          Each report is a snapshot of how you saw yourself on one day, not a
          verdict. A hard week or a new role can move a trait by a full point
          without anything changing underneath. Look for <em>patterns</em>:
          related traits moving together, or one staying put while everything
          around it shifts. A trait that held steady isn&apos;t a shortfall; it
          can be what a strength looks like once it&apos;s built.
        </p>
      </div>

      {c.planFollowUp && (
        <section className="card p-6">
          <h2 className="text-lg font-semibold">Where you started</h2>
          <p className="mb-4 text-sm text-[var(--muted)]">
            The development plan written after the{" "}
            {formatDate(before.report_date, "medium")} report, in your own
            words, and what happened to those two traits.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <PlanTrait
              label="Great trait to leverage"
              trait={c.planFollowUp.plan.great_trait}
              words={c.planFollowUp.plan.great_trait_words}
              change={c.planFollowUp.great}
            />
            <PlanTrait
              label="Growth trait to resolve"
              trait={c.planFollowUp.plan.growth_trait}
              words={c.planFollowUp.plan.growth_trait_words}
              change={c.planFollowUp.growth}
            />
          </div>
          {c.planFollowUp.plan.life_change && (
            <p className="mt-4 text-sm leading-relaxed text-[var(--ink-mid)]">
              <span className="font-semibold">How you hoped life would change: </span>
              <span className="italic">&ldquo;{c.planFollowUp.plan.life_change}&rdquo;</span>
            </p>
          )}
        </section>
      )}

      {sharedNote && (
        <div className={noteOnlyInPrint ? "hidden print:block" : undefined}>
          <CoachReview note={sharedNote} />
        </div>
      )}

      {/* Headline numbers */}
      <section className="card p-6">
        <h2 className="text-lg font-semibold">The headline numbers</h2>
        <p className="mb-4 text-sm text-[var(--muted)]">
          {formatDate(before.report_date, "medium")} →{" "}
          {formatDate(after.report_date, "medium")}
        </p>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {tiles.map((t) => {
            const delta = t.b !== null && t.a !== null ? t.a - t.b : null;
            let direction: Direction | null = null;
            if (delta !== null) {
              direction =
                t.type === "ratio"
                  ? Math.abs(headline.ratioChangePct ?? 0) < 1
                    ? "steady"
                    : delta > 0
                      ? "better"
                      : "worse"
                  : directionOf(t.type, delta);
            }
            return (
              <div
                key={t.label}
                className="rounded-[var(--radius-sm)] border border-[var(--sand-mid)] p-4"
              >
                <div
                  className="text-sm font-semibold"
                  style={{
                    color:
                      t.type === "ratio"
                        ? "var(--ink)"
                        : CONFIDENCE_COLORS[t.type],
                  }}
                >
                  {t.label}
                </div>
                <div className="text-xs text-[var(--muted)]">{t.sub}</div>
                <div className="mt-3 font-mono text-lg font-semibold">
                  {fmt(t.b, 2)} → {fmt(t.a, 2)}
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {t.type === "ratio" ? (
                    <DeltaChip
                      delta={headline.ratioChangePct}
                      direction={direction}
                      suffix="%"
                    />
                  ) : (
                    <DeltaChip delta={delta} direction={direction} places={2} />
                  )}
                  {direction && (
                    <span className="text-xs text-[var(--muted)]">
                      {DIRECTION_STYLES[direction].label}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <ul className="mt-4 space-y-1 text-sm text-[var(--ink-mid)]">
          {c.breadth.map((b) => (
            <li key={b.type}>
              {breadthSentence(b.type, b.total, b.better, b.worse)}
            </li>
          ))}
        </ul>
      </section>

      {/* Movers */}
      <section className="card p-6">
        <h2 className="text-lg font-semibold">What changed</h2>
        <p className="mb-4 text-sm text-[var(--muted)]">
          The largest moves in each direction, in points on the 1–6 scale.
        </p>
        <div className="grid gap-6 md:grid-cols-2">
          <MoverList
            title="Getting better"
            items={c.improvements.slice(0, 6)}
            empty="No traits moved in the right direction."
          />
          <MoverList
            title="Worth watching"
            items={c.watch.slice(0, 6)}
            empty="Nothing moved the wrong way."
          />
        </div>
      </section>

      {/* Standouts + label */}
      <section className="grid gap-4 md:grid-cols-3">
        {standouts.map(({ label, s }) => {
          const changed =
            s.before && s.after && s.before.trait !== s.after.trait;
          return (
            <div key={label} className="card p-5">
              <div className="eyebrow mb-2">{label}</div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between gap-2">
                  <span className="text-[var(--muted)]">
                    {formatDate(before.report_date, "medium")}
                  </span>
                  <span className="font-medium">
                    {s.before ? `${s.before.trait} ${fmt(s.before.before)}` : "—"}
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-[var(--muted)]">
                    {formatDate(after.report_date, "medium")}
                  </span>
                  <span className="font-medium">
                    {s.after ? `${s.after.trait} ${fmt(s.after.after)}` : "—"}
                  </span>
                </div>
              </div>
              {changed && s.after && (
                <p className="mt-3 text-sm text-[var(--ink-mid)]">
                  {s.after.trait} moved {fmtDelta(s.after.delta)} and is now
                  the highest in its group
                  {s.before &&
                    ` (${s.before.trait} ${fmtDelta(s.before.delta)})`}
                  .
                </p>
              )}
            </div>
          );
        })}
        <div className="card p-5">
          <div className="eyebrow mb-2">Profile label</div>
          <div className="text-sm font-medium">
            {before.headline_archetype ?? "—"} →{" "}
            {after.headline_archetype ?? "—"}
          </div>
          <p className="mt-3 text-sm text-[var(--ink-mid)]">
            {c.labelChanged
              ? "The label comes from a separate set of questions, not from the trait scores, so the traits won't explain the change. Treat the trait patterns as the more concrete things to act on."
              : "Same profile label on both reports."}
          </p>
        </div>
      </section>

      {/* Paired-trait check */}
      <section className="card p-6">
        <h2 className="text-lg font-semibold">Paired-trait check</h2>
        <p className="mb-4 text-sm text-[var(--muted)]">
          Each profile&apos;s authentic traits against its over- or
          under-confidence traits. When both sides move together, the shift is
          most likely real; when only one side moves, it&apos;s a pattern to
          watch.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          {c.pairs.map((p) => {
            const { tone, text } = pairCopy(p);
            const style = DIRECTION_STYLES[tone];
            return (
              <div
                key={p.archetypeKey}
                className="rounded-[var(--radius-sm)] border border-[var(--sand-mid)] p-4"
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ background: ARCHETYPE_COLORS[p.archetypeKey] }}
                    />
                    <span className="font-semibold">{p.archetypeName}</span>
                  </div>
                  <span
                    className="badge"
                    style={{ color: style.color, background: style.bg }}
                  >
                    {style.label}
                  </span>
                </div>
                <p className="mb-3 text-sm text-[var(--ink-mid)]">{text}</p>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  {(["AC", p.shadowType] as ConfidenceType[]).map((type) => (
                    <div key={type}>
                      <div
                        className="mb-1 flex justify-between font-semibold"
                        style={{ color: CONFIDENCE_COLORS[type] }}
                      >
                        <span>{type}</span>
                        <span className="font-mono">
                          avg{" "}
                          {fmtDelta(
                            type === "AC" ? p.authenticDelta : p.shadowDelta,
                            2,
                          )}
                        </span>
                      </div>
                      {p.traits
                        .filter((t) => t.confidenceType === type)
                        .map((t) => (
                          <div
                            key={t.trait}
                            className="flex justify-between gap-2 py-0.5"
                          >
                            <span className="truncate text-[var(--muted)]">
                              {t.trait}
                            </span>
                            <span
                              className="font-mono"
                              style={{
                                color: t.direction
                                  ? DIRECTION_STYLES[t.direction].color
                                  : undefined,
                              }}
                            >
                              {fmtDelta(t.delta)}
                            </span>
                          </div>
                        ))}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {c.feedback.some((f) => f.before || f.after) && (
        <section className="card p-6">
          <h2 className="text-lg font-semibold">Feedback quadrants</h2>
          <p className="mb-4 text-sm text-[var(--muted)]">
            Which kinds of feedback felt easy or hard in each report.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {c.feedback.map((f) => {
              const label = (v: string | null) =>
                v ? v[0].toUpperCase() + v.slice(1) : "—";
              const tone: Direction | null = f.changed
                ? f.after === "easy"
                  ? "better"
                  : "worse"
                : null;
              return (
                <div
                  key={f.label}
                  className="flex items-center justify-between gap-3 rounded-[var(--radius-sm)] border border-[var(--sand-mid)] px-4 py-3 text-sm"
                >
                  <span className="text-[var(--ink-mid)]">{f.label}</span>
                  <span className="flex items-center gap-2">
                    <span className="font-medium">
                      {label(f.before)} → {label(f.after)}
                    </span>
                    {tone && (
                      <span
                        className="badge"
                        style={{
                          color: DIRECTION_STYLES[tone].color,
                          background: DIRECTION_STYLES[tone].bg,
                        }}
                      >
                        changed
                      </span>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Full data */}
      <section className="card p-6">
        <h2 className="text-lg font-semibold">All 36 traits</h2>
        <p className="mb-4 text-sm text-[var(--muted)]">
          Nothing filtered out. A low over- or under-confidence score is often
          the best possible outcome, not a reason to stop paying attention.
        </p>
        <div className="grid gap-6 lg:grid-cols-3">
          {(["AC", "OC", "UC"] as ConfidenceType[]).map((type) => (
            <div key={type}>
              <div
                className="mb-2 text-sm font-semibold"
                style={{ color: CONFIDENCE_COLORS[type] }}
              >
                {CONFIDENCE_TYPE_LABELS[type]}
                <span className="ml-1 font-normal text-[var(--muted)]">
                  · {type === "AC" ? "higher" : "lower"} is better
                </span>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-[var(--muted)]">
                    <th className="py-1 font-medium">Trait</th>
                    <th className="py-1 text-right font-medium">Before</th>
                    <th className="py-1 text-right font-medium">After</th>
                    <th className="py-1 text-right font-medium">Δ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {c.changes
                    .filter((t) => t.confidenceType === type)
                    .map((t) => (
                      <tr key={t.trait}>
                        <td className="py-1.5">{t.trait}</td>
                        <td className="py-1.5 text-right font-mono">
                          {fmt(t.before)}
                        </td>
                        <td className="py-1.5 text-right font-mono">
                          {fmt(t.after)}
                        </td>
                        <td
                          className="py-1.5 text-right font-mono font-semibold"
                          style={{
                            color: t.direction
                              ? DIRECTION_STYLES[t.direction].color
                              : undefined,
                          }}
                        >
                          {fmtDelta(t.delta)}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </section>

      <details className="card p-6">
        <summary className="cursor-pointer text-lg font-semibold">
          How these numbers are calculated
        </summary>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-[var(--ink-mid)]">
          <li>
            <strong>Point changes, not percentages.</strong> A 1-point move
            means the same thing anywhere on the 1–6 scale; a percentage would
            make 1.0 → 2.0 look far bigger than 5.0 → 4.0.
          </li>
          <li>
            <strong>Direction depends on the trait.</strong> Higher is better
            for authentic-confidence traits; lower is better for over- and
            under-confidence traits. Moves under 0.05 count as held steady.
          </li>
          <li>
            <strong>Confidence Balance Ratio</strong> = average of the 18
            authentic traits ÷ the mean of the over-confidence average (9
            traits) and the under-confidence average (9 traits). Above 1 means
            authentic confidence outweighs the shadow sides.
          </li>
          <li>
            <strong>Paired-trait check.</strong> For each profile, the average
            change across its three authentic traits is compared with the
            average change across its three over- or under-confidence traits.
            A side counts as having moved when its average shifts by{" "}
            {"≥"} 0.2 points.
          </li>
        </ul>
      </details>
    </div>
  );
}
