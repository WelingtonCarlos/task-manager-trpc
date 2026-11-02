import { describe, expect, it } from "vitest";
import { createSampleTasks, createTaskStore, type TaskCursor, type TaskPage } from "./task-store";

describe("task store", () => {
  it("lists tasks newest first", () => {
    const store = createTaskStore(createSampleTasks(3, 1_000_000));
    const { items } = store.list(null, 10);
    expect(items.map((t) => t.titulo)).toEqual(["Sample task #1", "Sample task #2", "Sample task #3"]);
  });

  it("paginates with a keyset cursor", () => {
    const store = createTaskStore(createSampleTasks(3));
    const first = store.list(null, 2);
    expect(first.items).toHaveLength(2);
    expect(first.nextCursor).toEqual({ dataCriacao: first.items[1]?.dataCriacao, id: first.items[1]?.id });
    expect(first.total).toBe(3);

    const last = store.list(first.nextCursor, 2);
    expect(last.items).toHaveLength(1);
    expect(last.nextCursor).toBeNull();
  });

  it("has no next page when the last page is exactly full", () => {
    const store = createTaskStore(createSampleTasks(2));
    expect(store.list(null, 2).nextCursor).toBeNull();
  });

  it("doesn't repeat a task when another one is created between pages", () => {
    const store = createTaskStore(createSampleTasks(4));
    const first = store.list(null, 2);
    store.create({ titulo: "Created meanwhile" });
    const second = store.list(first.nextCursor, 2);
    expect(second.items.map((t) => t.titulo)).toEqual(["Sample task #3", "Sample task #4"]);
  });

  it("doesn't skip a task when another one is deleted between pages", () => {
    const store = createTaskStore(createSampleTasks(4));
    const first = store.list(null, 2);
    store.delete(first.items[0]!.id);
    const second = store.list(first.nextCursor, 2);
    expect(second.items.map((t) => t.titulo)).toEqual(["Sample task #3", "Sample task #4"]);
  });

  it("continues from a cursor whose task was deleted", () => {
    const store = createTaskStore(createSampleTasks(4));
    const first = store.list(null, 2);
    store.delete(first.items[1]!.id);
    const second = store.list(first.nextCursor, 2);
    expect(second.items.map((t) => t.titulo)).toEqual(["Sample task #3", "Sample task #4"]);
  });

  it("walks through tasks created in the same millisecond exactly once", () => {
    const tasks = createSampleTasks(5).map((task) => ({ ...task, dataCriacao: 1_000 }));
    const store = createTaskStore(tasks);
    const seen: string[] = [];
    let cursor: TaskCursor | null = null;
    do {
      const page: TaskPage = store.list(cursor, 2);
      seen.push(...page.items.map((t) => t.id));
      cursor = page.nextCursor;
    } while (cursor);
    expect(seen).toHaveLength(5);
    expect(new Set(seen)).toEqual(new Set(tasks.map((t) => t.id)));
  });

  it("creates tasks with id and creation date", () => {
    const store = createTaskStore();
    const task = store.create({ titulo: "Write tests" });
    expect(task.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(typeof task.dataCriacao).toBe("number");
    expect(store.get(task.id)).toEqual(task);
  });

  it("returns null or false for missing tasks", () => {
    const store = createTaskStore();
    expect(store.get("missing")).toBeNull();
    expect(store.update("missing", { titulo: "x" })).toBeNull();
    expect(store.delete("missing")).toBe(false);
  });
});
