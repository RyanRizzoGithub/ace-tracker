import {
  PROFILE_SECTION_ORDER,
  type ProfileDetails,
} from "@/lib/profile-content";

/**
 * Renders the verbatim report sections (Overview, Top Value, Ideal Environment,
 * Motivation, Strengths, Growth Areas, Summary) for a profile, in report order.
 * Only sections present in the source document are shown. Paragraph breaks are
 * encoded as blank lines in the content and rendered as separate paragraphs.
 */
export default function ProfileSections({
  details,
}: {
  details: ProfileDetails;
}) {
  return (
    <div className="space-y-5">
      {PROFILE_SECTION_ORDER.map(({ key, label }) => {
        const value = details[key];
        if (!value) return null;
        const paragraphs = value.split(/\n\s*\n/);
        return (
          <section key={key}>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
              {label}
            </h3>
            <div className="mt-1 space-y-2 leading-relaxed text-[var(--ink-mid)]">
              {paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
