/**
 * The form redirects to the list after saving, so the outcome travels in the URL (`/?saved=created`)
 * to be shown there. Only known values produce a message: the URL is user input.
 */
export function getSavedMessage(saved: unknown): string | null {
  if (saved === "created") return "Task created.";
  if (saved === "updated") return "Task updated.";
  return null;
}
