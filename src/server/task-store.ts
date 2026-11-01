import { randomUUID } from "node:crypto";

export type Task = {
  id: string;
  titulo: string;
  descricao?: string;
  /**
   * Creation time as a Unix timestamp in milliseconds.
   * A number (not a Date) so it crosses JSON without needing a transformer.
   */
  dataCriacao: number;
};

export type NewTask = { titulo: string; descricao?: string };
export type TaskChanges = { titulo?: string; descricao?: string };

export type TaskPage = {
  items: Task[];
  /** Offset of the next page, or `null` when this is the last one. */
  nextCursor: number | null;
  total: number;
};

/**
 * In-memory task repository.
 *
 * A factory instead of a module-level singleton, so each test can build an
 * isolated store and the app can decide where the shared instance lives.
 */
export function createTaskStore(initial: Task[] = []) {
  const tasks = new Map(initial.map((task) => [task.id, task]));

  return {
    /** Newest first, offset-based pagination. */
    list(offset: number, limit: number): TaskPage {
      const all = [...tasks.values()].sort((a, b) => b.dataCriacao - a.dataCriacao);
      const items = all.slice(offset, offset + limit);
      const nextCursor = offset + limit < all.length ? offset + limit : null;
      return { items, nextCursor, total: all.length };
    },

    get(id: string): Task | null {
      return tasks.get(id) ?? null;
    },

    create(data: NewTask): Task {
      const task: Task = { id: randomUUID(), ...data, dataCriacao: Date.now() };
      tasks.set(task.id, task);
      return task;
    },

    /** Returns `null` when the task does not exist. */
    update(id: string, changes: TaskChanges): Task | null {
      const current = tasks.get(id);
      if (!current) return null;
      const updated: Task = { ...current, ...changes };
      tasks.set(id, updated);
      return updated;
    },

    /** Returns `false` when the task does not exist. */
    delete(id: string): boolean {
      return tasks.delete(id);
    },
  };
}

export type TaskStore = ReturnType<typeof createTaskStore>;

/** Fictitious tasks so the list (and its pagination) has something to show on first run. */
export function createSampleTasks(count = 25, now = Date.now()): Task[] {
  return Array.from({ length: count }, (_, index) => {
    const n = index + 1;
    return {
      id: randomUUID(),
      titulo: `Sample task #${n}`,
      descricao: n % 3 === 0 ? undefined : `Fictitious description for task ${n}.`,
      dataCriacao: now - n * 60_000,
    };
  });
}

/**
 * The app-wide store.
 *
 * Kept on `globalThis` so it survives Next.js hot reloads in development;
 * a module-level variable would be wiped on every file save.
 * Data is lost when the server restarts, which is expected for this project.
 */
const globalForStore = globalThis as unknown as { __taskStore?: TaskStore };

export const taskStore: TaskStore = (globalForStore.__taskStore ??= createTaskStore(createSampleTasks()));
