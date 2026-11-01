"use client";

import { useCallback, useState } from "react";
import type { inferRouterOutputs } from "@trpc/server";
import { getErrorMessage } from "@/lib/errors";
import type { AppRouter } from "@/server/routers/_app";
import { trpc } from "@/trpc/client";
import { DeleteTaskButton } from "./DeleteTaskButton";
import { Feedback, type FeedbackState } from "./Feedback";
import { TaskItem } from "./TaskItem";

type TaskPage = inferRouterOutputs<AppRouter>["task"]["list"];

type Props = {
  /** First page rendered on the server. */
  initialPage: TaskPage;
  pageSize: number;
};

export function TaskList({ initialPage, pageSize }: Props) {
  const utils = trpc.useUtils();
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const clearFeedback = useCallback(() => setFeedback(null), []);

  // The SSR page seeds the cache, so the list is on screen immediately and the client doesn't refetch it on mount.
  const { data } = trpc.task.list.useQuery({ limit: pageSize }, { initialData: initialPage });
  const tasks = data.items;

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
      <p className="muted">{data.total} task(s)</p>
      {tasks.length === 0 ? (
        <p className="empty">No tasks yet.</p>
      ) : (
        <ul className="task-list">
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              busy={deletingId === task.id}
              actions={
                <DeleteTaskButton
                  isDeleting={deletingId === task.id}
                  onConfirm={() => deleteTask.mutate({ id: task.id })}
                />
              }
            />
          ))}
        </ul>
      )}
    </>
  );
}
