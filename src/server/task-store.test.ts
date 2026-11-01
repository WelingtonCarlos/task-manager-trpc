import { describe, expect, it } from "vitest";
import { createSampleTasks, createTaskStore } from "./task-store";

describe("task store", () => {
  it("lists tasks newest first", () => {
    const store = createTaskStore(createSampleTasks(3, 1_000_000));
    const { items } = store.list(0, 10);
    expect(items.map((t) => t.titulo)).toEqual(["Sample task #1", "Sample task #2", "Sample task #3"]);
  });

  it("paginates with an offset cursor", () => {
    const store = createTaskStore(createSampleTasks(5));
    const first = store.list(0, 2);
    expect(first.items).toHaveLength(2);
    expect(first.nextCursor).toBe(2);
    expect(first.total).toBe(5);

    const last = store.list(4, 2);
    expect(last.items).toHaveLength(1);
    expect(last.nextCursor).toBeNull();
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
