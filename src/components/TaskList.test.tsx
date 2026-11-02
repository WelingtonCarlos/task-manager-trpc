// @vitest-environment jsdom
import { act, cleanup, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createSampleTasks, createTaskStore } from "@/server/task-store";
import { TaskList } from "./TaskList";
import { renderWithTrpc, stubIntersectionObserver } from "./test-utils";

const PAGE_SIZE = 10;

describe("TaskList", () => {
  beforeEach(() => {
    stubIntersectionObserver();
    window.history.replaceState(null, "", "/");
  });
  afterEach(cleanup);

  it("removes a task that another tab already deleted when deleting it fails", async () => {
    const store = createTaskStore(createSampleTasks(3));
    const initialPage = store.list(null, PAGE_SIZE);
    const target = initialPage.items[0]!;
    renderWithTrpc(<TaskList initialPage={initialPage} pageSize={PAGE_SIZE} />, store);

    store.delete(target.id);
    const item = screen.getByText(target.titulo).closest("li")!;
    await userEvent.click(within(item).getByRole("button", { name: "Delete" }));
    await userEvent.click(within(item).getByRole("button", { name: "Confirm" }));

    expect(await screen.findByRole("alert")).toHaveProperty(
      "textContent",
      expect.stringContaining("This task no longer exists."),
    );
    await expect.poll(() => screen.queryByText(target.titulo)).toBeNull();
  });

  it("doesn't let scrolling cancel the refetch that follows a delete", async () => {
    const io = stubIntersectionObserver();
    const store = createTaskStore(createSampleTasks(25));
    const initialPage = store.list(null, PAGE_SIZE);
    const victim = initialPage.items[0]!;

    let held = 0;
    let release = () => {};
    let hold: Promise<void> | null = null;
    renderWithTrpc(<TaskList initialPage={initialPage} pageSize={PAGE_SIZE} />, store, async (url) => {
      if (hold && url.includes("task.list")) {
        held++;
        await hold;
      }
    });

    act(() => io.intersect());
    await screen.findByText("Sample task #20");

    hold = new Promise((resolve) => {
      release = resolve;
    });
    const item = screen.getByText(victim.titulo).closest("li")!;
    await userEvent.click(within(item).getByRole("button", { name: "Delete" }));
    await userEvent.click(within(item).getByRole("button", { name: "Confirm" }));
    await expect.poll(() => held).toBeGreaterThan(0);

    // The user reaches the end of the list while the refetch is still in flight.
    act(() => io.intersect());
    hold = null;
    release();

    await expect.poll(() => screen.queryByText(victim.titulo)).toBeNull();

    // Once the refetch is over, the same scroll loads what's left, with no gaps.
    await screen.findByText("Sample task #21");
    act(() => io.intersect());
    await screen.findByText("Sample task #25");
    for (let n = 2; n <= 25; n++) expect(screen.getAllByText(`Sample task #${n}`)).toHaveLength(1);
  });

  it("shows the message of a save made on the form and drops it from the URL", async () => {
    window.history.replaceState(null, "", "/?saved=created");
    const store = createTaskStore();
    renderWithTrpc(
      <TaskList
        initialPage={store.list(null, PAGE_SIZE)}
        pageSize={PAGE_SIZE}
        savedMessage="Task created."
      />,
      store,
    );

    expect(screen.getByRole("status").textContent).toContain("Task created.");
    expect(window.location.search).toBe("");
  });
});
