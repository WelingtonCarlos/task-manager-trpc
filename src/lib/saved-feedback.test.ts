import { describe, expect, it } from "vitest";
import { getSavedMessage } from "./saved-feedback";

describe("getSavedMessage", () => {
  it("maps each save action to its message", () => {
    expect(getSavedMessage("created")).toBe("Task created.");
    expect(getSavedMessage("updated")).toBe("Task updated.");
  });

  it.each([undefined, "", "constructor", "<b>hi</b>", ["created", "updated"]])(
    "ignores anything else in the URL (%j)",
    (value) => {
      expect(getSavedMessage(value)).toBeNull();
    },
  );
});
