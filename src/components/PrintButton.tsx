"use client";

/** Opens the browser's print dialog (which also offers "Save as PDF"). */
export default function PrintButton({ label = "Print / save as PDF" }: { label?: string }) {
  return (
    <button type="button" className="btn btn-ghost print:hidden" onClick={() => window.print()}>
      {label}
    </button>
  );
}
