import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { compareHref, loadCompareContext } from "@/lib/compare-context";
import ComparisonView from "@/components/ComparisonView";
import ReviewNotesEditor from "@/components/ReviewNotesEditor";
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
  searchParams: Promise<{
    from?: string | string[];
    to?: string | string[];
    client?: string | string[];
  }>;
}) {
  const supabase = await createClient();
  const ctx = await loadCompareContext(supabase, await searchParams);
  const { reports, from, to, coachLink, clientLabel, note } = ctx;
  const title = coachLink ? `${clientLabel}: compare reports` : "Compare reports";

  if (!from || !to) {
    return (
      <div className="card mx-auto max-w-lg p-10 text-center">
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="mx-auto mt-2 max-w-sm text-[var(--muted)]">
          {coachLink
            ? `${clientLabel} needs at least two reports before they can be compared.`
            : "You need at least two reports to see how your results have changed."}
        </p>
        {!coachLink && (
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
          {coachLink && (
            <Link
              href={`/dashboard/clients/${coachLink.client_id}`}
              className="text-sm font-semibold text-[var(--muted)] print:hidden"
            >
              ← {clientLabel}
            </Link>
          )}
          <h1 className="text-2xl font-semibold">{title}</h1>
          <p className="text-sm text-[var(--muted)]">
            How the trait scores moved between two assessments.
          </p>
        </div>
        {from.id !== to.id && (
          <div className="flex flex-wrap gap-2 print:hidden">
            <PrintButton />
            <Link href={compareHref("/dashboard/compare/present", ctx)} className="btn btn-ghost">
              Review-call view
            </Link>
          </div>
        )}
      </div>

      <form method="get" className="card flex flex-wrap items-end gap-3 p-4 print:hidden">
        {coachLink && <input type="hidden" name="client" value={coachLink.client_id} />}
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
        <>
          {coachLink && (
            <ReviewNotesEditor
              // Remount when the pair changes so the fields reset.
              key={`${from.id}:${to.id}`}
              clientId={coachLink.client_id}
              fromReportId={from.id}
              toReportId={to.id}
              note={note}
              clientLabel={clientLabel}
            />
          )}
          <ComparisonView
            before={from}
            after={to}
            sharedNote={note}
            noteOnlyInPrint={!!coachLink}
          />
        </>
      )}
    </div>
  );
}
