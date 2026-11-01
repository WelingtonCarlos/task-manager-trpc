import { TRPCError } from "@trpc/server";
import { notFound } from "next/navigation";
import { TaskForm } from "@/components/TaskForm";
import { api } from "@/server/caller";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function EditTaskPage({ params }: Props) {
  const { id } = await params;

  // SSR: the task is loaded on the server so the form opens already filled in.
  // An unknown or malformed id renders the 404 page.
  const task = await api.task.byId({ id }).catch((error: unknown) => {
    if (error instanceof TRPCError && (error.code === "NOT_FOUND" || error.code === "BAD_REQUEST"))
      notFound();
    throw error;
  });

  return (
    <>
      <h1>Edit task</h1>
      <TaskForm task={task} />
    </>
  );
}
