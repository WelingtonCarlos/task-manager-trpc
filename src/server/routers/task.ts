import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { taskIdSchema, taskInputSchema } from "@/lib/task-schema";
import { publicProcedure, router } from "../trpc";

export const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 50;

function taskNotFound(id: string): never {
  throw new TRPCError({ code: "NOT_FOUND", message: `Task ${id} not found` });
}

const byIdInput = z.object({ id: taskIdSchema });

export const taskRouter = router({
  /** Paginated list, newest first. `cursor` is the offset returned as `nextCursor` by the previous page. */
  list: publicProcedure
    .input(
      z
        .object({
          limit: z.number().int().min(1).max(MAX_PAGE_SIZE).default(DEFAULT_PAGE_SIZE),
          cursor: z.number().int().min(0).nullish(),
        })
        .default({ limit: DEFAULT_PAGE_SIZE }),
    )
    .query(({ ctx, input }) => ctx.store.list(input.cursor ?? 0, input.limit)),

  byId: publicProcedure
    .input(byIdInput)
    .query(({ ctx, input }) => ctx.store.get(input.id) ?? taskNotFound(input.id)),

  create: publicProcedure.input(taskInputSchema).mutation(({ ctx, input }) => ctx.store.create(input)),

  update: publicProcedure.input(taskInputSchema.extend({ id: taskIdSchema })).mutation(({ ctx, input }) => {
    const { id, ...changes } = input;
    return ctx.store.update(id, changes) ?? taskNotFound(id);
  }),

  delete: publicProcedure.input(byIdInput).mutation(({ ctx, input }) => {
    if (!ctx.store.delete(input.id)) taskNotFound(input.id);
    return { id: input.id };
  }),
});
