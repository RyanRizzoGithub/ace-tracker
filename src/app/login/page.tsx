"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Mode = "signin" | "signup";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function handlePassword(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setNotice("");
    setBusy(true);
    const supabase = createClient();

    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({ email, password });
      setBusy(false);
      if (error) return setError(error.message);
      if (data.session) {
        router.push("/dashboard");
        router.refresh();
      } else {
        // Email confirmation is enabled on the project.
        setNotice(
          "Account created. Check your email to confirm, then sign in.",
        );
        setMode("signin");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      setBusy(false);
      if (error) return setError(error.message);
      router.push("/dashboard");
      router.refresh();
    }
  }

  async function handleMagicLink() {
    setError("");
    setNotice("");
    if (!email) return setError("Enter your email first.");
    setBusy(true);
    const supabase = createClient();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${siteUrl}/auth/callback` },
    });
    setBusy(false);
    if (error) return setError(error.message);
    setNotice(`We sent a sign-in link to ${email}. Open it in this browser.`);
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
          <h1 className="text-xl font-semibold">
            {mode === "signup" ? "Create your account" : "Sign in"}
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {mode === "signup"
              ? "Use an email and password to get started."
              : "Welcome back."}
          </p>

          <form onSubmit={handlePassword} className="mt-5 space-y-3">
            <input
              type="email"
              required
              autoFocus
              placeholder="you@example.com"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              required
              minLength={6}
              placeholder="Password (min 6 characters)"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit" className="btn btn-primary w-full" disabled={busy}>
              {busy
                ? "Working…"
                : mode === "signup"
                  ? "Create account"
                  : "Sign in"}
            </button>
          </form>

          {error && <p className="mt-3 text-sm text-[var(--oc)]">{error}</p>}
          {notice && <p className="mt-3 text-sm text-[var(--primary)]">{notice}</p>}

          <div className="mt-4 flex items-center justify-between text-sm">
            <button
              type="button"
              className="font-medium text-[var(--primary)]"
              onClick={() => {
                setMode(mode === "signup" ? "signin" : "signup");
                setError("");
                setNotice("");
              }}
            >
              {mode === "signup"
                ? "Have an account? Sign in"
                : "New here? Create account"}
            </button>
            <button
              type="button"
              className="text-[var(--muted)] hover:text-[var(--primary)]"
              onClick={handleMagicLink}
              disabled={busy}
            >
              Email me a link
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
