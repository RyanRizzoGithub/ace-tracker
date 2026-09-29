import { z } from "zod";
import { TRAIT_LOOKUP } from "./taxonomy";
import { parseWithClaude } from "./claude";
import type { DevelopmentPlanFields } from "./types";

/**
 * Reads the filled-in "Confidence Development Plan" form from the last page of
 * a Confidence Traits report PDF.
 */

const planSchema = z.object({
  found: z.boolean(),
  greatTrait: z.string().nullable(),
  greatTraitWords: z.string().nullable(),
  greatNextStep: z.string().nullable(),
  growthTrait: z.string().nullable(),
  growthTraitWords: z.string().nullable(),
  growthNextStep: z.string().nullable(),
  communicating: z.string().nullable(),
  lifeChange: z.string().nullable(),
});

const INSTRUCTIONS = `This PDF is a "Confidence Traits" report. Its last page is a
"Confidence Development Plan" form that the person may have filled in.

Read only what the person typed or wrote into the form fields:
1. Great trait to leverage → greatTrait (the trait name only) and greatTraitWords
   (the rest of their answer, in their own words).
2. Under-confidence growth trait to resolve → growthTrait and growthTraitWords.
3. Communicating confidence → communicating.
4. Next step for the great trait → greatNextStep; for the growth trait → growthNextStep.
5. How life will change / accountability / celebration → lifeChange.

Copy their words exactly, without correcting or summarising. Use null for any
field left blank. Do not use the printed instructions or example text as
answers. Set found to false if there is no development plan page or it is
entirely blank.`;

function canonicalTrait(name: string | null): string | null {
  if (!name) return null;
  const def = TRAIT_LOOKUP.get(name.trim().toLowerCase());
  return def ? def.trait : name.trim();
}

/** Returns the plan's fields, or null when the PDF has no filled-in plan. */
export async function extractDevelopmentPlan(
  pdfBase64: string,
): Promise<DevelopmentPlanFields | null> {
  const plan = await parseWithClaude({
    schema: planSchema,
    system: "You transcribe answers from filled-in PDF forms exactly as written.",
    content: [
      {
        type: "document",
        source: { type: "base64", media_type: "application/pdf", data: pdfBase64 },
      },
      { type: "text", text: INSTRUCTIONS },
    ],
    effort: "low",
  });
  if (!plan.found) return null;
  return {
    great_trait: canonicalTrait(plan.greatTrait),
    great_trait_words: plan.greatTraitWords,
    great_next_step: plan.greatNextStep,
    growth_trait: canonicalTrait(plan.growthTrait),
    growth_trait_words: plan.growthTraitWords,
    growth_next_step: plan.growthNextStep,
    communicating: plan.communicating,
    life_change: plan.lifeChange,
  };
}
