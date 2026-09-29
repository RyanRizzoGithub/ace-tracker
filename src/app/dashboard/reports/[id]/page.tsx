import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser, getReportWithScores } from "@/lib/data";
import {
  ARCHETYPES,
  CONFIDENCE_TYPE_LABELS,
  findArchetype,
} from "@/lib/taxonomy";
import { ARCHETYPE_COLORS, CONFIDENCE_COLORS } from "@/lib/colors";
import { profileDetails } from "@/lib/profile-content";
import { FEEDBACK_QUADRANTS, feedbackValue } from "@/lib/feedback";
import ProfileSections from "@/components/ProfileSections";
import TraitInfo from "@/components/TraitInfo";
import DevelopmentPlanForm from "@/components/DevelopmentPlanForm";
import { saveFeedback } from "@/app/dashboard/actions";
import type { ScoreRow } from "@/lib/types";

export default async function ReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const [user, report] = await Promise.all([
    getCurrentUser(supabase),
    getReportWithScores(supabase, id),
  ]);
  if (!report) notFound();

  // Coaches can read a client's report (RLS), but only the owner can change it.
  const isOwner = report.user_id === user.id;

  const scoreFor = (trait: string): ScoreRow | undefined =>
    report.scores.find((s) => s.trait === trait);

  const headlineArch = report.headline_archetype
    ? findArchetype(report.headline_archetype)
    : undefined;
  const headlineDetails = headlineArch
    ? profileDetails(headlineArch.key)
    : undefined;

  async function deleteReport() {
    "use server";
    const sb = await createClient();
    if (report!.pdf_path) {
      await sb.storage.from("reports").remove([report!.pdf_path]);
    }
    await sb.from("reports").delete().eq("id", id);
    revalidatePath("/dashboard/reports");
    redirect("/dashboard/reports");
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/dashboard/reports"
          className="text-sm font-semibold text-[var(--muted)]"
        >
          ← All reports
        </Link>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-semibold">
              {report.headline_archetype ?? "Unknown archetype"}
            </span>
          </div>
          <p className="text-sm text-[var(--muted)]">
            {new Date(report.report_date + "T00:00:00").toLocaleDateString(
              undefined,
              { dateStyle: "long" },
            )}
          </p>
        </div>
        {isOwner && (
          <form action={deleteReport}>
            <button type="submit" className="btn btn-ghost">
              Delete
            </button>
          </form>
        )}
      </div>

      {headlineArch && (
        <div className="card p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
              About the {headlineArch.name} profile
            </h2>
            <Link
              href="/dashboard/profiles"
              className="text-sm font-semibold text-[var(--teal-dark)]"
            >
              See all six profiles →
            </Link>
          </div>
          {headlineDetails ? (
            <ProfileSections details={headlineDetails} />
          ) : (
            <>
              <p className="text-sm font-medium text-[var(--ink-mid)]">
                {headlineArch.topValue}
              </p>
              <p className="mt-2 leading-relaxed text-[var(--ink-mid)]">
                {headlineArch.blurb}
              </p>
            </>
          )}
        </div>
      )}

      {report.narrative && (
        <div className="card p-6">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
            Overview
          </h2>
          <p className="whitespace-pre-line leading-relaxed">
            {report.narrative}
          </p>
        </div>
      )}

      <DevelopmentPlanForm reportId={report.id} plan={report.plan} editable={isOwner} />

      <div>
        <h2 className="mb-1 text-lg font-semibold">Trait scores</h2>
        <p className="mb-3 text-sm text-[var(--muted)]">
          Select a trait to see what it means.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {ARCHETYPES.map((a) => (
            <div key={a.key} className="card p-5">
              <div className="mb-3 flex items-center gap-2">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ background: ARCHETYPE_COLORS[a.key] }}
                />
                <h3 className="font-semibold">{a.name}</h3>
              </div>
              {[a.authentic, a.shadow].map((side) => (
                <div key={side.type} className="mb-3 last:mb-0">
                  <div
                    className="mb-1 text-xs font-semibold"
                    style={{ color: CONFIDENCE_COLORS[side.type] }}
                  >
                    {CONFIDENCE_TYPE_LABELS[side.type]}
                  </div>
                  <div className="space-y-1">
                    {side.traits.map((trait) => {
                      const s = scoreFor(trait);
                      return (
                        <TraitInfo
                          key={trait}
                          trait={trait}
                          confidenceType={side.type}
                          className="text-sm text-[var(--ink-mid)]"
                        >
                          <span className="font-mono font-semibold text-[var(--ink)]">
                            {s?.score ?? "—"}
                          </span>
                        </TraitInfo>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-semibold">Feedback quadrants</h2>
        <p className="mb-4 text-sm text-[var(--muted)]">
          Which kinds of feedback feel easy and which feel hard.
        </p>
        {isOwner ? (
          <form action={saveFeedback.bind(null, report.id)}>
            <div className="grid gap-4 sm:grid-cols-2">
              {FEEDBACK_QUADRANTS.map((q) => (
                <label key={q.column} className="block">
                  <span className="mb-1 block text-sm font-medium">{q.label}</span>
                  <select
                    name={q.column}
                    className="input"
                    defaultValue={feedbackValue(report, q.column) ?? ""}
                  >
                    <option value="">—</option>
                    <option value="easy">Easy</option>
                    <option value="hard">Hard</option>
                  </select>
                </label>
              ))}
            </div>
            <div className="mt-4 flex justify-end">
              <button type="submit" className="btn btn-ghost">
                Save feedback quadrants
              </button>
            </div>
          </form>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {FEEDBACK_QUADRANTS.map((q) => {
              const v = feedbackValue(report, q.column);
              return (
                <div key={q.column} className="flex justify-between gap-2 text-sm">
                  <span className="text-[var(--muted)]">{q.label}</span>
                  <span className="font-semibold">
                    {v ? (v === "easy" ? "Easy" : "Hard") : "—"}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
