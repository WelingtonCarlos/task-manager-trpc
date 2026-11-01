"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { getErrorMessage } from "@/lib/errors";
import { DESCRIPTION_MAX_LENGTH, TITLE_MAX_LENGTH } from "@/lib/task-schema";
import { trpc } from "@/trpc/client";
import { Feedback, type FeedbackState } from "./Feedback";
import { useTaskForm } from "./useTaskForm";

type Props = {
  /** When present, the form edits this task; otherwise it creates a new one. */
  task?: { id: string; titulo: string; descricao?: string };
};

export function TaskForm({ task }: Props) {
  const router = useRouter();
  const utils = trpc.useUtils();
  const { values, errors, setField, validateAll } = useTaskForm({
    titulo: task?.titulo ?? "",
    descricao: task?.descricao ?? "",
  });
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const clearFeedback = useCallback(() => setFeedback(null), []);

  // Create and update share the same success and error handling.
  const handlers = {
    onSuccess: async () => {
      await utils.task.list.invalidate();
      router.push("/");
      router.refresh(); // re-run the SSR list so it reflects the change
    },
    onError: (error: unknown) => setFeedback({ type: "error", message: getErrorMessage(error) }),
  };
  const create = trpc.task.create.useMutation(handlers);
  const update = trpc.task.update.useMutation(handlers);
  const isSaving = create.isPending || update.isPending;

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!validateAll()) return;
    setFeedback(null);
    if (task) update.mutate({ id: task.id, ...values });
    else create.mutate(values);
  }

  return (
    <form onSubmit={handleSubmit} className="form" noValidate aria-busy={isSaving}>
      <Feedback state={feedback} onClose={clearFeedback} />

      <label htmlFor="titulo">Title *</label>
      <input
        id="titulo"
        name="titulo"
        value={values.titulo}
        onChange={(event) => setField("titulo", event.target.value)}
        aria-invalid={Boolean(errors.titulo)}
        aria-describedby={errors.titulo ? "titulo-error" : undefined}
        maxLength={TITLE_MAX_LENGTH + 20}
        autoFocus
      />
      {errors.titulo && (
        <span id="titulo-error" className="error">
          {errors.titulo}
        </span>
      )}

      <label htmlFor="descricao">Description</label>
      <textarea
        id="descricao"
        name="descricao"
        value={values.descricao}
        onChange={(event) => setField("descricao", event.target.value)}
        aria-invalid={Boolean(errors.descricao)}
        aria-describedby={errors.descricao ? "descricao-error" : undefined}
        maxLength={DESCRIPTION_MAX_LENGTH + 20}
        rows={4}
      />
      {errors.descricao && (
        <span id="descricao-error" className="error">
          {errors.descricao}
        </span>
      )}

      <div className="form__actions">
        <button type="submit" className="button" disabled={isSaving}>
          {isSaving ? "Saving…" : task ? "Save changes" : "Create task"}
        </button>
        <button
          type="button"
          className="button button--ghost"
          onClick={() => router.push("/")}
          disabled={isSaving}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
