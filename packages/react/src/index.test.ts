import { beforeEach, describe, expect, it, vi } from "vitest";

const reactMocks = vi.hoisted(() => ({
  useEffect: vi.fn(),
  useMemo: vi.fn(),
  useState: vi.fn(),
}));

vi.mock("react", () => ({
  useEffect: reactMocks.useEffect,
  useMemo: reactMocks.useMemo,
  useState: reactMocks.useState,
}));

describe("useOptimisticUpdatesLayer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    reactMocks.useMemo.mockImplementation((factory: () => unknown) => factory());
  });

  it("creates a snapback store, subscribes to it, and bumps version on updates", async () => {
    const setVersion = vi.fn();
    let listenerRef: (() => void) | undefined;
    let cleanup: (() => void) | undefined;

    reactMocks.useState.mockReturnValue([0, setVersion]);
    reactMocks.useEffect.mockImplementation((effect: () => (() => void) | void) => {
      cleanup = effect() as () => void;
    });

    const core = await import("@snapback/core");
    const actualCreateSnapbackLayer = core.createSnapbackLayer;
    const createSnapbackLayerSpy = vi
      .spyOn(core, "createSnapbackLayer")
      .mockImplementation(() => {
        const store = actualCreateSnapbackLayer();
        const originalSubscribe = store.subscribe;

        vi.spyOn(store, "subscribe").mockImplementation((listener: () => void) => {
          listenerRef = listener;
          return originalSubscribe(() => {});
        });

        return store;
      });
    const { default: useOptimisticUpdatesLayer } = await import(".");

    const store = useOptimisticUpdatesLayer<{ title: string }>();
    const subscribeSpy = vi.mocked(store.subscribe);

    expect(createSnapbackLayerSpy).toHaveBeenCalledTimes(1);
    expect(reactMocks.useMemo).toHaveBeenCalledWith(expect.any(Function), []);
    expect(reactMocks.useState).toHaveBeenCalledWith(0);
    expect(reactMocks.useEffect).toHaveBeenCalledWith(expect.any(Function), [
      store,
    ]);
    expect(subscribeSpy).toHaveBeenCalledTimes(1);

    listenerRef?.();

    expect(setVersion).toHaveBeenCalledTimes(1);
    expect(setVersion.mock.calls[0]?.[0](2)).toBe(3);
    expect(cleanup).toEqual(expect.any(Function));
  });
});
