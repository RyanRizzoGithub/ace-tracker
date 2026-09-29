import type { SupabaseClient } from "@supabase/supabase-js";
import { getReportsWithScores } from "./data";
import { getViewContext } from "./viewing";
import type { CoachLink, ReportWithScores } from "./types";

type Param = string | string[] | undefined;
const first = (v: Param) => (Array.isArray(v) ? v[0] : v);

export interface CompareContext {
  /** Set while a coach is viewing a client's account. */
  viewing: CoachLink | null;
  clientLabel: string;
  reports: ReportWithScores[];
  from: ReportWithScores | null;
  to: ReportWithScores | null;
}

/**
 * Resolves the from/to search params for the comparison page against the
 * reports of whoever the dashboard is showing (the user, or the client a coach
 * is viewing).
 */
export async function loadCompareContext(
  supabase: SupabaseClient,
  params: { from?: Param; to?: Param },
): Promise<CompareContext> {
  const { subjectId, viewing, clientLabel } = await getViewContext();

  // Newest first.
  const reports = await getReportsWithScores(supabase, subjectId);
  if (reports.length < 2) {
    return { viewing, clientLabel, reports, from: null, to: null };
  }

  const pick = (v: Param) => reports.find((r) => r.id === first(v));
  // Default: the latest report against the one before it.
  let from = pick(params.from) ?? reports[1];
  let to = pick(params.to) ?? reports[0];
  // Always read earlier → later, whichever way round they were picked.
  if (from.report_date > to.report_date) [from, to] = [to, from];

  return { viewing, clientLabel, reports, from, to };
}
