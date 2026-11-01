"use client";

import { useState } from "react";
import { descricaoSchema, tituloSchema } from "@/lib/task-schema";

export type TaskFormValues = { titulo: string; descricao: string };
type FieldErrors = Partial<Record<keyof TaskFormValues, string>>;

/** Reuses the same Zod rules as the server, so client and server never disagree on what is valid. */
function validate(values: TaskFormValues): FieldErrors {
  const errors: FieldErrors = {};
  const titulo = tituloSchema.safeParse(values.titulo);
  if (!titulo.success) errors.titulo = titulo.error.issues[0]?.message;
  const descricao = descricaoSchema.safeParse(values.descricao);
  if (!descricao.success) errors.descricao = descricao.error.issues[0]?.message;
  return errors;
}

/** Form state and validation, kept apart from the submit logic so the component stays readable. */
export function useTaskForm(initial: TaskFormValues) {
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitted, setSubmitted] = useState(false);

  function setField(field: keyof TaskFormValues, value: string) {
    const next = { ...values, [field]: value };
    setValues(next);
    // Live validation only after the first submit attempt, so the user isn't scolded while typing.
    if (submitted) setErrors(validate(next));
  }

  /** Validates everything and returns `true` when the form can be sent. */
  function validateAll() {
    setSubmitted(true);
    const result = validate(values);
    setErrors(result);
    return Object.keys(result).length === 0;
  }

  return { values, errors, setField, validateAll };
}
