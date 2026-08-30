"use client";

import { useMemo } from "react";
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
import { ARCHETYPE_COLORS } from "@/lib/colors";

function formatDate(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "2-digit",
  });
}

/** Mean of a report's authentic-confidence (AC) trait scores for one archetype. */
function meanAcScore(report: ReportWithScores, archetypeKey: string): number | null {
  const vals = report.scores
    .filter(
      (s) => s.archetype_key === archetypeKey && s.confidence_type === "AC",
    )
    .map((s) => s.score)
    .filter((v): v is number => typeof v === "number");
  if (vals.length === 0) return null;
  return Number((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2));
}

export default function ArchetypeShiftChart({
  reports,
}: {
  reports: ReportWithScores[];
}) {
  const ordered = useMemo(
    () => [...reports].sort((a, b) => a.report_date.localeCompare(b.report_date)),
    [reports],
  );

  const data = useMemo(
    () =>
      ordered.map((r) => {
        const row: Record<string, string | number | null> = {
          date: formatDate(r.report_date),
        };
        for (const a of ARCHETYPES) row[a.name] = meanAcScore(r, a.key);
        return row;
      }),
    [ordered],
  );

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: -16 }}>
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
          {ARCHETYPES.map((a) => (
            <Line
              key={a.key}
              type="monotone"
              dataKey={a.name}
              stroke={ARCHETYPE_COLORS[a.key]}
              strokeWidth={2}
              connectNulls
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
