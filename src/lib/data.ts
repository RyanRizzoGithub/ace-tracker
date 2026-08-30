import type { SupabaseClient } from "@supabase/supabase-js";
import type { ReportRow, ScoreRow, ReportWithScores } from "./types";

/** Loads all of the current user's reports (newest first) with their scores. */
export async function getReportsWithScores(
  supabase: SupabaseClient,
): Promise<ReportWithScores[]> {
  const { data: reports, error } = await supabase
    .from("reports")
    .select("*")
    .order("report_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw error;
  const rows = (reports ?? []) as ReportRow[];
  if (rows.length === 0) return [];

  const { data: scores, error: scoreError } = await supabase
    .from("report_scores")
    .select("*")
    .in(
      "report_id",
      rows.map((r) => r.id),
    );
  if (scoreError) throw scoreError;

  const byReport = new Map<string, ScoreRow[]>();
  for (const s of (scores ?? []) as ScoreRow[]) {
    const list = byReport.get(s.report_id) ?? [];
    list.push(s);
    byReport.set(s.report_id, list);
  }

  return rows.map((r) => ({ ...r, scores: byReport.get(r.id) ?? [] }));
}

/** Loads a single report with its scores, or null if not found. */
export async function getReportWithScores(
  supabase: SupabaseClient,
  id: string,
): Promise<ReportWithScores | null> {
  const { data: report } = await supabase
    .from("reports")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!report) return null;

  const { data: scores } = await supabase
    .from("report_scores")
    .select("*")
    .eq("report_id", id);

  return { ...(report as ReportRow), scores: (scores ?? []) as ScoreRow[] };
}
