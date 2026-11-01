"use client";

import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/server/routers/_app";
import { trpc } from "@/trpc/client";
import { TaskItem } from "./TaskItem";

type TaskPage = inferRouterOutputs<AppRouter>["task"]["list"];

type Props = {
  /** First page rendered on the server. */
  initialPage: TaskPage;
  pageSize: number;
};

export function TaskList({ initialPage, pageSize }: Props) {
  // The SSR page seeds the cache, so the list is on screen immediately and the client doesn't refetch it on mount.
  const { data } = trpc.task.list.useQuery({ limit: pageSize }, { initialData: initialPage });
  const tasks = data.items;

  return (
    <>
      <p className="muted">{data.total} task(s)</p>
      {tasks.length === 0 ? (
        <p className="empty">No tasks yet.</p>
      ) : (
        <ul className="task-list">
          {tasks.map((task) => (
            <TaskItem key={task.id} task={task} />
          ))}
        </ul>
      )}
    </>
  );
}
