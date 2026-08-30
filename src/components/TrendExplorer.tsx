"use client";

import { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { ReportWithScores } from "@/lib/types";
import { ARCHETYPES } from "@/lib/taxonomy";
import { TRAIT_PALETTE } from "@/lib/colors";

function formatDate(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "2-digit",
  });
}

export default function TrendExplorer({
  reports,
}: {
  reports: ReportWithScores[];
}) {
  // Oldest -> newest for a left-to-right timeline.
  const ordered = useMemo(
    () => [...reports].sort((a, b) => a.report_date.localeCompare(b.report_date)),
    [reports],
  );

  const defaultTraits = useMemo(() => {
    const latest = ordered[ordered.length - 1];
    const arch = ARCHETYPES.find(
      (a) => a.name === latest?.headline_archetype,
    );
    return (arch?.authentic.traits ?? ARCHETYPES[0].authentic.traits).slice(0, 3);
  }, [ordered]);

  const [selected, setSelected] = useState<string[]>(defaultTraits);

  const chartData = useMemo(() => {
    return ordered.map((r) => {
      const row: Record<string, string | number | null> = {
        date: formatDate(r.report_date),
      };
      for (const s of r.scores) {
        if (selected.includes(s.trait)) row[s.trait] = s.score;
      }
      return row;
    });
  }, [ordered, selected]);

  function toggle(trait: string) {
    setSelected((cur) =>
      cur.includes(trait) ? cur.filter((t) => t !== trait) : [...cur, trait],
    );
  }

  return (
    <div>
      <div className="h-72 w-full">
        {selected.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-[var(--muted)]">
            Select one or more traits below to plot them.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 8, right: 16, bottom: 0, left: -16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: "var(--muted)" }} />
              <YAxis tick={{ fontSize: 12, fill: "var(--muted)" }} />
              <Tooltip
                contentStyle={{
                  borderRadius: 10,
                  border: "1px solid var(--border)",
                  fontSize: 13,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              {selected.map((trait, i) => (
                <Line
                  key={trait}
                  type="monotone"
                  dataKey={trait}
                  stroke={TRAIT_PALETTE[i % TRAIT_PALETTE.length]}
                  strokeWidth={2}
                  connectNulls
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="mt-6 space-y-3">
        {ARCHETYPES.map((a) => (
          <div key={a.key}>
            <div className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
              {a.name}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[...a.authentic.traits, ...a.shadow.traits].map((trait) => {
                const on = selected.includes(trait);
                return (
                  <button
                    key={trait}
                    onClick={() => toggle(trait)}
                    className="badge border"
                    style={{
                      background: on ? "var(--primary)" : "var(--surface)",
                      color: on ? "#fff" : "var(--muted)",
                      borderColor: on ? "var(--primary)" : "var(--border)",
                    }}
                  >
                    {trait}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
