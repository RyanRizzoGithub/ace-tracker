"use client";

import { useState, useTransition } from "react";
import { saveReviewNote } from "@/app/dashboard/actions";
import type { ReviewNote } from "@/lib/types";

/**
 * The coach's write-up for one comparison: a summary, the one trait worth
 * sitting with, and three reflection questions. "Draft with Claude" fills the
 * fields from the computed comparison; the coach edits and decides when to
 * share it with the client.
 */
export default function ReviewNotesEditor({
  clientId,
  fromReportId,
  toReportId,
  note,
  clientLabel,
}: {
  clientId: string;
  fromReportId: string;
  toReportId: string;
  note: ReviewNote | null;
  clientLabel: string;
}) {
  const [summary, setSummary] = useState(note?.summary ?? "");
  const [focusTrait, setFocusTrait] = useState(note?.focus_trait ?? "");
  const [focusNote, setFocusNote] = useState(note?.focus_note ?? "");
  const [questions, setQuestions] = useState<string[]>(
    [0, 1, 2].map((i) => note?.questions[i] ?? ""),
  );
  const [shared, setShared] = useState(note?.shared ?? false);
  const [drafting, setDrafting] = useState(false);
  const [saving, startSaving] = useTransition();
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);

  const hasContent =
    !!summary.trim() || !!focusTrait.trim() || !!focusNote.trim() || questions.some((q) => q.trim());

  async function draft() {
    if (hasContent && !window.confirm("Replace what's here with a new draft?")) return;
    setDrafting(true);
    setMessage(null);
    try {
      const res = await fetch("/api/review-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fromReportId, toReportId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Drafting failed");
      setSummary(data.summary ?? "");
      setFocusTrait(data.focusTrait ?? "");
      setFocusNote(data.focusNote ?? "");
      setQuestions([0, 1, 2].map((i) => data.questions?.[i] ?? ""));
      setMessage({ tone: "ok", text: "Draft ready. Edit it, then save." });
    } catch (err) {
      setMessage({ tone: "error", text: err instanceof Error ? err.message : "Drafting failed" });
    } finally {
      setDrafting(false);
    }
  }

  function save(nextShared = shared) {
    startSaving(async () => {
      const result = await saveReviewNote({
        clientId,
        fromReportId,
        toReportId,
        summary,
        focusTrait,
        focusNote,
        questions,
        shared: nextShared,
      });
      if (result.ok) {
        setShared(nextShared);
        setMessage({
          tone: "ok",
          text: nextShared ? `Saved and shared with ${clientLabel}.` : "Saved (not shared).",
        });
      } else {
        setMessage({ tone: "error", text: result.error });
      }
    });
  }

  const busy = drafting || saving;

  return (
    <section className="card p-6 print:hidden">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="eyebrow mb-1">Coach notes</div>
          <h2 className="text-lg font-semibold">Your review</h2>
          <p className="text-sm text-[var(--muted)]">
            {shared
              ? `Shared with ${clientLabel}: they see it on their comparison page.`
              : `Private until you share it with ${clientLabel}.`}
          </p>
        </div>
        <button type="button" className="btn btn-ghost" onClick={draft} disabled={busy}>
          {drafting ? "Drafting… (up to a minute)" : "Draft with Claude"}
        </button>
      </div>

      <div className="space-y-4">
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Summary</span>
          <textarea
            className="input"
            rows={6}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Where they started, what's getting better, what's worth watching."
          />
        </label>
        <div className="grid gap-4 md:grid-cols-[14rem_1fr]">
          <label className="block">
            <span className="mb-1 block text-sm font-medium">The one worth sitting with</span>
            <input
              className="input"
              value={focusTrait}
              onChange={(e) => setFocusTrait(e.target.value)}
              placeholder="e.g. Sacrificing"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Why, and a reframe to offer</span>
            <textarea
              className="input"
              rows={4}
              value={focusNote}
              onChange={(e) => setFocusNote(e.target.value)}
            />
          </label>
        </div>
        <fieldset className="space-y-2">
          <legend className="mb-1 text-sm font-medium">Three questions worth sitting with</legend>
          {questions.map((q, i) => (
            <div key={i} className="flex gap-2">
              <span className="mt-2 w-5 shrink-0 text-sm font-semibold text-[var(--ink-light)]">
                {i + 1}
              </span>
              <textarea
                className="input"
                rows={2}
                value={q}
                onChange={(e) =>
                  setQuestions((qs) => qs.map((x, j) => (j === i ? e.target.value : x)))
                }
              />
            </div>
          ))}
        </fieldset>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-end gap-2">
        {message && (
          <p
            className="mr-auto text-sm"
            style={{ color: message.tone === "ok" ? "var(--teal-dark)" : "var(--oc)" }}
          >
            {message.text}
          </p>
        )}
        {shared ? (
          <button type="button" className="btn btn-ghost" disabled={busy} onClick={() => save(false)}>
            Stop sharing
          </button>
        ) : (
          <button type="button" className="btn btn-ghost" disabled={busy} onClick={() => save(true)}>
            Save &amp; share
          </button>
        )}
        <button type="button" className="btn btn-primary" disabled={busy} onClick={() => save()}>
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
    </section>
  );
}
