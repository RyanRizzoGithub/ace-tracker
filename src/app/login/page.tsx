"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setMessage("");
    const supabase = createClient();
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${siteUrl}/auth/callback` },
    });
    if (error) {
      setStatus("error");
      setMessage(error.message);
    } else {
      setStatus("sent");
    }
  }

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-20">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="mb-8 block text-center text-sm font-semibold text-[var(--muted)]"
        >
          ← ACE Tracker
        </Link>
        <div className="card p-7">
          {status === "sent" ? (
            <div className="text-center">
              <h1 className="text-xl font-semibold">Check your email</h1>
              <p className="mt-2 text-sm text-[var(--muted)]">
                We sent a sign-in link to <strong>{email}</strong>. Open it on
                this device to continue.
              </p>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-semibold">Sign in</h1>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Enter your email and we&apos;ll send you a secure sign-in link.
                No password needed.
              </p>
              <form onSubmit={handleSubmit} className="mt-5 space-y-3">
                <input
                  type="email"
                  required
                  autoFocus
                  placeholder="you@example.com"
                  className="input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <button
                  type="submit"
                  className="btn btn-primary w-full"
                  disabled={status === "sending"}
                >
                  {status === "sending" ? "Sending…" : "Send sign-in link"}
                </button>
                {status === "error" && (
                  <p className="text-sm text-[var(--oc)]">{message}</p>
                )}
              </form>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
