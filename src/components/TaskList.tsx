"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { inferRouterOutputs } from "@trpc/server";
import { getErrorMessage } from "@/lib/errors";
import type { AppRouter } from "@/server/routers/_app";
import { trpc } from "@/trpc/client";
import { DeleteTaskButton } from "./DeleteTaskButton";
import { Feedback, type FeedbackState } from "./Feedback";
import { TaskItem } from "./TaskItem";
import { useInfiniteScroll } from "./useInfiniteScroll";

type TaskPage = inferRouterOutputs<AppRouter>["task"]["list"];

type Props = {
  /** First page rendered on the server. */
  initialPage: TaskPage;
  pageSize: number;
  /** Outcome of a save made on the form that redirected here. */
  savedMessage?: string | null;
};

export function TaskList({ initialPage, pageSize, savedMessage }: Props) {
  const utils = trpc.useUtils();
  const [feedback, setFeedback] = useState<FeedbackState>(
    savedMessage ? { type: "success", message: savedMessage } : null,
  );
  const clearFeedback = useCallback(() => setFeedback(null), []);

  // Drop the message from the URL, so reloading the page doesn't announce the save again.
  useEffect(() => {
    if (savedMessage) window.history.replaceState(null, "", "/");
  }, [savedMessage]);

  const query = trpc.task.list.useInfiniteQuery(
    { limit: pageSize },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      // The SSR page seeds the cache as the first page, so the client only fetches the pages after it.
      initialData: { pages: [initialPage], pageParams: [null] },
    },
  );
  const { hasNextPage, isFetchingNextPage, fetchNextPage } = query;
  const pages = query.data?.pages ?? [initialPage];
  const tasks = pages.flatMap((page) => page.items);
  const total = pages[0]?.total ?? 0;

  const loadMore = useCallback(() => void fetchNextPage(), [fetchNextPage]);
  const sentinelRef = useInfiniteScroll({
    hasMore: hasNextPage,
    isLoading: isFetchingNextPage || query.isFetchNextPageError,
    onLoadMore: loadMore,
  });

  const deleteTask = trpc.task.delete.useMutation({
    onMutate: () => setFeedback(null),
    onSuccess: () => {
      setFeedback({ type: "success", message: "Task deleted." });
      // Offsets shift after a delete, so refetch instead of patching the cached pages.
      return utils.task.list.invalidate();
    },
    onError: (error) => setFeedback({ type: "error", message: getErrorMessage(error) }),
  });
  const deletingId = deleteTask.isPending ? deleteTask.variables?.id : undefined;

  return (
    <>
      <Feedback state={feedback} onClose={clearFeedback} />
      <p className="muted">{total} task(s)</p>
      {tasks.length === 0 ? (
        <p className="empty">
          No tasks yet. <Link href="/tasks/new">Create the first one</Link>.
        </p>
      ) : (
        <ul className="task-list">
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              busy={deletingId === task.id}
              actions={
                <>
                  <Link href={`/tasks/${task.id}/edit`} className="button button--ghost">
                    Edit
                  </Link>
                  <DeleteTaskButton
                    isDeleting={deletingId === task.id}
                    onConfirm={() => deleteTask.mutate({ id: task.id })}
                  />
                </>
              }
            />
          ))}
        </ul>
      )}

      <div ref={sentinelRef} aria-hidden="true" />
      {isFetchingNextPage && (
        <p className="muted center" role="status">
          Loading more tasks…
        </p>
      )}
      {query.isFetchNextPageError && (
        <p className="error center" role="alert">
          {getErrorMessage(query.error)}{" "}
          <button type="button" className="link" onClick={loadMore}>
            Try again
          </button>
        </p>
      )}
      {!hasNextPage && tasks.length > 0 && (
        <p className="muted center">You&apos;ve reached the end of the list.</p>
      )}
    </>
  );
}
