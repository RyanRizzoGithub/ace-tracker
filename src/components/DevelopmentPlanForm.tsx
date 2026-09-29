"use client";

import { useRef, useState, useTransition } from "react";
import { ALL_TRAITS } from "@/lib/taxonomy";
import { saveDevelopmentPlan } from "@/app/dashboard/actions";
import type { DevelopmentPlan, DevelopmentPlanFields } from "@/lib/types";

const EMPTY: DevelopmentPlanFields = {
  great_trait: null,
  great_trait_words: null,
  great_next_step: null,
  growth_trait: null,
  growth_trait_words: null,
  growth_next_step: null,
  communicating: null,
  life_change: null,
};

const GREAT_TRAITS = ALL_TRAITS.filter((t) => t.confidenceType === "AC");
const GROWTH_TRAITS = ALL_TRAITS.filter((t) => t.confidenceType !== "AC");

function pick(plan: DevelopmentPlan | null | undefined): DevelopmentPlanFields {
  if (!plan) return EMPTY;
  return Object.fromEntries(
    Object.keys(EMPTY).map((k) => [k, plan[k as keyof DevelopmentPlanFields]]),
  ) as DevelopmentPlanFields;
}

function Answer({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div>
      <div className="eyebrow mb-0.5">{label}</div>
      <p className="whitespace-pre-line leading-relaxed text-[var(--ink-mid)]">{value}</p>
    </div>
  );
}

/**
 * The Confidence Development Plan for one report. Owners can type it in or
 * import it from their filled-in Confidence Traits report PDF; everyone else
 * (a coach) sees it read-only.
 */
export default function DevelopmentPlanForm({
  reportId,
  plan,
  editable,
}: {
  reportId: string;
  plan: DevelopmentPlan | null | undefined;
  editable: boolean;
}) {
  const [fields, setFields] = useState<DevelopmentPlanFields>(pick(plan));
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const [importing, setImporting] = useState(false);
  const [saving, startSaving] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  const hasPlan = Object.values(pick(plan)).some(Boolean);
  const set = (k: keyof DevelopmentPlanFields, v: string) =>
    setFields((f) => ({ ...f, [k]: v === "" ? null : v }));

  async function importPdf(file: File) {
    setImporting(true);
    setMessage(null);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/extract-plan", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Import failed");
      setFields({ ...EMPTY, ...data });
      setEditing(true);
      setMessage({ tone: "ok", text: "Imported. Check the answers, then save." });
    } catch (err) {
      setMessage({ tone: "error", text: err instanceof Error ? err.message : "Import failed" });
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function save() {
    startSaving(async () => {
      const result = await saveDevelopmentPlan(reportId, fields);
      if (result.ok) {
        setEditing(false);
        setMessage({ tone: "ok", text: "Plan saved." });
      } else {
        setMessage({ tone: "error", text: result.error });
      }
    });
  }

  const header = (
    <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 className="text-lg font-semibold">Development plan</h2>
        <p className="text-sm text-[var(--muted)]">
          The great trait to leverage and the growth trait to resolve, chosen
          after this report. The next comparison starts from here.
        </p>
      </div>
      {editable && !editing && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="btn btn-ghost"
            disabled={importing}
            onClick={() => fileRef.current?.click()}
          >
            {importing ? "Reading PDF…" : "Import from PDF"}
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => setEditing(true)}>
            {hasPlan ? "Edit" : "Add plan"}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) importPdf(f);
            }}
          />
        </div>
      )}
    </div>
  );

  const note = message && (
    <p
      className="mt-3 text-sm"
      style={{ color: message.tone === "ok" ? "var(--teal-dark)" : "var(--oc)" }}
    >
      {message.text}
    </p>
  );

  if (!editing) {
    return (
      <div className="card p-6">
        {header}
        {hasPlan ? (
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-3">
              <div>
                <div className="eyebrow mb-0.5">Great trait to leverage</div>
                <div className="font-semibold" style={{ color: "var(--ac)" }}>
                  {plan?.great_trait ?? "—"}
                </div>
              </div>
              <Answer label="In their words" value={plan?.great_trait_words ?? null} />
              <Answer label="Next step" value={plan?.great_next_step ?? null} />
            </div>
            <div className="space-y-3">
              <div>
                <div className="eyebrow mb-0.5">Growth trait to resolve</div>
                <div className="font-semibold" style={{ color: "var(--uc)" }}>
                  {plan?.growth_trait ?? "—"}
                </div>
              </div>
              <Answer label="In their words" value={plan?.growth_trait_words ?? null} />
              <Answer label="Next step" value={plan?.growth_next_step ?? null} />
            </div>
            <div className="space-y-3 md:col-span-2">
              <Answer label="Communicating confidence" value={plan?.communicating ?? null} />
              <Answer label="How life will change" value={plan?.life_change ?? null} />
            </div>
          </div>
        ) : (
          <p className="text-sm text-[var(--muted)]">
            {editable
              ? "No plan yet. Import it from the last page of the Confidence Traits report, or type it in."
              : "No development plan recorded for this report."}
          </p>
        )}
        {note}
      </div>
    );
  }

  const text = (k: keyof DevelopmentPlanFields, label: string, rows = 2) => (
    <label className="block">
      <span className="mb-1 block text-sm font-medium">{label}</span>
      <textarea
        className="input"
        rows={rows}
        value={fields[k] ?? ""}
        onChange={(e) => set(k, e.target.value)}
      />
    </label>
  );

  return (
    <div className="card p-6">
      {header}
      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-3">
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Great trait to leverage</span>
            <select
              className="input"
              value={fields.great_trait ?? ""}
              onChange={(e) => set("great_trait", e.target.value)}
            >
              <option value="">—</option>
              {GREAT_TRAITS.map((t) => (
                <option key={t.trait} value={t.trait}>
                  {t.trait} ({t.archetypeName})
                </option>
              ))}
            </select>
          </label>
          {text("great_trait_words", "In your words")}
          {text("great_next_step", "Next step")}
        </div>
        <div className="space-y-3">
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Growth trait to resolve</span>
            <select
              className="input"
              value={fields.growth_trait ?? ""}
              onChange={(e) => set("growth_trait", e.target.value)}
            >
              <option value="">—</option>
              {GROWTH_TRAITS.map((t) => (
                <option key={t.trait} value={t.trait}>
                  {t.trait} ({t.archetypeName} {t.confidenceType})
                </option>
              ))}
            </select>
          </label>
          {text("growth_trait_words", "In your words")}
          {text("growth_next_step", "Next step")}
        </div>
        <div className="space-y-3 md:col-span-2">
          {text("communicating", "How will you communicate your greatness and growth area?")}
          {text("life_change", "How will your life change? Who will hold you accountable? How will you celebrate?", 3)}
        </div>
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <button
          type="button"
          className="btn btn-ghost"
          disabled={saving}
          onClick={() => {
            setFields(pick(plan));
            setEditing(false);
            setMessage(null);
          }}
        >
          Cancel
        </button>
        <button type="button" className="btn btn-primary" disabled={saving} onClick={save}>
          {saving ? "Saving…" : "Save plan"}
        </button>
      </div>
      {note}
    </div>
  );
}
