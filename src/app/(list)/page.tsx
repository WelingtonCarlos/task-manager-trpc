import { TaskList } from "@/components/TaskList";
import { api } from "@/server/caller";
import { DEFAULT_PAGE_SIZE } from "@/server/routers/task";

// Rendered on every request (SSR): tasks change at runtime, so a statically generated page would be stale.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  // Calls the procedure directly on the server, without an HTTP round-trip.
  const firstPage = await api.task.list({ limit: DEFAULT_PAGE_SIZE });

  return (
    <>
      <h1>Tasks</h1>
      <TaskList initialPage={firstPage} pageSize={DEFAULT_PAGE_SIZE} />
    </>
  );
}
