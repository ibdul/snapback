export type EntityId = string;

export type Entity<T = unknown> = {
  [key: string]: unknown;
} & T;

export interface SnapbackUpdate<T = unknown> {
  versionId: string;
  patch: Partial<Entity<T>>;
  requestId: string;
}

export type SnapbackQueue<T = unknown> = Record<
  string,
  SnapbackUpdate<T>[]
>;

export interface SnapbackStore<T = unknown> {
  readonly snapback_state: SnapbackQueue<T>;
  readonly snapback_state_dict: Record<string, Entity<T>>;
  readonly snapback_state_ref: { current: SnapbackQueue<T> };
  applyUpdate(patchedObj: Partial<Entity<T>> & { id: EntityId }): string;
  getSnapbackState(id: EntityId): Entity<T>;
  rollbackUpdate(entityId: EntityId, requestId: string): void;
  clearUpdates(entityId?: EntityId): void;
  subscribe(listener: () => void): () => void;
}

export interface CreateSnapbackLayerOptions {
  createId?: () => string;
}

function defaultCreateId() {
  return crypto.randomUUID();
}

export function createSnapbackLayer<T = unknown>(
  options: CreateSnapbackLayerOptions = {},
): SnapbackStore<T> {
  const createId = options.createId ?? defaultCreateId;
  let snapbackState: SnapbackQueue<T> = {};
  const listeners = new Set<() => void>();

  function emitChange() {
    listeners.forEach((listener) => listener());
  }

  function syncQueue(nextState: SnapbackQueue<T>) {
    snapbackState = nextState;
    emitChange();
  }

  function getSnapbackState(id: EntityId): Entity<T> {
    const patches = snapbackState[id] || [];

    return patches.reduce(
      (currentState, update) => ({ ...currentState, ...update.patch }),
      {} as Entity<T>,
    );
  }

  function applyUpdate(patchedObj: Partial<Entity<T>> & { id: EntityId }) {
    const entityId = patchedObj.id;
    const requestId = createId();

    const newUpdate: SnapbackUpdate<T> = {
      versionId: createId(),
      patch: { ...patchedObj },
      requestId,
    };

    const queue = [...(snapbackState[entityId] || []), newUpdate];
    syncQueue({
      ...snapbackState,
      [entityId]: queue,
    });

    return requestId;
  }

  function rollbackUpdate(entityId: EntityId, requestId: string) {
    const queue = snapbackState[entityId];
    if (!queue) {
      return;
    }

    const newQueue = queue.filter((update) => update.requestId !== requestId);
    const nextState = { ...snapbackState };

    if (newQueue.length === 0) {
      delete nextState[entityId];
    } else {
      nextState[entityId] = newQueue;
    }

    syncQueue(nextState);
  }

  function clearUpdates(entityId?: EntityId) {
    if (!entityId) {
      syncQueue({});
      return;
    }

    const nextState = { ...snapbackState };
    delete nextState[entityId];
    syncQueue(nextState);
  }

  function subscribe(listener: () => void) {
    listeners.add(listener);

    return () => {
      listeners.delete(listener);
    };
  }

  const store: SnapbackStore<T> = {
    get snapback_state() {
      return snapbackState;
    },
    get snapback_state_dict() {
      const out = {} as Record<string, Entity<T>>;

      Object.keys(snapbackState).forEach((key) => {
        out[key] = getSnapbackState(key);
      });

      return out;
    },
    snapback_state_ref: { current: snapbackState },
    applyUpdate,
    getSnapbackState,
    rollbackUpdate,
    clearUpdates,
    subscribe,
  };

  return store;
}
