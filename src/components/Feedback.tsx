"use client";

import { useEffect } from "react";

export type FeedbackState = { type: "success" | "error"; message: string } | null;

const SUCCESS_TIMEOUT_MS = 3000;

/** Dismissible banner. Success messages hide on their own; errors stay until the user closes them. */
export function Feedback({ state, onClose }: { state: FeedbackState; onClose: () => void }) {
  useEffect(() => {
    if (state?.type !== "success") return;
    const timer = setTimeout(onClose, SUCCESS_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [state, onClose]);

  if (!state) return null;

  return (
    <div role={state.type === "error" ? "alert" : "status"} className={`feedback feedback--${state.type}`}>
      <span>{state.message}</span>
      <button type="button" className="link" onClick={onClose} aria-label="Dismiss message">
        ✕
      </button>
    </div>
  );
}
