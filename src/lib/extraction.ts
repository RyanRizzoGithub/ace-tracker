import { z } from "zod";
import { ARCHETYPE_NAMES, ALL_TRAITS, TRAIT_LOOKUP } from "./taxonomy";
import type { ConfidenceType } from "./taxonomy";

/**
 * Shape of the structured data we ask Claude to return after reading a
 * Confidence Profile PDF, plus a tolerant validator. The extractor is allowed
 * to return a null score when a value is unreadable — the confirm screen lets
 * the user fill it in before saving.
 */

export const extractedScoreSchema = z.object({
  trait: z.string().min(1),
  confidenceType: z.enum(["AC", "OC", "UC"]),
  score: z.number().nullable(),
});

export const extractedReportSchema = z.object({
  /** ISO date parsed from the "prepared for" header, e.g. "2025-11-09". */
  reportDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD"),
  preparedFor: z.string().nullable().optional(),
  headlineArchetype: z.string().nullable(),
  narrative: z.string().nullable(),
  scores: z.array(extractedScoreSchema),
});

export type ExtractedScore = z.infer<typeof extractedScoreSchema>;
export type ExtractedReport = z.infer<typeof extractedReportSchema>;

/** JSON schema-ish description embedded in the extraction prompt. */
export const EXTRACTION_INSTRUCTIONS = `You are reading a "Confidence Profile" assessment PDF.

Return ONLY a JSON object with this exact shape:
{
  "reportDate": "YYYY-MM-DD",           // from the "PREPARED FOR" header date
  "preparedFor": "Full Name" | null,     // the person's name
  "headlineArchetype": "Convincer" | null, // the single overview archetype
  "narrative": "..." | null,             // the overview paragraph, verbatim
  "scores": [
    { "trait": "Accomplished", "confidenceType": "AC", "score": 3.5 },
    ...
  ]
}

Rules:
- The six archetypes are: ${ARCHETYPE_NAMES.join(", ")}.
- confidenceType is "AC" (authentic confidence), "OC" (over confidence), or "UC" (under confidence).
- Include every trait shown in the traits grid, using the exact trait label text.
- Read each trait's numeric score from the bars/values in the document. If a
  value is genuinely unreadable, use null for that trait's score — do not guess.
- Do not include any text outside the JSON object.`;

/** A canonical, fully-populated score ready to persist to report_scores. */
export interface CanonicalScore {
  archetype_key: string;
  archetype_name: string;
  confidence_type: ConfidenceType;
  trait: string;
  score: number | null;
}

/**
 * Maps a raw extraction onto the fixed 36-trait taxonomy. Extracted traits are
 * matched by name (case-insensitive); any trait the extractor missed comes
 * through with a null score so the confirm screen can surface the gap.
 */
export function toCanonicalScores(extracted: ExtractedReport): CanonicalScore[] {
  const byTrait = new Map<string, number | null>();
  for (const s of extracted.scores) {
    const def = TRAIT_LOOKUP.get(s.trait.trim().toLowerCase());
    if (def) byTrait.set(def.trait.toLowerCase(), s.score);
  }
  return ALL_TRAITS.map((t) => ({
    archetype_key: t.archetypeKey,
    archetype_name: t.archetypeName,
    confidence_type: t.confidenceType,
    trait: t.trait,
    score: byTrait.has(t.trait.toLowerCase())
      ? (byTrait.get(t.trait.toLowerCase()) ?? null)
      : null,
  }));
}

/** Pulls the first top-level JSON object out of a model response. */
export function parseExtractionJson(raw: string): unknown {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : raw;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) {
    throw new Error("No JSON object found in extraction response");
  }
  return JSON.parse(candidate.slice(start, end + 1));
}
