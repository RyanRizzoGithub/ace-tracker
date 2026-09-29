import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";

const NAV_LINKS = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/reports", label: "Reports" },
  { href: "/dashboard/compare", label: "Compare" },
  { href: "/dashboard/profiles", label: "Profiles" },
  { href: "/dashboard/upload", label: "Upload" },
];

export default function DashboardHeader({ email }: { email?: string | null }) {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--sand-mid)] bg-[var(--sand)]">
      {/* Below lg the nav drops to its own full-width row and scrolls
          sideways, so the header never overflows a phone screen. */}
      <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-x-5 gap-y-2 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2.5">
          <BrandLogo height={30} />
          <span className="hidden text-[var(--sand-mid)] sm:inline">|</span>
          <Link
            href="/dashboard"
            className="hidden text-base font-semibold whitespace-nowrap text-[var(--ink)] sm:inline"
          >
            ACE Tracker
          </Link>
        </div>
        <nav className="order-last -mx-4 flex w-[calc(100%+2rem)] items-center overflow-x-auto px-2 text-sm [scrollbar-width:none] sm:gap-1 sm:-mx-6 sm:w-[calc(100%+3rem)] sm:px-6 lg:order-none lg:mx-0 lg:mr-auto lg:w-auto lg:px-0">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="shrink-0 rounded-md px-2 py-1.5 sm:px-3 whitespace-nowrap text-[var(--ink-mid)] hover:bg-[var(--teal-light)] hover:text-[var(--teal-dark)]"
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <span className="hidden max-w-[11rem] truncate text-sm text-[var(--ink-light)] xl:block">
            {email}
          </span>
          <form action="/auth/signout" method="post">
            <button type="submit" className="btn btn-ghost">
              Sign out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
