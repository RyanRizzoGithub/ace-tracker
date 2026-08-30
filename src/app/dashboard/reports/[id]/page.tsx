import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getReportWithScores } from "@/lib/data";
import { ARCHETYPES, CONFIDENCE_TYPE_LABELS } from "@/lib/taxonomy";
import { ARCHETYPE_COLORS, CONFIDENCE_COLORS } from "@/lib/colors";
import type { ScoreRow } from "@/lib/types";

export default async function ReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const report = await getReportWithScores(supabase, id);
  if (!report) notFound();

  const scoreFor = (trait: string): ScoreRow | undefined =>
    report.scores.find((s) => s.trait === trait);

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
        <form action={deleteReport}>
          <button type="submit" className="btn btn-ghost">
            Delete
          </button>
        </form>
      </div>

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
                      <div
                        key={trait}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-[var(--muted)]">{trait}</span>
                        <span className="font-mono font-semibold">
                          {s?.score ?? "—"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
