import { z } from "zod";

/**
 * Validation rules for tasks, shared by the tRPC procedures (the real
 * guarantee) and the form on the client (instant feedback).
 */
export const TITLE_MAX_LENGTH = 120;
export const DESCRIPTION_MAX_LENGTH = 1000;

/** `trim()` runs before `min(1)`, so a title made only of spaces counts as empty. */
export const tituloSchema = z
  .string()
  .trim()
  .min(1, "Title is required")
  .max(TITLE_MAX_LENGTH, `Title must be at most ${TITLE_MAX_LENGTH} characters`);

/** An empty description is stored as "no description". */
export const descricaoSchema = z
  .string()
  .trim()
  .max(DESCRIPTION_MAX_LENGTH, `Description must be at most ${DESCRIPTION_MAX_LENGTH} characters`)
  .transform((value) => (value === "" ? undefined : value))
  .optional();

export const taskIdSchema = z.uuid("Invalid task id");

export const taskInputSchema = z.object({
  titulo: tituloSchema,
  descricao: descricaoSchema,
});

export type TaskInput = z.input<typeof taskInputSchema>;
