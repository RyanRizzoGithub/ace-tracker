import type { ConfidenceType } from "./taxonomy";

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

/** A report joined with its scores, as used across the dashboard. */
export interface ReportWithScores extends ReportRow {
  scores: ScoreRow[];
}
