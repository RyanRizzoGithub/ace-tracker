import { compareReports, type TraitChange } from "@/lib/comparison";
import { traitContent } from "@/lib/trait-content";
import type { Slide } from "@/components/SlideDeck";
import type { ReportWithScores, ReviewNote } from "@/lib/types";


const fmt = (n: number | null, p = 1) => (n === null ? "—" : n.toFixed(p));
const signed = (n: number | null, p = 1) => {
  if (n === null) return "—";
  const v = Number(n.toFixed(p));
  return v === 0 ? (0).toFixed(p) : `${v > 0 ? "+" : "−"}${Math.abs(v).toFixed(p)}`;
};
const date = (d: string) =>
  new Date(d + "T00:00:00").toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <div className="eyebrow mb-2 text-xs">{children}</div>;
}

function Title({ children }: { children: React.ReactNode }) {
  return <h2 className="serif mb-6 text-3xl sm:text-4xl">{children}</h2>;
}

function Mover({ t }: { t: TraitChange }) {
  const good = t.direction === "better";
  return (
    <div className="rounded-[var(--radius)] border border-[var(--sand-mid)] p-4">
      <div className="text-lg font-semibold">{t.trait}</div>
      <div
        className="font-mono text-2xl font-semibold"
        style={{ color: good ? "var(--teal-dark)" : "var(--coral)" }}
      >
        {signed(t.delta)}
      </div>
      <div className="font-mono text-sm text-[var(--ink-light)]">
        {fmt(t.before)} → {fmt(t.after)}
      </div>
    </div>
  );
}

/**
 * Builds the review-call slides for one comparison, following the shape of a
 * coach's year-over-year review: framing, where you started, the headline
 * number, what's getting better, what's worth watching, the one worth sitting
 * with, three questions, and what's next.
 */
export function buildReviewSlides({
  from,
  to,
  note,
  isCoach,
  clientLabel,
}: {
  from: ReportWithScores;
  to: ReportWithScores;
  note: ReviewNote | null;
  /** True when the viewer is the client's coach (not the client). */
  isCoach: boolean;
  clientLabel: string;
}): Slide[] {
  const coachLink = isCoach;
  const c = compareReports(from, to);
  const who = coachLink ? clientLabel : "You";
  const plan = c.planFollowUp;
  const h = c.headline;
  const uc = c.breadth.find((b) => b.type === "UC");
  const oc = c.breadth.find((b) => b.type === "OC");
  const shadowOnly = c.pairs.filter((p) => p.pattern === "shadow-only-worse");
  const together = c.pairs.filter((p) => p.pattern === "moved-together-better");
  const focusName = note?.focus_trait || c.topGrowthTrait.after?.trait || null;
  const focusChange = focusName
    ? c.changes.find((t) => t.trait.toLowerCase() === focusName.toLowerCase())
    : undefined;
  const focusDef = focusChange ? traitContent(focusChange.trait) : undefined;

  const slides: Slide[] = [
    {
      key: "title",
      content: (
        <div className="flex h-full flex-col justify-center">
          <Eyebrow>Your ACE comparison</Eyebrow>
          <h1 className="serif text-4xl sm:text-5xl">{who}</h1>
          <p className="mt-3 text-lg text-[var(--ink-mid)]">
            {date(from.report_date)} → {date(to.report_date)}
          </p>
        </div>
      ),
    },
    {
      key: "framing",
      notes:
        "Set the tone for the whole call before showing any numbers: nothing here is being measured against a bar they haven't cleared.",
      content: (
        <>
          <Eyebrow>Before we start</Eyebrow>
          <Title>It&apos;s a snapshot, not a verdict</Title>
          <div className="max-w-3xl space-y-4 text-lg leading-relaxed text-[var(--ink-mid)]">
            <p>
              Each report captures how you saw yourself on one day. A hard week
              or a new role can move a trait by a full point on its own.
            </p>
            <p>
              We&apos;re looking for <strong>patterns</strong>: related traits
              moving together, or one staying put while everything around it
              shifts. A trait that held steady isn&apos;t a shortfall.
            </p>
          </div>
        </>
      ),
    },
  ];

  if (plan) {
    slides.push(
      {
        key: "started",
        notes:
          "These are their own words from the last plan. Read both out loud before moving on; let them hear their plan before seeing what happened to it.",
        content: (
          <>
            <Eyebrow>Where you started</Eyebrow>
            <Title>In your own words, from {date(from.report_date)}</Title>
            <div className="grid gap-5 md:grid-cols-2">
              {[
                ["Great trait to leverage", plan.plan.great_trait, plan.plan.great_trait_words],
                ["Growth trait to resolve", plan.plan.growth_trait, plan.plan.growth_trait_words],
              ].map(([label, trait, words]) => (
                <div key={label} className="rounded-[var(--radius)] bg-[var(--sand)] p-5">
                  <div className="eyebrow mb-1">{label}</div>
                  <div className="mb-3 text-2xl font-semibold">{trait ?? "—"}</div>
                  {words && (
                    <p className="text-lg italic leading-relaxed text-[var(--ink-mid)]">
                      &ldquo;{words}&rdquo;
                    </p>
                  )}
                </div>
              ))}
            </div>
          </>
        ),
      },
      {
        key: "happened",
        notes:
          "Pick up from here, not from a blank slate. A strength that held steady is staying built; small moves at a once-a-month pace are real.",
        content: (
          <>
            <Eyebrow>What happened to those two</Eyebrow>
            <Title>Your plan, a report later</Title>
            <div className="grid gap-5 md:grid-cols-2">
              {[plan.great, plan.growth].map((t, i) =>
                t ? (
                  <div key={t.trait} className="rounded-[var(--radius)] border border-[var(--sand-mid)] p-5">
                    <div className="eyebrow mb-1">{i === 0 ? "Great trait" : "Growth trait"}</div>
                    <div className="text-2xl font-semibold">{t.trait}</div>
                    <div className="mt-2 font-mono text-3xl">
                      {fmt(t.before)} → {fmt(t.after)}
                    </div>
                    <div
                      className="mt-2 font-semibold"
                      style={{
                        color:
                          t.direction === "better"
                            ? "var(--teal-dark)"
                            : t.direction === "worse"
                              ? "var(--coral)"
                              : "var(--ink-mid)",
                      }}
                    >
                      {t.direction === "steady"
                        ? "Held steady"
                        : `${signed(t.delta)}, ${t.direction === "better" ? "the direction you set out to go" : "the other way"}`}
                    </div>
                  </div>
                ) : null,
              )}
            </div>
          </>
        ),
      },
    );
  }

  slides.push(
    {
      key: "headline",
      notes:
        "Walk the three averages first (authentic, over, under), then land on the ratio. It usually carries more than one story; name them separately.",
      content: (
        <>
          <Eyebrow>The headline number</Eyebrow>
          <Title>How much of your confidence is grounded</Title>
          <div className="grid gap-5 md:grid-cols-[1fr_1.2fr]">
            <div className="rounded-[var(--radius)] bg-[var(--sand)] p-6">
              <div className="eyebrow mb-1">Confidence balance ratio</div>
              <div className="font-mono text-4xl font-semibold">
                {fmt(h.before.ratio, 2)} → {fmt(h.after.ratio, 2)}
              </div>
              <div
                className="mt-2 text-lg font-semibold"
                style={{
                  color:
                    (h.ratioChangePct ?? 0) < 0 ? "var(--coral)" : "var(--teal-dark)",
                }}
              >
                {signed(h.ratioChangePct)}%
              </div>
            </div>
            <div className="space-y-3 text-lg">
              {(
                [
                  ["Authentic", h.before.AC, h.after.AC, "var(--ac)"],
                  ["Over-confidence", h.before.OC, h.after.OC, "var(--oc)"],
                  ["Under-confidence", h.before.UC, h.after.UC, "var(--uc)"],
                ] as const
              ).map(([label, b, a, color]) => (
                <div key={label} className="flex justify-between gap-4 border-b border-[var(--sand-mid)] pb-2">
                  <span style={{ color }} className="font-semibold">{label}</span>
                  <span className="font-mono">
                    {fmt(b, 2)} → {fmt(a, 2)}{" "}
                    <span className="text-[var(--ink-light)]">
                      ({signed(a !== null && b !== null ? a - b : null, 2)})
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      ),
    },
    {
      key: "better",
      notes: "This is the good-news slide. Let it land before moving on; don't rush past it.",
      content: (
        <>
          <Eyebrow>Getting better</Eyebrow>
          <Title>Where the movement is clearest</Title>
          <div className="grid gap-4 sm:grid-cols-3">
            {c.improvements.slice(0, 3).map((t) => (
              <Mover key={t.trait} t={t} />
            ))}
          </div>
          <ul className="mt-6 space-y-2 text-lg text-[var(--ink-mid)]">
            {uc && (
              <li>
                {uc.better} of {uc.total} under-confidence traits dropped.
              </li>
            )}
            {together.map((p) => (
              <li key={p.archetypeKey}>
                {p.archetypeName}: both sides moved together, the strongest sign of a real shift.
              </li>
            ))}
          </ul>
        </>
      ),
    },
    {
      key: "watch",
      notes:
        "The bridge into the focus trait. When one side of a profile moves and the other doesn't, the pressure may have found a new outlet rather than resolving.",
      content: (
        <>
          <Eyebrow>Worth watching</Eyebrow>
          <Title>What moved the other way</Title>
          {c.watch.length === 0 ? (
            <p className="text-lg text-[var(--ink-mid)]">Nothing moved the wrong way.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-3">
              {c.watch.slice(0, 3).map((t) => (
                <Mover key={t.trait} t={t} />
              ))}
            </div>
          )}
          <ul className="mt-6 space-y-2 text-lg text-[var(--ink-mid)]">
            {oc && oc.worse > 0 && (
              <li>
                {oc.worse} of {oc.total} over-confidence traits rose.
              </li>
            )}
            {shadowOnly.map((p) => (
              <li key={p.archetypeKey}>
                {p.archetypeName}: the {p.shadowType === "OC" ? "over" : "under"}-confidence
                side rose without a matching rise in authentic traits.
              </li>
            ))}
          </ul>
        </>
      ),
    },
  );

  if (focusName) {
    slides.push({
      key: "focus",
      notes:
        "Slow down. This is usually the most personal finding. Offer any reframe as a question, not a diagnosis, and let them answer before moving on.",
      content: (
        <>
          <Eyebrow>The one worth sitting with</Eyebrow>
          <Title>{focusName}</Title>
          {focusChange && (
            <p className="mb-4 font-mono text-xl">
              {fmt(focusChange.before)} → {fmt(focusChange.after)} ({signed(focusChange.delta)})
            </p>
          )}
          <div className="max-w-3xl space-y-3 text-lg leading-relaxed text-[var(--ink-mid)]">
            {note?.focus_note
              ? note.focus_note
                  .split(/\n\s*\n/)
                  .filter((p) => p.trim())
                  .map((p, i) => <p key={i}>{p}</p>)
              : focusDef && (
                  <>
                    <p>{focusDef.summary}</p>
                    <p>
                      <strong>At a higher score: </strong>
                      {focusDef.higher}
                    </p>
                  </>
                )}
          </div>
        </>
      ),
    });
  }

  const questions = note?.questions.filter((q) => q.trim()) ?? [];
  slides.push(
    {
      key: "questions",
      notes:
        questions.length > 0
          ? "Leave real silence after each question. These are the priority; the rest of the written review can wait."
          : "No questions saved yet. Add three in the coach notes on the compare page.",
      content: (
        <>
          <Eyebrow>Questions worth sitting with</Eyebrow>
          <Title>Tied to what moved the most</Title>
          {questions.length > 0 ? (
            <ol className="space-y-5">
              {questions.map((q, i) => (
                <li key={i} className="flex gap-4 text-lg leading-relaxed">
                  <span className="serif text-3xl text-[var(--teal-dark)]">{i + 1}</span>
                  <span className="pt-1">{q}</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-lg text-[var(--ink-light)]">
              {coachLink
                ? "Add three questions in your coach notes to show them here."
                : "Your coach hasn't shared questions for this comparison yet."}
            </p>
          )}
        </>
      ),
    },
    {
      key: "next",
      content: (
        <div className="flex h-full flex-col justify-center">
          <Eyebrow>What&apos;s next</Eyebrow>
          <Title>Thank you{coachLink ? `, ${clientLabel.split(" ")[0]}` : ""}.</Title>
          <p className="max-w-2xl text-lg leading-relaxed text-[var(--ink-mid)]">
            The full comparison, with all 36 traits and how the numbers are
            calculated, is in ACE Tracker to come back to on your own.
          </p>
        </div>
      ),
    },
  );

  return slides;
}
