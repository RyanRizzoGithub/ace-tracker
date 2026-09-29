import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { ClaudeRefusalError } from "@/lib/claude";
import { extractDevelopmentPlan } from "@/lib/plan-extraction";

export const maxDuration = 60;

// Vercel rejects request bodies over ~4.5 MB; the Confidence Traits report is
// typically well under 1 MB.
const MAX_BYTES = 4 * 1024 * 1024;

/** Reads the development plan out of an uploaded Confidence Traits report PDF. */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File) || file.type !== "application/pdf") {
    return NextResponse.json({ error: "Upload a PDF file." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "That PDF is too large (4 MB max)." },
      { status: 413 },
    );
  }

  const base64 = Buffer.from(await file.arrayBuffer()).toString("base64");

  try {
    const plan = await extractDevelopmentPlan(base64);
    if (!plan) {
      return NextResponse.json(
        { error: "No filled-in development plan was found in that PDF." },
        { status: 422 },
      );
    }
    return NextResponse.json(plan);
  } catch (err) {
    if (err instanceof ClaudeRefusalError) {
      return NextResponse.json({ error: err.message }, { status: 422 });
    }
    if (err instanceof Anthropic.APIError) {
      return NextResponse.json(
        { error: `Claude API error (${err.status ?? "network"}): ${err.message}` },
        { status: 502 },
      );
    }
    const msg = err instanceof Error ? err.message : "Could not read the PDF.";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
