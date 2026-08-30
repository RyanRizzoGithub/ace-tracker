import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getReportsWithScores } from "@/lib/data";
import TrendExplorer from "@/components/TrendExplorer";
import ArchetypeShiftChart from "@/components/ArchetypeShiftChart";
import { ARCHETYPE_COLORS } from "@/lib/colors";
import { findArchetype } from "@/lib/taxonomy";

export default async function DashboardPage() {
  const supabase = await createClient();
  const reports = await getReportsWithScores(supabase);
  const latest = reports[0];

  if (reports.length === 0) {
    return (
      <div className="card mx-auto max-w-lg p-10 text-center">
        <h1 className="text-2xl font-semibold">Welcome to ACE Tracker</h1>
        <p className="mx-auto mt-2 max-w-sm text-[var(--muted)]">
          Upload your first Confidence Profile report to start tracking how your
          results change over time.
        </p>
        <Link href="/dashboard/upload" className="btn btn-primary mt-6">
          Upload a report
        </Link>
      </div>
    );
  }

  const latestArch = latest.headline_archetype
    ? findArchetype(latest.headline_archetype)
    : undefined;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Overview</h1>
          <p className="text-sm text-[var(--muted)]">
            {reports.length} report{reports.length === 1 ? "" : "s"} tracked
          </p>
        </div>
        <Link href="/dashboard/upload" className="btn btn-primary">
          Upload a report
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card p-5">
          <div className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            Current archetype
          </div>
          <div className="mt-1 flex items-center gap-2">
            <span
              className="h-3 w-3 rounded-full"
              style={{
                background: latestArch
                  ? ARCHETYPE_COLORS[latestArch.key]
                  : "var(--muted)",
              }}
            />
            <span className="text-xl font-semibold">
              {latest.headline_archetype ?? "—"}
            </span>
          </div>
        </div>
        <div className="card p-5">
          <div className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            Latest report
          </div>
          <div className="mt-1 text-xl font-semibold">
            {new Date(latest.report_date + "T00:00:00").toLocaleDateString()}
          </div>
        </div>
        <div className="card p-5">
          <div className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            Reports on file
          </div>
          <div className="mt-1 text-xl font-semibold">{reports.length}</div>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-semibold">Trait scores over time</h2>
        <p className="mb-4 text-sm text-[var(--muted)]">
          Pick any traits to compare how they&apos;ve moved across your reports.
        </p>
        <TrendExplorer reports={reports} />
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-semibold">Archetype shifts</h2>
        <p className="mb-4 text-sm text-[var(--muted)]">
          Average authentic-confidence score per archetype, report by report.
        </p>
        {reports.length < 2 ? (
          <p className="py-8 text-center text-sm text-[var(--muted)]">
            Add a second report to see how your archetypes shift.
          </p>
        ) : (
          <ArchetypeShiftChart reports={reports} />
        )}
      </div>
    </div>
  );
}
