// @vitest-environment jsdom
import { cleanup, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createTaskStore } from "@/server/task-store";
import { TaskForm } from "./TaskForm";
import { renderWithTrpc } from "./test-utils";

const router = vi.hoisted(() => ({ push: vi.fn(), refresh: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => router }));

describe("TaskForm", () => {
  beforeEach(() => {
    router.push.mockClear();
    router.refresh.mockClear();
  });
  afterEach(cleanup);

  it("reports a created task to the list", async () => {
    const store = createTaskStore();
    renderWithTrpc(<TaskForm />, store);

    await userEvent.type(screen.getByLabelText("Title *"), "Buy coffee");
    await userEvent.click(screen.getByRole("button", { name: "Create task" }));

    await expect.poll(() => router.push.mock.calls).toEqual([["/?saved=created"]]);
    expect(store.list(null, 10).total).toBe(1);
  });

  it("reports an updated task to the list", async () => {
    const store = createTaskStore();
    const task = store.create({ titulo: "Old" });
    renderWithTrpc(<TaskForm task={task} />, store);

    await userEvent.click(screen.getByRole("button", { name: "Save changes" }));

    await expect.poll(() => router.push.mock.calls).toEqual([["/?saved=updated"]]);
  });

  it("stays disabled after saving, so a second click during navigation can't create a duplicate", async () => {
    const store = createTaskStore();
    renderWithTrpc(<TaskForm />, store);

    await userEvent.type(screen.getByLabelText("Title *"), "Buy coffee");
    await userEvent.click(screen.getByRole("button", { name: "Create task" }));
    await expect.poll(() => router.push.mock.calls.length).toBe(1);

    // Let React commit the mutation's final state: this is the moment the button used to come back.
    await new Promise((resolve) => setTimeout(resolve, 50));
    const submit = screen.getByRole("button", { name: /Saving|Create task/ });
    expect(submit).toHaveProperty("disabled", true);
    await userEvent.click(submit);
    expect(store.list(null, 10).total).toBe(1);
  });
});
