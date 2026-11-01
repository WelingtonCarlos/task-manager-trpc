import { TRPCClientError } from "@trpc/client";
import type { AppRouter } from "@/server/routers/_app";

const FALLBACK_MESSAGE = "Something went wrong. Please try again.";

/**
 * Turns any error (validation, NOT_FOUND, network…) into a message fit for the UI.
 * Validation errors arrive with a readable message thanks to the server's error formatter.
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof TRPCClientError) {
    const trpcError = error as TRPCClientError<AppRouter>;
    if (trpcError.data?.code === "NOT_FOUND") return "This task no longer exists.";
    return trpcError.message || FALLBACK_MESSAGE;
  }
  if (error instanceof Error && error.message) return error.message;
  return FALLBACK_MESSAGE;
}
