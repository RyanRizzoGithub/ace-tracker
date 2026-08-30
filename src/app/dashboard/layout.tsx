import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="font-bold tracking-tight">
              ACE Tracker
            </Link>
            <nav className="flex items-center gap-1 text-sm">
              <Link
                href="/dashboard"
                className="rounded-md px-3 py-1.5 text-[var(--muted)] hover:bg-[var(--primary-soft)] hover:text-[var(--primary)]"
              >
                Overview
              </Link>
              <Link
                href="/dashboard/reports"
                className="rounded-md px-3 py-1.5 text-[var(--muted)] hover:bg-[var(--primary-soft)] hover:text-[var(--primary)]"
              >
                Reports
              </Link>
              <Link
                href="/dashboard/upload"
                className="rounded-md px-3 py-1.5 text-[var(--muted)] hover:bg-[var(--primary-soft)] hover:text-[var(--primary)]"
              >
                Upload
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-[var(--muted)] sm:inline">
              {user.email}
            </span>
            <form action="/auth/signout" method="post">
              <button type="submit" className="btn btn-ghost">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <div className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">{children}</div>
    </div>
  );
}
