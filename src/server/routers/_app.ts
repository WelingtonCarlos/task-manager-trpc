import { createCallerFactory, publicProcedure, router } from "../trpc";
import { taskRouter } from "./task";

export const appRouter = router({
  /** Liveness check: `GET /api/trpc/health`. */
  health: publicProcedure.query(() => ({ status: "ok" as const })),
  task: taskRouter,
});

/** Only the *type* is shared with the client, so no server code reaches the browser bundle. */
export type AppRouter = typeof appRouter;

/** Server-side caller: lets Server Components call procedures directly, without an HTTP round-trip. */
export const createCaller = createCallerFactory(appRouter);
