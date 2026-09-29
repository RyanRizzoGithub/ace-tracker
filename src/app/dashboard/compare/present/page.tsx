import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { compareHref, loadCompareContext } from "@/lib/compare-context";
import { buildReviewSlides } from "@/components/ReviewSlides";
import SlideDeck from "@/components/SlideDeck";

export default async function PresentPage({
  searchParams,
}: {
  searchParams: Promise<{
    from?: string | string[];
    to?: string | string[];
    client?: string | string[];
  }>;
}) {
  const supabase = await createClient();
  const ctx = await loadCompareContext(supabase, await searchParams);
  const { from, to, coachLink, clientLabel, note } = ctx;

  if (!from || !to || from.id === to.id) {
    return (
      <div className="card mx-auto max-w-lg p-10 text-center text-[var(--muted)]">
        Pick two different reports on the compare page first.
        <div className="mt-4">
          <Link href="/dashboard/compare" className="btn btn-primary">
            Compare reports
          </Link>
        </div>
      </div>
    );
  }

  const who = coachLink ? clientLabel : "You";
  const slides = buildReviewSlides({
    from,
    to,
    note,
    isCoach: !!coachLink,
    clientLabel,
  });

  return (
    <div className="space-y-4">
      <Link
        href={compareHref("/dashboard/compare", ctx)}
        className="text-sm font-semibold text-[var(--muted)]"
      >
        ← Back to the comparison
      </Link>
      <SlideDeck
        slides={slides}
        showNotesToggle={!!coachLink}
        footer={`ACE comparison · ${who}`}
      />
    </div>
  );
}
