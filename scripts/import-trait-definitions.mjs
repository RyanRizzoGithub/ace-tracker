#!/usr/bin/env node
/**
 * Imports the official trait definitions from a "Confidence Traits" report PDF
 * (© BenFauske.com) into src/lib/trait-content.ts, replacing whatever is there.
 *
 * Run this yourself, with a PDF you have the right to use:
 *
 *   node scripts/import-trait-definitions.mjs "C:/path/to/Confidence Traits Report.pdf"
 *
 * Add --check to see what would be imported (trait names and text lengths
 * only) without writing anything.
 *
 * Each trait has its own page in the report, laid out as:
 *   TRAIT NAME / "<PROFILE> AC|OC|UC TRAIT" / definition /
 *   "HIGHER SCORE:" text / "LOWER SCORE:" text
 * Nothing is written unless all 36 traits are found, complete, and filed under
 * the same confidence type as src/lib/taxonomy.ts.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { ALL_TRAITS } from "../src/lib/taxonomy.ts";

const OUT_FILE = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../src/lib/trait-content.ts",
);

/** Upper-case letters only, so letter-spaced and hyphenated headings compare equal. */
const key = (s) => s.toUpperCase().replace(/[^A-Z]/g, "");

const TRAIT_TYPE_LINE =
  /^(CONVINCER|DRIVER|NEGOTIATOR|INQUISITOR|FRIENDMAKER|PEACEKEEPER)(AC|OC|UC)TRAIT$/;

const isChrome = (line) => {
  const k = key(line);
  return (
    k.includes("BENFAUSKE") ||
    k === "MYCONASSESSMENTS" ||
    k.startsWith("CONFIDENCEPROFILE") ||
    /^\d+$/.test(line.trim())
  );
};

/**
 * Parses one page's lines (top to bottom). Returns null when the page isn't a
 * trait page.
 */
export function parseTraitPage(lines) {
  const typeIdx = lines.findIndex((l) => TRAIT_TYPE_LINE.test(key(l)));
  if (typeIdx === -1) return null;
  const type = key(lines[typeIdx]).match(TRAIT_TYPE_LINE)[2];

  let titleIdx = typeIdx - 1;
  while (titleIdx >= 0 && (isChrome(lines[titleIdx]) || !lines[titleIdx].trim())) {
    titleIdx--;
  }
  const title = titleIdx >= 0 ? lines[titleIdx] : "";

  const hi = lines.findIndex((l, i) => i > typeIdx && key(l) === "HIGHERSCORE");
  const lo = lines.findIndex((l, i) => i > hi && key(l) === "LOWERSCORE");
  if (hi === -1 || lo === -1) return { title, type, incomplete: true };

  let end = lines.findIndex((l, i) => i > lo && isChrome(l));
  if (end === -1) end = lines.length;

  const text = (from, to) =>
    lines
      .slice(from, to)
      .map((l) => l.trim())
      .filter(Boolean)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();

  return {
    title,
    type,
    summary: text(typeIdx + 1, hi),
    higher: text(hi + 1, lo),
    lower: text(lo + 1, end),
  };
}

/** Groups a page's text items into visual lines, top to bottom. */
function pageLines(items) {
  const runs = items
    .filter((it) => typeof it.str === "string" && it.str.length > 0)
    .map((it) => ({
      str: it.str,
      x: it.transform[4],
      y: it.transform[5],
      w: it.width ?? 0,
      h: it.height || Math.abs(it.transform[3]) || 10,
    }))
    .sort((a, b) => b.y - a.y || a.x - b.x);

  const lines = [];
  for (const run of runs) {
    const line = lines[lines.length - 1];
    if (line && Math.abs(line.y - run.y) <= Math.max(2, run.h * 0.3)) {
      line.runs.push(run);
    } else {
      lines.push({ y: run.y, runs: [run] });
    }
  }

  return lines.map(({ runs }) => {
    runs.sort((a, b) => a.x - b.x);
    let out = "";
    let prevEnd = null;
    for (const r of runs) {
      const gap = prevEnd === null ? 0 : r.x - prevEnd;
      if (out && !out.endsWith(" ") && !r.str.startsWith(" ") && gap > r.h * 0.15) {
        out += " ";
      }
      out += r.str;
      prevEnd = r.x + r.w;
    }
    return out.replace(/\s+/g, " ").trim();
  });
}

export async function readTraits(pdfPath) {
  const { getDocument } = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const pdf = await getDocument({ data, useSystemFonts: true }).promise;
  const found = [];
  for (let n = 1; n <= pdf.numPages; n++) {
    const page = await pdf.getPage(n);
    const { items } = await page.getTextContent();
    const parsed = parseTraitPage(pageLines(items));
    if (parsed) found.push({ ...parsed, page: n });
  }
  return found;
}

/** Matches parsed pages to the 36 canonical traits and lists any problems. */
export function matchTraits(found) {
  const byKey = new Map(found.map((f) => [key(f.title), f]));
  const problems = [];
  const rows = ALL_TRAITS.map((t) => {
    const f = byKey.get(key(t.trait));
    if (!f) {
      problems.push(`${t.trait}: no page found`);
      return null;
    }
    if (f.incomplete || !f.summary || !f.higher || !f.lower) {
      problems.push(`${t.trait} (page ${f.page}): missing definition or score text`);
    }
    if (f.type !== t.confidenceType) {
      problems.push(
        `${t.trait} (page ${f.page}): report says ${f.type}, taxonomy says ${t.confidenceType}`,
      );
    }
    return { ...t, ...f };
  });
  return { rows, problems };
}

function render(rows) {
  const entries = rows
    .map(
      (r) =>
        `  ${JSON.stringify(r.trait)}: {\n` +
        `    summary: ${JSON.stringify(r.summary)},\n` +
        `    higher: ${JSON.stringify(r.higher)},\n` +
        `    lower: ${JSON.stringify(r.lower)},\n` +
        `  },`,
    )
    .join("\n");

  return `/**
 * Definitions of all 36 Confidence Profile traits, transcribed verbatim from
 * the Confidence Traits report (© BenFauske.com) and used with permission.
 *
 * GENERATED by scripts/import-trait-definitions.mjs. Re-run that script to
 * refresh this file rather than editing it by hand.
 *
 * - \`summary\`: the report's definition of the trait.
 * - \`higher\` / \`lower\`: the report's "Higher score" and "Lower score" text.
 *   For AC traits higher is healthier; for OC/UC traits lower is healthier.
 */
export interface TraitContent {
  summary: string;
  higher: string;
  lower: string;
}

export const TRAIT_CONTENT: Record<string, TraitContent> = {
${entries}
};

export function traitContent(trait: string): TraitContent | undefined {
  return TRAIT_CONTENT[trait];
}
`;
}

async function main() {
  const args = process.argv.slice(2);
  const check = args.includes("--check");
  const pdfPath = args.find((a) => !a.startsWith("--"));
  if (!pdfPath) {
    console.error(
      'Usage: node scripts/import-trait-definitions.mjs "<Confidence Traits report>.pdf" [--check]',
    );
    process.exit(2);
  }
  if (!fs.existsSync(pdfPath)) {
    console.error(`File not found: ${pdfPath}`);
    process.exit(2);
  }

  const found = await readTraits(pdfPath);
  const { rows, problems } = matchTraits(found);

  console.log(`Trait pages found in the PDF: ${found.length}`);
  for (const r of rows) {
    if (!r) continue;
    const len = (s) => String((s ?? "").length).padStart(4);
    console.log(
      `  ${r.trait.padEnd(20)} ${r.type}  p.${String(r.page).padStart(2)}  definition ${len(r.summary)}  higher ${len(r.higher)}  lower ${len(r.lower)} chars`,
    );
  }

  if (problems.length > 0) {
    console.error(`\nNothing was written. ${problems.length} problem(s):`);
    for (const p of problems) console.error(`  - ${p}`);
    process.exit(1);
  }

  if (check) {
    console.log("\nAll 36 traits found and complete. (--check: nothing written.)");
    return;
  }
  fs.writeFileSync(OUT_FILE, render(rows));
  console.log(`\nWrote all 36 trait definitions to ${path.relative(process.cwd(), OUT_FILE)}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    console.error(err.message ?? err);
    process.exit(1);
  });
}
