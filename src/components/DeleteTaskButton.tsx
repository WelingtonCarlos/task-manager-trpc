"use client";

import { useState } from "react";

type Props = {
  onConfirm: () => void;
  isDeleting: boolean;
};

/**
 * Two-step delete: the first click asks for confirmation inline,
 * so a misclick never removes a task and no blocking browser dialog is needed.
 */
export function DeleteTaskButton({ onConfirm, isDeleting }: Props) {
  const [confirming, setConfirming] = useState(false);

  if (isDeleting) {
    return (
      <button type="button" className="button button--danger" disabled>
        Deleting…
      </button>
    );
  }

  if (confirming) {
    return (
      <>
        <button
          type="button"
          className="button button--danger"
          onClick={() => {
            setConfirming(false);
            onConfirm();
          }}
          autoFocus
        >
          Confirm
        </button>
        <button type="button" className="button button--ghost" onClick={() => setConfirming(false)}>
          Cancel
        </button>
      </>
    );
  }

  return (
    <button type="button" className="button button--danger" onClick={() => setConfirming(true)}>
      Delete
    </button>
  );
}
