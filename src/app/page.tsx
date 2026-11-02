import { TaskList } from "@/components/TaskList";
import { getSavedMessage } from "@/lib/saved-feedback";
import { api } from "@/server/caller";
import { DEFAULT_PAGE_SIZE } from "@/server/routers/task";

// Rendered on every request (SSR): tasks change at runtime, so a statically generated page would be stale.
export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ saved?: string | string[] }> };

export default async function HomePage({ searchParams }: Props) {
  const { saved } = await searchParams;
  // Calls the procedure directly on the server, without an HTTP round-trip.
  const firstPage = await api.task.list({ limit: DEFAULT_PAGE_SIZE });

  return (
    <>
      <h1>Tasks</h1>
      <TaskList initialPage={firstPage} pageSize={DEFAULT_PAGE_SIZE} savedMessage={getSavedMessage(saved)} />
    </>
  );
}
