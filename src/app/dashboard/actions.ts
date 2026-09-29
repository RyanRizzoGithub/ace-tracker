"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { FEEDBACK_QUADRANTS, parseFeedbackValue } from "@/lib/feedback";
import type { DevelopmentPlanFields } from "@/lib/types";

/**
 * Server actions for the dashboard. Every write goes through the user's own
 * Supabase session, so row-level security decides what is allowed; the checks
 * here only produce friendlier errors.
 */

type ActionResult = { ok: true } | { ok: false; error: string };

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return { supabase, user };
}

const clean = (v: FormDataEntryValue | string | null | undefined) => {
  const s = typeof v === "string" ? v.trim() : "";
  return s === "" ? null : s;
};

// ---------------------------------------------------------------------------
// Feedback quadrants (owner only)
// ---------------------------------------------------------------------------
export async function saveFeedback(reportId: string, formData: FormData) {
  const { supabase, user } = await requireUser();
  const update = Object.fromEntries(
    FEEDBACK_QUADRANTS.map((q) => [
      q.column,
      parseFeedbackValue(formData.get(q.column)),
    ]),
  );
  await supabase
    .from("reports")
    .update(update)
    .eq("id", reportId)
    .eq("user_id", user.id);
  revalidatePath(`/dashboard/reports/${reportId}`);
  revalidatePath("/dashboard/compare");
}

// ---------------------------------------------------------------------------
// Development plan (owner only)
// ---------------------------------------------------------------------------
const planSchema = z.object({
  great_trait: z.string().nullable(),
  great_trait_words: z.string().nullable(),
  great_next_step: z.string().nullable(),
  growth_trait: z.string().nullable(),
  growth_trait_words: z.string().nullable(),
  growth_next_step: z.string().nullable(),
  communicating: z.string().nullable(),
  life_change: z.string().nullable(),
});

export async function saveDevelopmentPlan(
  reportId: string,
  fields: DevelopmentPlanFields,
): Promise<ActionResult> {
  const { supabase, user } = await requireUser();
  const parsed = planSchema.safeParse(
    Object.fromEntries(
      Object.entries(fields).map(([k, v]) => [k, clean(v)]),
    ),
  );
  if (!parsed.success) return { ok: false, error: "Invalid plan data" };

  const { data: report } = await supabase
    .from("reports")
    .select("id")
    .eq("id", reportId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!report) return { ok: false, error: "Only the report's owner can edit its plan." };

  const { error } = await supabase.from("development_plans").upsert(
    {
      report_id: reportId,
      user_id: user.id,
      ...parsed.data,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "report_id" },
  );
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/dashboard/reports/${reportId}`);
  revalidatePath("/dashboard/compare");
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Sharing — client side
// ---------------------------------------------------------------------------
export async function inviteCoach(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const { supabase, user } = await requireUser();
  const email = clean(formData.get("coach_email"))?.toLowerCase();
  const name = clean(formData.get("client_name"));
  if (!email || !z.string().email().safeParse(email).success) {
    return { ok: false, error: "Enter a valid email address." };
  }
  if (email === user.email?.toLowerCase()) {
    return { ok: false, error: "You can't invite yourself." };
  }

  // Re-inviting a previously revoked coach resets the link to pending.
  const { error } = await supabase.from("coach_links").upsert(
    {
      client_id: user.id,
      client_email: user.email ?? null,
      client_name: name,
      coach_email: email,
      coach_id: null,
      status: "pending",
      accepted_at: null,
    },
    { onConflict: "client_id,coach_email" },
  );
  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard/sharing");
  return { ok: true };
}

export async function revokeCoach(linkId: string) {
  const { supabase, user } = await requireUser();
  await supabase
    .from("coach_links")
    .update({ status: "revoked" })
    .eq("id", linkId)
    .eq("client_id", user.id);
  revalidatePath("/dashboard/sharing");
}

// ---------------------------------------------------------------------------
// Sharing — coach side
// ---------------------------------------------------------------------------
export async function acceptInvite(linkId: string) {
  const { supabase } = await requireUser();
  await supabase.rpc("accept_coach_invite", { link_id: linkId });
  revalidatePath("/dashboard/clients");
  revalidatePath("/dashboard", "layout");
}

export async function leaveClient(linkId: string) {
  const { supabase } = await requireUser();
  await supabase.rpc("leave_client", { link_id: linkId });
  revalidatePath("/dashboard/clients");
  revalidatePath("/dashboard", "layout");
}

// ---------------------------------------------------------------------------
// Coach review notes
// ---------------------------------------------------------------------------
const noteSchema = z.object({
  clientId: z.string().uuid(),
  fromReportId: z.string().uuid(),
  toReportId: z.string().uuid(),
  summary: z.string().nullable(),
  focusTrait: z.string().nullable(),
  focusNote: z.string().nullable(),
  questions: z.array(z.string()),
  shared: z.boolean(),
});

export type ReviewNoteInput = z.infer<typeof noteSchema>;

export async function saveReviewNote(input: ReviewNoteInput): Promise<ActionResult> {
  const { supabase, user } = await requireUser();
  const parsed = noteSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid note data" };
  const n = parsed.data;

  const { error } = await supabase.from("review_notes").upsert(
    {
      client_id: n.clientId,
      coach_id: user.id,
      from_report_id: n.fromReportId,
      to_report_id: n.toReportId,
      summary: clean(n.summary),
      focus_trait: clean(n.focusTrait),
      focus_note: clean(n.focusNote),
      questions: n.questions.map((q) => q.trim()).filter(Boolean),
      shared: n.shared,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "coach_id,from_report_id,to_report_id" },
  );
  // RLS rejects the write unless this user actively coaches the client.
  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard/compare");
  return { ok: true };
}
