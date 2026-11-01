import { initTRPC } from "@trpc/server";
import { ZodError } from "zod";
import type { Context } from "./context";

/**
 * tRPC bootstrap.
 *
 * The error formatter turns Zod validation errors into a readable top-level
 * message and exposes the flattened field errors, so the frontend can show
 * "Title is required" instead of a raw list of issues.
 */
const t = initTRPC.context<Context>().create({
  errorFormatter({ shape, error }) {
    const zodError = error.cause instanceof ZodError ? error.cause : null;
    return {
      ...shape,
      message: zodError ? (zodError.issues[0]?.message ?? "Invalid input") : shape.message,
      data: {
        ...shape.data,
        zodError: zodError ? zodError.flatten() : null,
      },
    };
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const createCallerFactory = t.createCallerFactory;
