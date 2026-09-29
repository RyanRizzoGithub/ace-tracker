import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getActiveCoachLink,
  getCurrentUser,
  getReportsWithScores,
} from "@/lib/data";
import { leaveClient } from "@/app/dashboard/actions";
import { ARCHETYPE_COLORS } from "@/lib/colors";
import { findArchetype } from "@/lib/taxonomy";

export default async function ClientPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  const supabase = await createClient();
  const user = await getCurrentUser(supabase);
  const link = await getActiveCoachLink(supabase, user.id, clientId);
  if (!link) notFound();

  const reports = await getReportsWithScores(supabase, clientId);
  const name = link.client_name || link.client_email || "Your client";

  return (
    <div className="space-y-6">
      <Link href="/dashboard/clients" className="text-sm font-semibold text-[var(--muted)]">
        ← All clients
      </Link>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{name}</h1>
          {link.client_email && (
            <p className="text-sm text-[var(--muted)]">{link.client_email}</p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <form action={leaveClient.bind(null, link.id)}>
            <button type="submit" className="btn btn-ghost">
              Stop coaching
            </button>
          </form>
          {reports.length >= 2 && (
            <Link href={`/dashboard/compare?client=${clientId}`} className="btn btn-primary">
              Compare reports
            </Link>
          )}
        </div>
      </div>

      {reports.length === 0 ? (
        <div className="card p-10 text-center text-[var(--muted)]">
          {name} hasn&apos;t uploaded any reports yet.
        </div>
      ) : (
        <div className="card divide-y divide-[var(--border)]">
          {reports.map((r) => {
            const arch = r.headline_archetype ? findArchetype(r.headline_archetype) : undefined;
            return (
              <Link
                key={r.id}
                href={`/dashboard/reports/${r.id}`}
                className="flex items-center justify-between gap-3 px-5 py-4 hover:bg-[var(--primary-soft)]"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: arch ? ARCHETYPE_COLORS[arch.key] : "var(--muted)" }}
                  />
                  <div>
                    <div className="font-semibold">{r.headline_archetype ?? "Unknown archetype"}</div>
                    <div className="text-sm text-[var(--muted)]">
                      {new Date(r.report_date + "T00:00:00").toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="text-sm text-[var(--muted)]">
                  {r.plan ? "Plan recorded · " : ""}View →
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
