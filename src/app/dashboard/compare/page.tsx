import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { loadCompareContext } from "@/lib/compare-context";
import ComparisonView from "@/components/ComparisonView";
import PrintButton from "@/components/PrintButton";
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
  const supabase = await createClient();
  const { reports, from, to, viewing, clientLabel } = await loadCompareContext(
    supabase,
    await searchParams,
  );

  if (!from || !to) {
    return (
      <div className="card mx-auto max-w-lg p-10 text-center">
        <h1 className="text-2xl font-semibold">Compare reports</h1>
        <p className="mx-auto mt-2 max-w-sm text-[var(--muted)]">
          {viewing
            ? `${clientLabel} needs at least two reports before they can be compared.`
            : "You need at least two reports to see how your results have changed."}
        </p>
        {!viewing && (
          <Link href="/dashboard/upload" className="btn btn-primary mt-6">
            Upload a report
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Compare reports</h1>
          <p className="text-sm text-[var(--muted)]">
            How the trait scores moved between two assessments.
          </p>
        </div>
        {from.id !== to.id && <PrintButton />}
      </div>

      <form method="get" className="card flex flex-wrap items-end gap-3 p-4 print:hidden">
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
