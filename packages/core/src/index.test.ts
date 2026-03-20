import { describe, expect, it } from "vitest";

import { createSnapbackLayer } from ".";

describe("createSnapbackLayer", () => {
  it("applies, rolls back, clears, and emits updates", () => {
    const ids = ["request-1", "version-1", "request-2", "version-2"];
    const store = createSnapbackLayer<{ title: string; done: boolean }>({
      createId: () => {
        const nextId = ids.shift();

        if (!nextId) {
          throw new Error("ran out of test ids");
        }

        return nextId;
      },
    });

    let notifications = 0;
    const unsubscribe = store.subscribe(() => {
      notifications += 1;
    });

    const firstRequestId = store.applyUpdate({ id: "todo-1", title: "Draft" });

    expect(firstRequestId).toBe("request-1");
    expect(store.snapback_state["todo-1"]).toEqual([
      {
        versionId: "version-1",
        patch: { id: "todo-1", title: "Draft" },
        requestId: "request-1",
      },
    ]);
    expect(store.getSnapbackState("todo-1")).toEqual({
      id: "todo-1",
      title: "Draft",
    });
    expect(store.snapback_state_dict).toEqual({
      "todo-1": { id: "todo-1", title: "Draft" },
    });
    expect(notifications).toBe(1);

    const secondRequestId = store.applyUpdate({ id: "todo-1", done: true });

    expect(secondRequestId).toBe("request-2");
    expect(store.getSnapbackState("todo-1")).toEqual({
      id: "todo-1",
      title: "Draft",
      done: true,
    });
    expect(store.snapback_state_ref.current).toBe(store.snapback_state);
    expect(notifications).toBe(2);

    store.rollbackUpdate("todo-1", firstRequestId);

    expect(store.getSnapbackState("todo-1")).toEqual({
      id: "todo-1",
      done: true,
    });
    expect(notifications).toBe(3);

    store.clearUpdates("todo-1");

    expect(store.snapback_state).toEqual({});
    expect(store.snapback_state_dict).toEqual({});
    expect(notifications).toBe(4);

    unsubscribe();
    store.clearUpdates();

    expect(notifications).toBe(4);
  });
});
