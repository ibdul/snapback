# Snapback

Snapback is a small optimistic state layer for entity-based updates. It lets you queue local patches, derive the optimistic view for a specific entity, and roll back any request that fails so the UI snaps back to the last confirmed state.

This repository is a pnpm monorepo with:

- `@snapback/core`: framework-agnostic queue/store primitives
- `@snapback/react`: a React hook that wraps the core store
- `apps/demo`: a Vite demo that visualizes optimistic updates, latency, and rollbacks

## Why It Exists

Optimistic UI usually starts simple and gets messy once you need to:

- stack multiple pending patches for the same record
- keep request IDs around for targeted rollback
- inspect pending optimistic state separately from server state
- handle create, update, and delete flows without mutating confirmed data too early

Snapback keeps that concern in a dedicated layer. Your confirmed server data stays separate, while optimistic patches are applied on top until the server responds.

## Packages

### `@snapback/core`

The core package exports `createSnapbackLayer`, which returns a store with:

- `applyUpdate(patch)` to enqueue an optimistic patch and get a `requestId`
- `getSnapbackState(id)` to derive the merged optimistic state for one entity
- `rollbackUpdate(entityId, requestId)` to remove one failed request
- `clearUpdates(entityId?)` to clear one entity queue or the whole layer
- `subscribe(listener)` to react to store changes
- `snapback_state` and `snapback_state_dict` for direct inspection

### `@snapback/react`

The React package exports a default hook, `useSnapbackLayer<T>()`, which creates a core store and re-renders the component when the store changes.

## Quick Example

```tsx
import useSnapbackLayer from "@snapback/react";

type Task = {
  id: string;
  title: string;
  done?: boolean;
};

function TaskEditor() {
  const { applyUpdate, getSnapbackState, rollbackUpdate } =
    useSnapbackLayer<Task>();

  async function renameTask(id: string, title: string) {
    const requestId = applyUpdate({ id, title });

    try {
      await api.tasks.update(id, { title });
    } catch {
      rollbackUpdate(id, requestId);
    }
  }

  const optimisticTask = getSnapbackState("task-1");

  return (
    <button onClick={() => renameTask("task-1", "Write README")}>
      {optimisticTask.title ?? "Untitled"}
    </button>
  );
}
```

In practice, you render confirmed server data and overlay the optimistic fields from Snapback until the request settles.

## Project Structure

```text
.
├── apps
│   └── demo                # Vite playground for the Snapback UX
├── packages
│   ├── core                # Store and queue logic
│   ├── react               # React hook wrapper
│   ├── ui                  # Shared UI workspace for local components
│   ├── eslint-config       # Shared lint config
│   └── typescript-config   # Shared TS config
├── package.json
├── pnpm-workspace.yaml
└── turbo.json
```

## Getting Started

### Prerequisites

- Node.js `18+`
- `pnpm` `10+`

### Install

```bash
pnpm install
```

### Run the Demo

From the repo root:

```bash
turbo dev
```

That starts the Turborepo dev pipeline. If you only want the demo app:

```bash
turbo run dev --filter=demo
```

### Build

```bash
turbo build
```

### Lint

```bash
turbo lint
```

### Format

```bash
turbo format
```

## Workspace Notes

- The root workspace uses `turbo` to coordinate app and package tasks.
- The demo app is built with Vite, React 19, Tailwind CSS, Motion, and Lucide icons.
- The core and React packages are bundled with `tsup`.
- Unit tests currently live in `packages/core` and `packages/react` and run with `vitest`.

