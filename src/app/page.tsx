import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import BrandLogo from "@/components/BrandLogo";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/dashboard");

  return (
    <div className="flex min-h-full flex-col">
      <header className="sticky top-0 z-50 border-b border-[var(--sand-mid)] bg-[var(--sand)]">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-center gap-3 px-6 py-4">
          <BrandLogo height={40} />
          <span className="badge border border-[var(--coral-border)] bg-[var(--coral-light)] text-[var(--coral-dark)]">
            Beta
          </span>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center px-6 py-16">
        <div className="w-full max-w-xl text-center">
          <p className="eyebrow mb-4 text-[var(--teal-dark)]">
            Confidence Profile · progress over time
          </p>
          <h1 className="text-4xl leading-tight sm:text-5xl">ACE Tracker</h1>
          <p className="mx-auto mt-4 max-w-md text-lg leading-relaxed text-[var(--ink-mid)]">
            Upload each Confidence Profile assessment you receive and watch how
            your traits and archetype shift from one report to the next.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Link href="/login" className="btn btn-primary">
              Get started
            </Link>
            <a href="#how" className="btn btn-ghost">
              How it works
            </a>
          </div>

          <div id="how" className="mt-16 grid gap-4 text-left sm:grid-cols-3">
            {[
              {
                step: "1",
                title: "Upload",
                body: "Drop in the PDF you were sent. It's stored privately to your account.",
              },
              {
                step: "2",
                title: "Auto-extract",
                body: "Your archetype and every trait score are read out and shown for a quick confirm.",
              },
              {
                step: "3",
                title: "Track",
                body: "See each trait trend across reports and how your archetype balance moves.",
              },
            ].map((c) => (
              <div key={c.step} className="card p-5">
                <div className="mb-3 flex h-7 w-7 items-center justify-center rounded-full bg-[var(--teal-light)] text-sm font-medium text-[var(--teal-dark)]">
                  {c.step}
                </div>
                <h3 className="font-medium">{c.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-[var(--ink-mid)]">
                  {c.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
