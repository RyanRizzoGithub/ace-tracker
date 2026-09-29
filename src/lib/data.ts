import type { SupabaseClient, User } from "@supabase/supabase-js";
import type {
  CoachLink,
  DevelopmentPlan,
  ReportRow,
  ReportWithScores,
  ScoreRow,
} from "./types";

/** The signed-in user (the dashboard layout guarantees one exists). */
export async function getCurrentUser(supabase: SupabaseClient): Promise<User> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return user;
}

/**
 * Loads one person's reports (newest first) with their scores and development
 * plans. Always scoped to `userId`: coaches can also read their clients'
 * reports, so an unscoped query would mix people together.
 */
export async function getReportsWithScores(
  supabase: SupabaseClient,
  userId: string,
): Promise<ReportWithScores[]> {
  const { data: reports, error } = await supabase
    .from("reports")
    .select("*")
    .eq("user_id", userId)
    .order("report_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw error;
  const rows = (reports ?? []) as ReportRow[];
  if (rows.length === 0) return [];
  const ids = rows.map((r) => r.id);

  const [{ data: scores, error: scoreError }, { data: plans }] =
    await Promise.all([
      supabase.from("report_scores").select("*").in("report_id", ids),
      supabase.from("development_plans").select("*").in("report_id", ids),
    ]);
  if (scoreError) throw scoreError;

  const byReport = new Map<string, ScoreRow[]>();
  for (const s of (scores ?? []) as ScoreRow[]) {
    const list = byReport.get(s.report_id) ?? [];
    list.push(s);
    byReport.set(s.report_id, list);
  }
  const planByReport = new Map(
    ((plans ?? []) as DevelopmentPlan[]).map((p) => [p.report_id, p]),
  );

  return rows.map((r) => ({
    ...r,
    scores: byReport.get(r.id) ?? [],
    plan: planByReport.get(r.id) ?? null,
  }));
}

/** Loads a single report with its scores and plan, or null if not visible. */
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

  const [{ data: scores }, { data: plan }] = await Promise.all([
    supabase.from("report_scores").select("*").eq("report_id", id),
    supabase.from("development_plans").select("*").eq("report_id", id).maybeSingle(),
  ]);

  return {
    ...(report as ReportRow),
    scores: (scores ?? []) as ScoreRow[],
    plan: (plan as DevelopmentPlan | null) ?? null,
  };
}

/** Links where the user is the client (their invitations to coaches). */
export async function getLinksAsClient(
  supabase: SupabaseClient,
  userId: string,
): Promise<CoachLink[]> {
  const { data } = await supabase
    .from("coach_links")
    .select("*")
    .eq("client_id", userId)
    .order("created_at", { ascending: false });
  return (data ?? []) as CoachLink[];
}

/** Links where the user is (or is invited to be) the coach. */
export async function getLinksAsCoach(
  supabase: SupabaseClient,
  user: User,
): Promise<CoachLink[]> {
  const { data } = await supabase
    .from("coach_links")
    .select("*")
    .neq("client_id", user.id)
    .neq("status", "revoked")
    .order("created_at", { ascending: false });
  // RLS already limits rows to links held by, or addressed to, this user.
  return (data ?? []) as CoachLink[];
}

/** The active link through which `coachId` coaches `clientId`, if any. */
export async function getActiveCoachLink(
  supabase: SupabaseClient,
  coachId: string,
  clientId: string,
): Promise<CoachLink | null> {
  const { data } = await supabase
    .from("coach_links")
    .select("*")
    .eq("coach_id", coachId)
    .eq("client_id", clientId)
    .eq("status", "active")
    .maybeSingle();
  return (data as CoachLink | null) ?? null;
}
