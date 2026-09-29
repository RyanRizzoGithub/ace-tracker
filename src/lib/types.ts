import type { ConfidenceType } from "./taxonomy";
import type { FeedbackValue } from "./feedback";

/** A row of public.reports. */
export interface ReportRow {
  id: string;
  user_id: string;
  report_date: string; // ISO date (YYYY-MM-DD)
  headline_archetype: string | null;
  narrative: string | null;
  pdf_path: string | null;
  status: string;
  created_at: string;
  feedback_giving_compliments?: FeedbackValue | null;
  feedback_giving_criticism?: FeedbackValue | null;
  feedback_receiving_compliments?: FeedbackValue | null;
  feedback_receiving_criticism?: FeedbackValue | null;
}

/** A row of public.report_scores. */
export interface ScoreRow {
  id: number;
  report_id: string;
  user_id: string;
  archetype_key: string;
  archetype_name: string;
  confidence_type: ConfidenceType;
  trait: string;
  score: number | null;
}

/** A row of public.development_plans. */
export interface DevelopmentPlan {
  id: string;
  report_id: string;
  user_id: string;
  great_trait: string | null;
  great_trait_words: string | null;
  great_next_step: string | null;
  growth_trait: string | null;
  growth_trait_words: string | null;
  growth_next_step: string | null;
  communicating: string | null;
  life_change: string | null;
  created_at: string;
  updated_at: string;
}

/** The editable fields of a development plan. */
export type DevelopmentPlanFields = Pick<
  DevelopmentPlan,
  | "great_trait"
  | "great_trait_words"
  | "great_next_step"
  | "growth_trait"
  | "growth_trait_words"
  | "growth_next_step"
  | "communicating"
  | "life_change"
>;

/** A report joined with its scores (and plan, when loaded). */
export interface ReportWithScores extends ReportRow {
  scores: ScoreRow[];
  plan?: DevelopmentPlan | null;
}

/** A row of public.coach_links. */
export interface CoachLink {
  id: string;
  client_id: string;
  client_name: string | null;
  client_email: string | null;
  coach_email: string;
  coach_id: string | null;
  status: "pending" | "active" | "revoked";
  created_at: string;
  accepted_at: string | null;
}
