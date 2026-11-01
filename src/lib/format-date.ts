/**
 * Fixed locale and time zone so the HTML rendered on the server matches the
 * client exactly; formatting with the runtime's defaults causes hydration mismatches.
 */
const dateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "UTC",
});

export function formatDate(timestamp: number): string {
  return `${dateFormatter.format(timestamp)} UTC`;
}
