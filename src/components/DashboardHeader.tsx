import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";

const NAV_LINKS = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/reports", label: "Reports" },
  { href: "/dashboard/compare", label: "Compare" },
  { href: "/dashboard/profiles", label: "Profiles" },
  { href: "/dashboard/upload", label: "Upload" },
];

export default function DashboardHeader({
  email,
  isCoach = false,
}: {
  email?: string | null;
  /** Shows the Clients link for people who coach (or are invited to). */
  isCoach?: boolean;
}) {
  const links = isCoach
    ? [...NAV_LINKS, { href: "/dashboard/clients", label: "Clients" }]
    : NAV_LINKS;

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--sand-mid)] bg-[var(--sand)] print:hidden">
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
        <nav className="order-last -mx-4 flex w-[calc(100%+2rem)] items-center overflow-x-auto px-2 text-sm [scrollbar-width:none] sm:-mx-6 sm:w-[calc(100%+3rem)] sm:gap-1 sm:px-6 lg:order-none lg:mx-0 lg:mr-auto lg:w-auto lg:px-0">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="shrink-0 rounded-md px-1.5 py-1.5 text-[13px] whitespace-nowrap text-[var(--ink-mid)] hover:bg-[var(--teal-light)] hover:text-[var(--teal-dark)] sm:px-3 sm:text-sm"
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/sharing"
            className="text-sm whitespace-nowrap text-[var(--ink-mid)] hover:text-[var(--teal-dark)]"
          >
            Sharing
          </Link>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="btn btn-ghost"
              title={email ? `Signed in as ${email}` : undefined}
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
