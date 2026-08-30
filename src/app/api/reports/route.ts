import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const saveSchema = z.object({
  reportDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  headlineArchetype: z.string().nullable(),
  narrative: z.string().nullable(),
  pdfPath: z.string().nullable(),
  scores: z
    .array(
      z.object({
        archetype_key: z.string(),
        archetype_name: z.string(),
        confidence_type: z.enum(["AC", "OC", "UC"]),
        trait: z.string(),
        score: z.number().nullable(),
      }),
    )
    .min(1),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = saveSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid report data", details: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const data = parsed.data;

  const { data: report, error: reportError } = await supabase
    .from("reports")
    .insert({
      user_id: user.id,
      report_date: data.reportDate,
      headline_archetype: data.headlineArchetype,
      narrative: data.narrative,
      pdf_path: data.pdfPath,
      status: "complete",
    })
    .select("id")
    .single();

  if (reportError || !report) {
    return NextResponse.json(
      { error: reportError?.message ?? "Failed to save report" },
      { status: 500 },
    );
  }

  const scoreRows = data.scores.map((s) => ({
    report_id: report.id,
    user_id: user.id,
    archetype_key: s.archetype_key,
    archetype_name: s.archetype_name,
    confidence_type: s.confidence_type,
    trait: s.trait,
    score: s.score,
  }));

  const { error: scoresError } = await supabase
    .from("report_scores")
    .insert(scoreRows);

  if (scoresError) {
    // Roll back the orphaned report so a retry starts clean.
    await supabase.from("reports").delete().eq("id", report.id);
    return NextResponse.json({ error: scoresError.message }, { status: 500 });
  }

  return NextResponse.json({ id: report.id }, { status: 201 });
}
