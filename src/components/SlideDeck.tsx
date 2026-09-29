"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface Slide {
  key: string;
  content: React.ReactNode;
  /** Speaker notes for the person running the call. */
  notes?: string;
}

/**
 * A minimal presenter: one slide at a time, arrow keys / buttons to move,
 * optional speaker notes, and a fullscreen toggle for screen-sharing.
 */
export default function SlideDeck({
  slides,
  showNotesToggle,
  footer,
}: {
  slides: Slide[];
  showNotesToggle: boolean;
  footer: string;
}) {
  const [index, setIndex] = useState(0);
  const [notesOpen, setNotesOpen] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const last = slides.length - 1;

  const go = useCallback(
    (delta: number) => setIndex((i) => Math.min(last, Math.max(0, i + delta))),
    [last],
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;
      if (["ArrowRight", "PageDown", " "].includes(e.key)) {
        e.preventDefault();
        go(1);
      } else if (["ArrowLeft", "PageUp"].includes(e.key)) {
        e.preventDefault();
        go(-1);
      } else if (e.key === "Home") {
        setIndex(0);
      } else if (e.key === "End") {
        setIndex(last);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, last]);

  function toggleFullscreen() {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      stageRef.current?.requestFullscreen?.();
    }
  }

  const slide = slides[index];

  return (
    <div className="space-y-4">
      <div
        ref={stageRef}
        className="flex flex-col bg-[var(--sand)] [&:fullscreen]:justify-center [&:fullscreen]:p-8"
      >
        {/* Fixed 16:10 stage from sm up; on phones the slide grows to fit. */}
        <div className="card relative mx-auto flex min-h-[26rem] w-full max-w-5xl flex-col p-6 sm:aspect-[16/10] sm:min-h-0 sm:overflow-hidden sm:p-10">
          <div className="min-h-0 flex-1 sm:overflow-y-auto">{slide.content}</div>
          <div className="mt-4 flex items-center justify-between border-t border-[var(--sand-mid)] pt-3 text-xs text-[var(--ink-light)]">
            <span className="truncate">{footer}</span>
            <span className="font-mono">
              {index + 1} / {slides.length}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <button type="button" className="btn btn-ghost" onClick={() => go(-1)} disabled={index === 0}>
          ← Previous
        </button>
        <button type="button" className="btn btn-primary" onClick={() => go(1)} disabled={index === last}>
          Next →
        </button>
        <button type="button" className="btn btn-ghost" onClick={toggleFullscreen}>
          Fullscreen
        </button>
        {showNotesToggle && (
          <button type="button" className="btn btn-ghost" onClick={() => setNotesOpen((o) => !o)}>
            {notesOpen ? "Hide speaker notes" : "Speaker notes"}
          </button>
        )}
      </div>

      {showNotesToggle && notesOpen && (
        <div className="card mx-auto max-w-5xl p-4 text-sm leading-relaxed text-[var(--ink-mid)]">
          <div className="eyebrow mb-1">Speaker notes · slide {index + 1}</div>
          {slide.notes || "No notes for this slide."}
        </div>
      )}
      <p className="text-center text-xs text-[var(--ink-light)]">
        Use ← → to move between slides.
      </p>
    </div>
  );
}
