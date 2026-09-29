import { createClient } from "@/lib/supabase/server";
import { getCurrentUser, getLinksAsClient } from "@/lib/data";
import { revokeCoach } from "@/app/dashboard/actions";
import InviteCoachForm from "@/components/InviteCoachForm";

const STATUS_LABEL = {
  pending: "Invited, waiting for them to accept",
  active: "Has access",
  revoked: "Access removed",
} as const;

export default async function SharingPage() {
  const supabase = await createClient();
  const user = await getCurrentUser(supabase);
  const links = await getLinksAsClient(supabase, user.id);
  const defaultName =
    links.find((l) => l.client_name)?.client_name ??
    (user.user_metadata?.display_name as string | undefined) ??
    "";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Sharing with your coach</h1>
        <p className="mt-1 max-w-2xl text-sm text-[var(--muted)]">
          A coach you invite can view your reports, comparisons and development
          plans, and write review notes for you. They can&apos;t change or delete
          anything of yours. You can remove their access at any time.
        </p>
      </div>

      <div className="card p-6">
        <h2 className="mb-3 text-lg font-semibold">Invite a coach</h2>
        <InviteCoachForm defaultName={defaultName} />
      </div>

      <div className="card p-6">
        <h2 className="mb-3 text-lg font-semibold">Your coaches</h2>
        {links.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">You haven&apos;t invited anyone yet.</p>
        ) : (
          <ul className="divide-y divide-[var(--border)]">
            {links.map((l) => (
              <li key={l.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <div className="truncate font-medium">{l.coach_email}</div>
                  <div
                    className="text-sm"
                    style={{
                      color:
                        l.status === "active"
                          ? "var(--teal-dark)"
                          : "var(--ink-light)",
                    }}
                  >
                    {STATUS_LABEL[l.status]}
                  </div>
                </div>
                {l.status !== "revoked" && (
                  <form action={revokeCoach.bind(null, l.id)}>
                    <button type="submit" className="btn btn-ghost">
                      {l.status === "pending" ? "Cancel invite" : "Remove access"}
                    </button>
                  </form>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
