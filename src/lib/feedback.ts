import type { ReportRow } from "./types";

/**
 * The four Feedback Quadrants from page 4 of the ACE Report. Each is marked
 * either Easy or Hard for the person.
 */
export type FeedbackValue = "easy" | "hard";

export type FeedbackColumn =
  | "feedback_giving_compliments"
  | "feedback_giving_criticism"
  | "feedback_receiving_compliments"
  | "feedback_receiving_criticism";

export const FEEDBACK_QUADRANTS: {
  column: FeedbackColumn;
  /** Key used by the extractor's JSON output. */
  key: "givingCompliments" | "givingCriticism" | "receivingCompliments" | "receivingCriticism";
  label: string;
}[] = [
  { column: "feedback_giving_compliments", key: "givingCompliments", label: "Giving compliments" },
  { column: "feedback_giving_criticism", key: "givingCriticism", label: "Giving criticism" },
  { column: "feedback_receiving_compliments", key: "receivingCompliments", label: "Receiving compliments" },
  { column: "feedback_receiving_criticism", key: "receivingCriticism", label: "Receiving criticism" },
];

export function feedbackValue(
  report: Partial<ReportRow>,
  column: FeedbackColumn,
): FeedbackValue | null {
  const v = report[column];
  return v === "easy" || v === "hard" ? v : null;
}

export function parseFeedbackValue(v: unknown): FeedbackValue | null {
  return v === "easy" || v === "hard" ? v : null;
}

export function hasAnyFeedback(report: Partial<ReportRow>): boolean {
  return FEEDBACK_QUADRANTS.some((q) => feedbackValue(report, q.column) !== null);
}
