# Task Manager

A task manager built with **Next.js 15** and **tRPC**. Tasks are kept in memory on the server and exposed through type-safe tRPC procedures, consumed by a server-rendered React frontend.

![CI](https://github.com/WelingtonCarlos/task-manager-trpc/actions/workflows/ci.yml/badge.svg)

## Features

- **CRUD over tRPC**: `task.list`, `task.byId`, `task.create`, `task.update`, `task.delete`
- **Validation** with Zod on the server, reusing the same schema in the form for instant feedback
- **Meaningful errors**: `BAD_REQUEST` with a readable message for invalid input, `NOT_FOUND` when a task doesn't exist
- **Server-side rendered list**: the first page of tasks comes rendered in the HTML
- **Delete from the list** with inline confirmation, loading state and success/error feedback
- **Create and edit form** with client-side validation and loading, success and error states
- **Infinite scroll**: the next pages load as you scroll, using `IntersectionObserver`
- **Loading page for the list, error and 404 pages for every route**, with a real HTTP 404 for a missing task

## Stack

- [Next.js 15](https://nextjs.org/) (App Router) and React 19
- [tRPC 11](https://trpc.io/) with [TanStack Query 5](https://tanstack.com/query)
- [Zod 4](https://zod.dev/) for validation
- TypeScript (strict), ESLint, Prettier, Vitest
- GitHub Actions for CI

## Getting started

Requirements: Node.js 22.12+, 24 or 26+, the versions supported by the test runner (the version used in development is in `.nvmrc`).

```bash
npm install
npm run dev
```

Open http://localhost:3000.

No environment variables or external services are needed. The store starts with 25 fictitious sample tasks so the list and its infinite scroll have something to show. Data lives in memory, so it resets whenever the server restarts.

## Scripts

| Command             | What it does                 |
| ------------------- | ---------------------------- |
| `npm run dev`       | Start the development server |
| `npm run build`     | Production build             |
| `npm start`         | Run the production build     |
| `npm test`          | Run the tests (Vitest)       |
| `npm run lint`      | Lint with ESLint             |
| `npm run format`    | Format with Prettier         |
| `npm run typecheck` | Type-check with `tsc`        |

## How it works

```
Browser ──HTTP──▶ /api/trpc/* ──┐
                                ├──▶ appRouter (tRPC) ──▶ ctx.store (in memory)
Server Component ──caller────────┘
```

The same router is reached two ways:

- **Server Components** call procedures directly through a server-side caller (`src/server/caller.ts`), with no HTTP round-trip. This is how the list and the edit form are server-rendered.
- **Client components** go through `/api/trpc` with the typed React Query hooks (`src/trpc/client.tsx`).

Both paths share the same validation, errors and types. The client imports only the router's _type_, so no server code ends up in the browser bundle.

## Project structure

```
src/
├── app/
│   ├── api/trpc/[trpc]/route.ts   # tRPC HTTP endpoint
│   ├── (list)/page.tsx            # Task list (SSR first page)
│   ├── (list)/loading.tsx         # Loading state of the list only (see design decisions)
│   ├── tasks/new/page.tsx         # Create
│   ├── tasks/[id]/edit/page.tsx   # Edit (task loaded via SSR)
│   ├── error.tsx, not-found.tsx
│   └── layout.tsx                 # tRPC + React Query provider
├── components/                    # TaskList, TaskItem, TaskForm, Feedback, hooks
├── lib/                           # Shared schema, error and date helpers
├── server/
│   ├── context.ts                 # Injects the store into procedures
│   ├── task-store.ts              # In-memory repository
│   ├── trpc.ts                    # tRPC init + error formatter
│   ├── caller.ts                  # Server-side caller for Server Components
│   └── routers/                   # Procedures and their tests
└── trpc/client.tsx                # Typed React hooks
```

## Design decisions

- **Store injected through the tRPC context.** Procedures never import the store directly, so every test builds an isolated store and runs without shared state.
- **One validation schema, two consumers.** `src/lib/task-schema.ts` is the source of truth for the server and the form; the client check is for UX, the server check is the guarantee.
- **SSR handed off to the client cache.** The server-rendered page is passed as `initialData` to `useInfiniteQuery`, so the list is visible immediately and the client fetches only the following pages.
- **Keyset cursor.** A page starts after the last task seen (`dataCriacao` + `id`), not at a numeric offset, so tasks created or deleted while scrolling don't repeat or skip items. The same cursor maps directly to an indexed query on a real database. Today the store still sorts on every call, which is fine at this size.
- **`dataCriacao` as a millisecond timestamp.** It serializes as plain JSON, so no transformer such as superjson is needed. Dates are formatted with a fixed locale and time zone to avoid hydration mismatches.
- **Store kept on `globalThis`.** It survives hot reloads in development; a module-level variable would be wiped on every save.
- **`loading.tsx` scoped to the list.** A loading boundary above the edit page makes Next.js send the response headers before the task is looked up, so a missing task would answer HTTP 200. Inside the `(list)` route group, it can't affect the edit route.
- **Inline delete confirmation** instead of `window.confirm`, which blocks the page and can't be styled.
- **Minimal dependencies.** Plain CSS, no UI library.

## API

tRPC over HTTP: queries are `GET` with a URL-encoded `input`, mutations are `POST` with a JSON body.

```bash
# list the first 5 tasks
curl 'http://localhost:3000/api/trpc/task.list?input=%7B%22limit%22%3A5%7D'

# create
curl -X POST http://localhost:3000/api/trpc/task.create \
  -H 'content-type: application/json' -d '{"titulo":"Buy coffee","descricao":"Optional"}'

# missing title -> 400 "Title is required"
curl -X POST http://localhost:3000/api/trpc/task.create \
  -H 'content-type: application/json' -d '{"titulo":""}'
```

## Contributing

Read the [development rules](./RULES.md) and the [roadmap](./ROADMAP.md). In short: one issue per branch, Conventional Commits, and a green CI before merging.
