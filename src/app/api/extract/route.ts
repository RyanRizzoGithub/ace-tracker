import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import {
  EXTRACTION_INSTRUCTIONS,
  extractedReportSchema,
  parseExtractionJson,
  toCanonicalScores,
} from "@/lib/extraction";

// PDF reading + a vision-capable model can run longer than the default.
export const maxDuration = 60;

// Model used to read the assessment PDF. Switch to "claude-sonnet-5" to roughly
// halve extraction cost if accuracy holds on your reports.
const EXTRACTION_MODEL = "claude-opus-5";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY is not configured on the server." },
      { status: 500 },
    );
  }

  const { pdfPath } = (await request.json().catch(() => ({}))) as {
    pdfPath?: string;
  };
  if (!pdfPath || !pdfPath.startsWith(`${user.id}/`)) {
    return NextResponse.json(
      { error: "Invalid or missing pdfPath" },
      { status: 400 },
    );
  }

  // Download the user's uploaded PDF from private storage (RLS-scoped).
  const { data: blob, error: dlError } = await supabase.storage
    .from("reports")
    .download(pdfPath);
  if (dlError || !blob) {
    return NextResponse.json(
      { error: `Could not read uploaded file: ${dlError?.message ?? "unknown"}` },
      { status: 400 },
    );
  }

  const base64 = Buffer.from(await blob.arrayBuffer()).toString("base64");

  const anthropic = new Anthropic();
  let message;
  try {
    message = await anthropic.messages.create({
      model: EXTRACTION_MODEL,
      max_tokens: 8000,
      thinking: { type: "adaptive" },
      system:
        "You extract structured data from assessment PDFs and reply with a single JSON object only.",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "document",
              source: {
                type: "base64",
                media_type: "application/pdf",
                data: base64,
              },
            },
            { type: "text", text: EXTRACTION_INSTRUCTIONS },
          ],
        },
      ],
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Extraction request failed";
    return NextResponse.json({ error: msg }, { status: 502 });
  }

  const textBlock = message.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    return NextResponse.json(
      { error: "Model returned no text to parse." },
      { status: 502 },
    );
  }

  let parsed;
  try {
    parsed = extractedReportSchema.parse(parseExtractionJson(textBlock.text));
  } catch {
    return NextResponse.json(
      { error: "Could not parse the extracted data. Please enter it manually." },
      { status: 422 },
    );
  }

  return NextResponse.json({
    reportDate: parsed.reportDate,
    preparedFor: parsed.preparedFor ?? null,
    headlineArchetype: parsed.headlineArchetype,
    narrative: parsed.narrative,
    scores: toCanonicalScores(parsed),
  });
}
