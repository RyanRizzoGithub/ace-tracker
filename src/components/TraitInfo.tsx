import { traitContent } from "@/lib/trait-content";
import type { ConfidenceType } from "@/lib/taxonomy";

/**
 * A trait name that expands to show what the trait means and what higher and
 * lower scores tend to look like. Pure HTML <details>, so it works in server
 * components and prints cleanly.
 */
export default function TraitInfo({
  trait,
  confidenceType,
  children,
  className = "",
}: {
  trait: string;
  confidenceType: ConfidenceType;
  /** Content shown on the right of the summary row (e.g. a score). */
  children?: React.ReactNode;
  className?: string;
}) {
  const content = traitContent(trait);
  if (!content) {
    return (
      <div className={`flex items-center justify-between gap-2 ${className}`}>
        <span>{trait}</span>
        {children}
      </div>
    );
  }
  const healthier = confidenceType === "AC" ? "higher" : "lower";
  return (
    <details className={`group ${className}`}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 [&::-webkit-details-marker]:hidden">
        <span className="flex items-center gap-1.5">
          <span className="text-xs text-[var(--ink-light)] transition-transform group-open:rotate-90">
            ›
          </span>
          <span className="underline decoration-[var(--sand-mid)] decoration-dotted underline-offset-4">
            {trait}
          </span>
        </span>
        {children}
      </summary>
      <div className="mt-1.5 mb-2 space-y-1.5 rounded-[var(--radius-sm)] bg-[var(--sand)] p-3 text-xs leading-relaxed text-[var(--ink-mid)]">
        <p>{content.summary}</p>
        <p>
          <span className="font-semibold">Higher score: </span>
          {content.higher}
        </p>
        <p>
          <span className="font-semibold">Lower score: </span>
          {content.lower}
        </p>
        <p className="text-[var(--ink-light)]">
          For this trait, {healthier} is healthier.
        </p>
      </div>
    </details>
  );
}
