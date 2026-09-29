import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import type { z } from "zod";

/**
 * Shared helper for the structured-output Claude calls added with the review
 * features (plan import, review-note drafts). The original ACE Report
 * extractor in /api/extract keeps its own model setting.
 */
export const REVIEW_MODEL = "claude-opus-5-5";

export class ClaudeRefusalError extends Error {}

/**
 * One request that must come back as JSON matching `schema`. If Claude's
 * safety classifiers decline, the server retries on Anthropic's recommended
 * fallback model (`fallbacks: "default"`) before reporting a refusal.
 */
export async function parseWithClaude<T extends z.ZodType>({
  schema,
  system,
  content,
  effort = "medium",
  maxTokens = 16000,
}: {
  schema: T;
  system: string;
  content: Anthropic.Beta.BetaContentBlockParam[];
  effort?: "low" | "medium" | "high";
  maxTokens?: number;
}): Promise<z.infer<T>> {
  const client = new Anthropic();
  const response = await client.beta.messages.parse({
    model: REVIEW_MODEL,
    max_tokens: maxTokens,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    thinking: { type: "adaptive" },
    output_config: { effort, format: betaZodOutputFormat(schema) },
    system,
    messages: [{ role: "user", content }],
  });

  if (response.stop_reason === "refusal") {
    throw new ClaudeRefusalError("Claude declined this request.");
  }
  if (response.parsed_output == null) {
    throw new Error(
      response.stop_reason === "max_tokens"
        ? "The response was cut off before it finished."
        : "Claude's response couldn't be read.",
    );
  }
  return response.parsed_output as z.infer<T>;
}
