"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ARCHETYPES, ARCHETYPE_NAMES, CONFIDENCE_TYPE_LABELS } from "@/lib/taxonomy";
import { CONFIDENCE_COLORS } from "@/lib/colors";
import type { CanonicalScore } from "@/lib/extraction";

type Phase = "select" | "working" | "confirm" | "saving";

interface Draft {
  reportDate: string;
  headlineArchetype: string;
  narrative: string;
  pdfPath: string;
  scores: CanonicalScore[];
}

export default function UploadFlow({ userId }: { userId: string }) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("select");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [statusText, setStatusText] = useState("");
  const [draft, setDraft] = useState<Draft | null>(null);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setError("");
    setPhase("working");

    try {
      const supabase = createClient();
      const path = `${userId}/${crypto.randomUUID()}.pdf`;

      setStatusText("Uploading your PDF…");
      const { error: upErr } = await supabase.storage
        .from("reports")
        .upload(path, file, { contentType: "application/pdf" });
      if (upErr) throw new Error(upErr.message);

      setStatusText("Reading your report… this can take up to a minute.");
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pdfPath: path }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Extraction failed");

      setDraft({
        reportDate: data.reportDate,
        headlineArchetype: data.headlineArchetype ?? "",
        narrative: data.narrative ?? "",
        pdfPath: path,
        scores: data.scores as CanonicalScore[],
      });
      setPhase("confirm");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setPhase("select");
    }
  }

  function updateScore(trait: string, value: string) {
    setDraft((d) =>
      d
        ? {
            ...d,
            scores: d.scores.map((s) =>
              s.trait === trait
                ? { ...s, score: value === "" ? null : Number(value) }
                : s,
            ),
          }
        : d,
    );
  }

  async function handleSave() {
    if (!draft) return;
    setError("");
    setPhase("saving");
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportDate: draft.reportDate,
          headlineArchetype: draft.headlineArchetype || null,
          narrative: draft.narrative || null,
          pdfPath: draft.pdfPath,
          scores: draft.scores,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to save");
      router.push(`/dashboard/reports/${data.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
      setPhase("confirm");
    }
  }

  if (phase === "confirm" || phase === "saving") {
    return (
      <div className="space-y-5">
        <div className="card p-6">
          <h2 className="text-lg font-semibold">Confirm the details</h2>
          <p className="mb-4 text-sm text-[var(--muted)]">
            Review the extracted values and fix anything that looks off before
            saving.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-sm font-medium">Report date</span>
              <input
                type="date"
                className="input"
                value={draft!.reportDate}
                onChange={(e) =>
                  setDraft({ ...draft!, reportDate: e.target.value })
                }
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium">
                Headline archetype
              </span>
              <select
                className="input"
                value={draft!.headlineArchetype}
                onChange={(e) =>
                  setDraft({ ...draft!, headlineArchetype: e.target.value })
                }
              >
                <option value="">—</option>
                {ARCHETYPE_NAMES.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="mt-4 block">
            <span className="mb-1 block text-sm font-medium">
              Overview narrative
            </span>
            <textarea
              className="input min-h-24"
              value={draft!.narrative}
              onChange={(e) =>
                setDraft({ ...draft!, narrative: e.target.value })
              }
            />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {ARCHETYPES.map((a) => (
            <div key={a.key} className="card p-5">
              <h3 className="mb-3 font-semibold">{a.name}</h3>
              {[a.authentic, a.shadow].map((side) => (
                <div key={side.type} className="mb-3 last:mb-0">
                  <div
                    className="mb-1.5 text-xs font-semibold"
                    style={{ color: CONFIDENCE_COLORS[side.type] }}
                  >
                    {CONFIDENCE_TYPE_LABELS[side.type]}
                  </div>
                  <div className="space-y-1.5">
                    {side.traits.map((trait) => {
                      const s = draft!.scores.find((x) => x.trait === trait);
                      return (
                        <div
                          key={trait}
                          className="flex items-center justify-between gap-2 text-sm"
                        >
                          <span className="text-[var(--muted)]">{trait}</span>
                          <input
                            type="number"
                            step="0.1"
                            className="input w-24 py-1 text-right"
                            value={s?.score ?? ""}
                            onChange={(e) => updateScore(trait, e.target.value)}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        {error && <p className="text-sm text-[var(--oc)]">{error}</p>}

        <div className="flex items-center justify-end gap-3">
          <button
            className="btn btn-ghost"
            onClick={() => setPhase("select")}
            disabled={phase === "saving"}
          >
            Start over
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={phase === "saving"}
          >
            {phase === "saving" ? "Saving…" : "Save report"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleUpload} className="card p-6">
      {phase === "working" ? (
        <div className="flex flex-col items-center py-10 text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--primary)]" />
          <p className="mt-4 text-sm text-[var(--muted)]">{statusText}</p>
        </div>
      ) : (
        <>
          <label className="block">
            <span className="mb-2 block text-sm font-medium">
              Confidence Profile PDF
            </span>
            <input
              type="file"
              accept="application/pdf"
              className="input"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </label>
          {error && <p className="mt-3 text-sm text-[var(--oc)]">{error}</p>}
          <button
            type="submit"
            className="btn btn-primary mt-4"
            disabled={!file}
          >
            Upload &amp; extract
          </button>
        </>
      )}
    </form>
  );
}
