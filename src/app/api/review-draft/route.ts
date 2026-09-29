import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getActiveCoachLink, getReportWithScores } from "@/lib/data";
import { compareReports } from "@/lib/comparison";
import { ClaudeRefusalError, parseWithClaude } from "@/lib/claude";
import { REVIEW_SYSTEM, buildReviewBrief } from "@/lib/review-prompt";

export const maxDuration = 60;

const bodySchema = z.object({
  fromReportId: z.string().uuid(),
  toReportId: z.string().uuid(),
});

const draftSchema = z.object({
  summary: z.string(),
  focusTrait: z.string(),
  focusNote: z.string(),
  questions: z.array(z.string()),
});

/** Drafts a coach's review notes for one comparison. Coaches only. */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = bodySchema.safeParse(await request.json().catch(() => null));
  if (!body.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const [a, b] = await Promise.all([
    getReportWithScores(supabase, body.data.fromReportId),
    getReportWithScores(supabase, body.data.toReportId),
  ]);
  if (!a || !b || a.user_id !== b.user_id) {
    return NextResponse.json({ error: "Reports not found" }, { status: 404 });
  }
  if (!(await getActiveCoachLink(supabase, user.id, a.user_id))) {
    return NextResponse.json(
      { error: "Only the client's coach can draft review notes." },
      { status: 403 },
    );
  }

  const [before, after] = a.report_date <= b.report_date ? [a, b] : [b, a];
  const comparison = compareReports(before, after);

  try {
    const draft = await parseWithClaude({
      schema: draftSchema,
      system: REVIEW_SYSTEM,
      content: [{ type: "text", text: buildReviewBrief(comparison, before, after) }],
      effort: "high",
    });
    return NextResponse.json({ ...draft, questions: draft.questions.slice(0, 3) });
  } catch (err) {
    if (err instanceof ClaudeRefusalError) {
      return NextResponse.json({ error: err.message }, { status: 422 });
    }
    if (err instanceof Anthropic.RateLimitError) {
      return NextResponse.json(
        { error: "Claude is busy right now. Try again in a minute." },
        { status: 429 },
      );
    }
    if (err instanceof Anthropic.APIError) {
      return NextResponse.json(
        { error: `Claude API error (${err.status ?? "network"}): ${err.message}` },
        { status: 502 },
      );
    }
    const msg = err instanceof Error ? err.message : "Drafting failed";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
