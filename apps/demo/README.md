# Snapback Demo

This app is the interactive playground for Snapback. It visualizes how optimistic patches are queued, projected into UI state, and rolled back when a request fails or is cancelled.

The demo is built with Vite, React, Tailwind CSS, Motion, and `@snapback/react`.

## What It Demonstrates

The playground focuses on a small task list and shows how Snapback behaves under simulated network latency.

It currently demonstrates:

- optimistic task creation
- optimistic task edits
- optimistic task deletion
- separate optimistic layers for task details and list membership
- request progress over time
- manual failure and cancellation
- automatic snapback when a request settles and the optimistic patch is removed

## How It Works

The app keeps confirmed task data in local React state and overlays optimistic changes from Snapback on top.

There are two `useSnapbackLayer()` stores in the demo:

- a detail layer for field updates like title changes
- a list layer for create/delete operations and list membership changes

Pending requests are simulated with a timer. Each request:

1. applies an optimistic patch immediately
2. appears in the request queue with a progress bar
3. either completes after the configured latency or is manually failed/cancelled
4. commits the confirmed change to base state on success
5. removes the optimistic patch so the UI resolves cleanly

## Run Locally

From the repository root:

```bash
turbo run dev --filter=demo 
```

You can also run the workspace-wide dev pipeline from the root:

```bash
turbo run dev
```

## Available Scripts

Inside `apps/demo`, the package exposes:

```bash
turbo run dev
turbo run build
turbo run lint
turbo run preview
```

Or from the repo root:

```bash
turbo run build --filter=demo 
turbo run lint --filter=demo 
turbo run preview --filter=demo 
```

## Suggested Test Flow

When validating the demo manually, try this sequence:

1. Create a task and confirm it appears immediately before the simulated request finishes.
2. Edit a task title and verify the updated title is visible optimistically.
3. Delete a task and verify it disappears immediately from the projected list.
4. Pause the queue and inspect the pending requests without progress advancing.
5. Fail or cancel a request and verify the UI snaps back to confirmed state.
6. Resume the queue and let requests complete normally.

