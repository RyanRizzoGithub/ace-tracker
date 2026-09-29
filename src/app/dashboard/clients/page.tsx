import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser, getLinksAsCoach } from "@/lib/data";
import { acceptInvite, leaveClient } from "@/app/dashboard/actions";

export default async function ClientsPage() {
  const supabase = await createClient();
  const user = await getCurrentUser(supabase);
  const links = await getLinksAsCoach(supabase, user);
  const pending = links.filter((l) => l.status === "pending");
  const active = links.filter((l) => l.status === "active");

  // How many reports each active client has (RLS grants read access).
  const counts = new Map<string, number>();
  if (active.length > 0) {
    const { data } = await supabase
      .from("reports")
      .select("user_id")
      .in(
        "user_id",
        active.map((l) => l.client_id),
      );
    for (const r of data ?? []) {
      counts.set(r.user_id, (counts.get(r.user_id) ?? 0) + 1);
    }
  }

  const name = (l: (typeof links)[number]) =>
    l.client_name || l.client_email || "Unnamed client";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Clients</h1>
        <p className="mt-1 max-w-2xl text-sm text-[var(--muted)]">
          People who have shared their reports with you. You have read-only
          access to their reports and can write review notes on their
          comparisons.
        </p>
      </div>

      {pending.length > 0 && (
        <div className="card p-6">
          <h2 className="mb-3 text-lg font-semibold">Invitations</h2>
          <ul className="divide-y divide-[var(--border)]">
            {pending.map((l) => (
              <li key={l.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <div className="truncate font-medium">{name(l)}</div>
                  <div className="truncate text-sm text-[var(--muted)]">
                    {l.client_email} wants to share their reports with you
                  </div>
                </div>
                <div className="flex gap-2">
                  <form action={leaveClient.bind(null, l.id)}>
                    <button type="submit" className="btn btn-ghost">
                      Decline
                    </button>
                  </form>
                  <form action={acceptInvite.bind(null, l.id)}>
                    <button type="submit" className="btn btn-primary">
                      Accept
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="card p-6">
        <h2 className="mb-3 text-lg font-semibold">Your clients</h2>
        {active.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">
            No clients yet. When someone invites you by your email address
            ({user.email}), the invitation appears here.
          </p>
        ) : (
          <ul className="divide-y divide-[var(--border)]">
            {active.map((l) => (
              <li key={l.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <Link href={`/dashboard/clients/${l.client_id}`} className="min-w-0 hover:underline">
                  <div className="truncate font-medium">{name(l)}</div>
                  <div className="text-sm text-[var(--muted)]">
                    {counts.get(l.client_id) ?? 0} report
                    {(counts.get(l.client_id) ?? 0) === 1 ? "" : "s"}
                  </div>
                </Link>
                <div className="flex gap-2">
                  <Link href={`/dashboard/clients/${l.client_id}`} className="btn btn-ghost">
                    Reports
                  </Link>
                  {(counts.get(l.client_id) ?? 0) >= 2 && (
                    <Link href={`/dashboard/compare?client=${l.client_id}`} className="btn btn-primary">
                      Compare
                    </Link>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
