import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import BrandLogo from "@/components/BrandLogo";

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
      <header className="sticky top-0 z-50 border-b border-[var(--sand-mid)] bg-[var(--sand)]">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-2.5">
              <BrandLogo height={30} />
              <span className="hidden text-[var(--sand-mid)] sm:inline">|</span>
              <Link
                href="/dashboard"
                className="hidden text-base font-semibold text-[var(--ink)] sm:inline"
              >
                ACE Tracker
              </Link>
            </div>
            <nav className="flex items-center gap-1 text-sm">
              <Link
                href="/dashboard"
                className="rounded-md px-3 py-1.5 text-[var(--ink-mid)] hover:bg-[var(--teal-light)] hover:text-[var(--teal-dark)]"
              >
                Overview
              </Link>
              <Link
                href="/dashboard/reports"
                className="rounded-md px-3 py-1.5 text-[var(--ink-mid)] hover:bg-[var(--teal-light)] hover:text-[var(--teal-dark)]"
              >
                Reports
              </Link>
              <Link
                href="/dashboard/upload"
                className="rounded-md px-3 py-1.5 text-[var(--ink-mid)] hover:bg-[var(--teal-light)] hover:text-[var(--teal-dark)]"
              >
                Upload
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-[var(--ink-light)] sm:inline">
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
