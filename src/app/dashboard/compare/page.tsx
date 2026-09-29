import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getReportsWithScores } from "@/lib/data";
import ComparisonView from "@/components/ComparisonView";
import type { ReportWithScores } from "@/lib/types";

function label(r: ReportWithScores) {
  const date = new Date(r.report_date + "T00:00:00").toLocaleDateString(
    undefined,
    { dateStyle: "medium" },
  );
  return r.headline_archetype ? `${date} · ${r.headline_archetype}` : date;
}

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string | string[]; to?: string | string[] }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  // Newest first.
  const reports = await getReportsWithScores(supabase);

  if (reports.length < 2) {
    return (
      <div className="card mx-auto max-w-lg p-10 text-center">
        <h1 className="text-2xl font-semibold">Compare reports</h1>
        <p className="mx-auto mt-2 max-w-sm text-[var(--muted)]">
          You need at least two reports to see how your results have changed.
        </p>
        <Link href="/dashboard/upload" className="btn btn-primary mt-6">
          Upload a report
        </Link>
      </div>
    );
  }

  const pick = (v: string | string[] | undefined) =>
    reports.find((r) => r.id === (Array.isArray(v) ? v[0] : v));

  // Default: the latest report against the one before it.
  let from = pick(params.from) ?? reports[1];
  let to = pick(params.to) ?? reports[0];
  // Always read earlier → later, whichever way round they were picked.
  if (from.report_date > to.report_date) [from, to] = [to, from];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Compare reports</h1>
        <p className="text-sm text-[var(--muted)]">
          How your trait scores moved between two assessments.
        </p>
      </div>

      <form
        method="get"
        className="card flex flex-wrap items-end gap-3 p-4"
      >
        <label className="min-w-[12rem] flex-1 text-sm">
          <span className="eyebrow mb-1 block">Before</span>
          <select name="from" defaultValue={from.id} className="input">
            {reports.map((r) => (
              <option key={r.id} value={r.id}>
                {label(r)}
              </option>
            ))}
          </select>
        </label>
        <label className="min-w-[12rem] flex-1 text-sm">
          <span className="eyebrow mb-1 block">After</span>
          <select name="to" defaultValue={to.id} className="input">
            {reports.map((r) => (
              <option key={r.id} value={r.id}>
                {label(r)}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className="btn btn-primary">
          Compare
        </button>
      </form>

      {from.id === to.id ? (
        <div className="card p-10 text-center text-[var(--muted)]">
          Pick two different reports to compare.
        </div>
      ) : (
        <ComparisonView before={from} after={to} />
      )}
    </div>
  );
}
