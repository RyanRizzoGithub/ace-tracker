import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getReportsWithScores } from "@/lib/data";
import { ARCHETYPE_COLORS } from "@/lib/colors";
import { findArchetype } from "@/lib/taxonomy";

export default async function ReportsPage() {
  const supabase = await createClient();
  const reports = await getReportsWithScores(supabase);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Reports</h1>
        <Link href="/dashboard/upload" className="btn btn-primary">
          Upload a report
        </Link>
      </div>

      {reports.length === 0 ? (
        <div className="card p-10 text-center text-[var(--muted)]">
          No reports yet.
        </div>
      ) : (
        <div className="card divide-y divide-[var(--border)]">
          {reports.map((r) => {
            const arch = r.headline_archetype
              ? findArchetype(r.headline_archetype)
              : undefined;
            const scored = r.scores.filter((s) => s.score !== null).length;
            return (
              <Link
                key={r.id}
                href={`/dashboard/reports/${r.id}`}
                className="flex items-center justify-between px-5 py-4 hover:bg-[var(--primary-soft)]"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{
                      background: arch
                        ? ARCHETYPE_COLORS[arch.key]
                        : "var(--muted)",
                    }}
                  />
                  <div>
                    <div className="font-semibold">
                      {r.headline_archetype ?? "Unknown archetype"}
                    </div>
                    <div className="text-sm text-[var(--muted)]">
                      {new Date(
                        r.report_date + "T00:00:00",
                      ).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="text-sm text-[var(--muted)]">
                  {scored}/{r.scores.length} traits scored →
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
