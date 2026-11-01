"use client";

import { useEffect } from "react";

type Props = { error: Error & { digest?: string }; reset: () => void };

/** Fallback for unexpected errors while rendering a page. */
export default function ErrorPage({ error, reset }: Props) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div role="alert">
      <h1>Something went wrong</h1>
      <p className="error">We couldn&apos;t load this page. Try again, and reload if it keeps happening.</p>
      <button type="button" className="button" onClick={reset}>
        Try again
      </button>
    </div>
  );
}
