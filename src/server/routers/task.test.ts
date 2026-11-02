import { TRPCError } from "@trpc/server";
import { beforeEach, describe, expect, it } from "vitest";
import { createTaskStore, type TaskStore } from "../task-store";
import { createCaller } from "./_app";

const MISSING_ID = "00000000-0000-4000-8000-000000000000";

/** Runs a procedure that must fail and returns its TRPCError code. */
async function errorCode(promise: Promise<unknown>) {
  try {
    await promise;
  } catch (error) {
    if (error instanceof TRPCError) return error.code;
    throw error;
  }
  throw new Error("Expected the procedure to fail");
}

describe("task router", () => {
  let store: TaskStore;
  let api: ReturnType<typeof createCaller>;

  // A fresh store per test, injected through the context: no shared state between tests.
  beforeEach(() => {
    store = createTaskStore();
    api = createCaller({ store });
  });

  describe("create", () => {
    it("creates a task with trimmed fields", async () => {
      const task = await api.task.create({ titulo: "  Buy coffee  ", descricao: " Beans " });
      expect(task).toMatchObject({ titulo: "Buy coffee", descricao: "Beans" });
      expect(store.get(task.id)).toEqual(task);
    });

    it("stores an empty description as no description", async () => {
      const task = await api.task.create({ titulo: "No description", descricao: "" });
      expect(task.descricao).toBeUndefined();
    });

    it.each(["", "   "])("rejects an empty title (%j)", async (titulo) => {
      expect(await errorCode(api.task.create({ titulo }))).toBe("BAD_REQUEST");
      expect(store.list(null, 10).total).toBe(0);
    });

    it("rejects a title that is too long", async () => {
      expect(await errorCode(api.task.create({ titulo: "a".repeat(121) }))).toBe("BAD_REQUEST");
    });
  });

  describe("list", () => {
    it("returns pages with a next cursor", async () => {
      for (let i = 0; i < 3; i++) await api.task.create({ titulo: `Task ${i}` });
      const page = await api.task.list({ limit: 2 });
      expect(page.items).toHaveLength(2);
      const last = page.items.at(-1);
      expect(page.nextCursor).toEqual({ dataCriacao: last?.dataCriacao, id: last?.id });

      const next = await api.task.list({ limit: 2, cursor: page.nextCursor });
      expect(next.items).toHaveLength(1);
      expect(next.nextCursor).toBeNull();
    });

    it("rejects a malformed cursor", async () => {
      const cursor = { dataCriacao: 1, id: "not-a-uuid" };
      expect(await errorCode(api.task.list({ cursor }))).toBe("BAD_REQUEST");
    });

    it("works without input", async () => {
      await expect(api.task.list()).resolves.toMatchObject({ items: [], total: 0 });
    });
  });

  describe("byId", () => {
    it("returns NOT_FOUND for a missing task", async () => {
      expect(await errorCode(api.task.byId({ id: MISSING_ID }))).toBe("NOT_FOUND");
    });

    it("returns BAD_REQUEST for a malformed id", async () => {
      expect(await errorCode(api.task.byId({ id: "not-a-uuid" }))).toBe("BAD_REQUEST");
    });
  });

  describe("update", () => {
    it("updates title and description", async () => {
      const { id } = await api.task.create({ titulo: "Old", descricao: "Old description" });
      const updated = await api.task.update({ id, titulo: "New", descricao: "" });
      expect(updated).toMatchObject({ id, titulo: "New", descricao: undefined });
    });

    it("returns NOT_FOUND for a missing task", async () => {
      expect(await errorCode(api.task.update({ id: MISSING_ID, titulo: "x" }))).toBe("NOT_FOUND");
    });

    it("rejects an empty title", async () => {
      const { id } = await api.task.create({ titulo: "Valid" });
      expect(await errorCode(api.task.update({ id, titulo: " " }))).toBe("BAD_REQUEST");
      expect(store.get(id)?.titulo).toBe("Valid");
    });
  });

  describe("delete", () => {
    it("deletes a task", async () => {
      const { id } = await api.task.create({ titulo: "To delete" });
      await expect(api.task.delete({ id })).resolves.toEqual({ id });
      expect(store.get(id)).toBeNull();
    });

    it("returns NOT_FOUND when deleting twice", async () => {
      const { id } = await api.task.create({ titulo: "To delete" });
      await api.task.delete({ id });
      expect(await errorCode(api.task.delete({ id }))).toBe("NOT_FOUND");
    });
  });
});
