import { ARCHETYPES, CONFIDENCE_TYPE_LABELS } from "@/lib/taxonomy";
import { ARCHETYPE_COLORS, CONFIDENCE_COLORS } from "@/lib/colors";
import { profileDetails } from "@/lib/profile-content";
import ProfileSections from "@/components/ProfileSections";

/**
 * Reference guide for the six Confidence Profiles. This is static, authoritative
 * content sourced from the Confidence Profile reports (© BenFauske.com) so the
 * app can describe each profile and its traits accurately. Profiles are shown in
 * confidence-spectrum order (under-confidence-leaning → over-confidence-leaning).
 */
export default function ProfilesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Confidence Profiles</h1>
        <p className="mt-1 max-w-2xl text-sm text-[var(--muted)]">
          The six Confidence Profiles, in spectrum order. Each has an authentic
          confidence side and a shadow side — either over- or under-confidence.
          There is no &ldquo;correct&rdquo; profile; each is a starting point for
          development.
        </p>
      </div>

      {ARCHETYPES.map((a) => {
        const details = profileDetails(a.key);
        return (
        <div key={a.key} className="card p-6">
          <div className="flex items-center gap-2.5">
            <span
              className="h-3.5 w-3.5 rounded-full"
              style={{ background: ARCHETYPE_COLORS[a.key] }}
            />
            <h2 className="text-lg font-semibold">{a.name}</h2>
          </div>

          <p className="mt-1 text-sm font-medium text-[var(--ink-mid)]">
            {a.topValue}
          </p>
          <p className="mt-3 max-w-3xl leading-relaxed text-[var(--ink-mid)]">
            {a.blurb}
          </p>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            {[a.authentic, a.shadow].map((side) => (
              <div key={side.type}>
                <div
                  className="mb-2 text-xs font-semibold uppercase tracking-wide"
                  style={{ color: CONFIDENCE_COLORS[side.type] }}
                >
                  {CONFIDENCE_TYPE_LABELS[side.type]}
                </div>
                <ul className="space-y-2.5">
                  {side.traits.map((trait) => (
                    <li key={trait} className="font-semibold">
                      {trait}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {details && (
            <details className="group mt-5 border-t border-[var(--border)] pt-4">
              <summary className="flex cursor-pointer list-none items-center gap-1.5 text-sm font-semibold text-[var(--teal-dark)] [&::-webkit-details-marker]:hidden">
                <span className="transition-transform group-open:rotate-90">
                  ›
                </span>
                <span className="group-open:hidden">Read the full profile</span>
                <span className="hidden group-open:inline">Hide full profile</span>
              </summary>
              <div className="mt-4">
                <ProfileSections details={details} />
              </div>
            </details>
          )}
        </div>
        );
      })}
    </div>
  );
}
