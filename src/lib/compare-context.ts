import type { SupabaseClient } from "@supabase/supabase-js";
import {
  getActiveCoachLink,
  getCurrentUser,
  getReportsWithScores,
  getReviewNotes,
} from "./data";
import type { CoachLink, ReportWithScores, ReviewNote } from "./types";

type Param = string | string[] | undefined;
const first = (v: Param) => (Array.isArray(v) ? v[0] : v);

export interface CompareContext {
  /** Whose reports are being compared (the user, or a client they coach). */
  subjectId: string;
  /** Set when the signed-in user is viewing as this client's coach. */
  coachLink: CoachLink | null;
  clientLabel: string;
  reports: ReportWithScores[];
  from: ReportWithScores | null;
  to: ReportWithScores | null;
  /** The coach's own note (coach view) or the note shared with the client. */
  note: ReviewNote | null;
}

/**
 * Resolves the from/to/client search params used by the comparison page and
 * the review-call view. Falls back to the user's own reports whenever the
 * client param doesn't match an active coaching link.
 */
export async function loadCompareContext(
  supabase: SupabaseClient,
  params: { from?: Param; to?: Param; client?: Param },
): Promise<CompareContext> {
  const user = await getCurrentUser(supabase);
  const clientParam = first(params.client);
  const coachLink =
    clientParam && clientParam !== user.id
      ? await getActiveCoachLink(supabase, user.id, clientParam)
      : null;
  const subjectId = coachLink ? coachLink.client_id : user.id;
  const clientLabel =
    coachLink?.client_name || coachLink?.client_email || "your client";

  // Newest first.
  const reports = await getReportsWithScores(supabase, subjectId);
  if (reports.length < 2) {
    return { subjectId, coachLink, clientLabel, reports, from: null, to: null, note: null };
  }

  const pick = (v: Param) => reports.find((r) => r.id === first(v));
  // Default: the latest report against the one before it.
  let from = pick(params.from) ?? reports[1];
  let to = pick(params.to) ?? reports[0];
  // Always read earlier → later, whichever way round they were picked.
  if (from.report_date > to.report_date) [from, to] = [to, from];

  let note: ReviewNote | null = null;
  if (from.id !== to.id) {
    const notes = await getReviewNotes(supabase, from.id, to.id);
    note = coachLink
      ? (notes.find((n) => n.coach_id === user.id) ?? null)
      : (notes.find((n) => n.client_id === user.id && n.shared) ?? null);
  }

  return { subjectId, coachLink, clientLabel, reports, from, to, note };
}

/** Builds a compare URL that keeps the client param when coaching. */
export function compareHref(
  path: "/dashboard/compare" | "/dashboard/compare/present",
  ctx: Pick<CompareContext, "coachLink" | "from" | "to">,
) {
  const q = new URLSearchParams();
  if (ctx.from) q.set("from", ctx.from.id);
  if (ctx.to) q.set("to", ctx.to.id);
  if (ctx.coachLink) q.set("client", ctx.coachLink.client_id);
  return `${path}?${q.toString()}`;
}
