import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/dashboard");

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-20">
      <div className="w-full max-w-xl text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-xs font-semibold text-[var(--muted)]">
          Confidence Profile · progress over time
        </div>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          ACE Tracker
        </h1>
        <p className="mx-auto mt-4 max-w-md text-lg text-[var(--muted)]">
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

        <div
          id="how"
          className="mt-16 grid gap-4 text-left sm:grid-cols-3"
        >
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
              <div className="mb-2 flex h-7 w-7 items-center justify-center rounded-full bg-[var(--primary-soft)] text-sm font-bold text-[var(--primary)]">
                {c.step}
              </div>
              <h3 className="font-semibold">{c.title}</h3>
              <p className="mt-1 text-sm text-[var(--muted)]">{c.body}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
