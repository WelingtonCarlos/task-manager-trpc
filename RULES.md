# Development Rules

Standards for code quality, structure and workflow in this repository. Every pull request is expected to follow them; the CI pipeline enforces the automated ones.

## 1. Language and tooling

- **TypeScript only**, in `strict` mode, with `noUncheckedIndexedAccess`. No `.js` source files.
- **No `any`.** Use `unknown` and narrow it, or infer types from the source of truth (`inferRouterOutputs`, `z.infer`).
- **Formatting is Prettier's job.** Don't hand-format or debate style in reviews; run `npm run format`.
- **Linting must pass with zero errors.** Don't disable a rule inline without a comment explaining why.
- Use `type` imports for types only (`import type { Foo } from "..."`).
- Target the Node.js version pinned in `.nvmrc`.

## 2. Project structure

```
src/
├── app/         # Next.js routes (pages, layouts, route handlers). Thin: compose, don't implement.
├── components/  # Reusable React components
├── lib/         # Framework-agnostic helpers shared by client and server
├── server/      # Backend only: tRPC init, routers, data access. Never imported by client code.
└── trpc/        # Client-side tRPC setup
```

- **Server code stays on the server.** Modules under `src/server/` that touch data must import `"server-only"` when they are used by Server Components.
- **The client imports the router _type_, never its implementation.**
- Use the `@/` alias for imports across folders; relative imports only within the same folder.
- One component per file; file name matches the exported component (`TaskList.tsx` → `TaskList`).

## 3. Naming

| Thing                   | Convention                               | Example                    |
| ----------------------- | ---------------------------------------- | -------------------------- |
| Components              | PascalCase                               | `TaskForm`                 |
| Hooks                   | camelCase starting with `use`            | `useTaskForm`              |
| Functions and variables | camelCase, verbs for functions           | `getErrorMessage`          |
| Constants               | UPPER_SNAKE_CASE for module-level config | `PAGE_SIZE`                |
| Types                   | PascalCase, no `I` prefix                | `Task`, `TaskStore`        |
| tRPC procedures         | `<entity>.<verb>`                        | `task.create`, `task.list` |
| Files (non-components)  | kebab-case                               | `task-store.ts`            |

The domain model keeps the field names defined in the specification (`titulo`, `descricao`, `dataCriacao`). Everything else (code, comments, commits, PRs, docs) is written in English.

## 4. Backend (tRPC)

- **Validate every input with Zod.** No procedure reads unvalidated input.
- Shared validation rules live in one schema module and are reused by the client form.
- **Errors are `TRPCError`s with the right code:** `BAD_REQUEST` for invalid input, `NOT_FOUND` for missing resources. Messages are written for the end user, without internal details.
- Procedures stay thin. Data access goes through the store, which receives no tRPC types.
- Dependencies (like the store) come from the tRPC **context**, so procedures can be tested with an isolated instance.

## 5. Frontend (React / Next.js)

- **Server Components by default.** Add `"use client"` only to components that need state, effects or browser APIs.
- Pages that show runtime data are rendered dynamically (SSR); never statically generate data that changes at runtime.
- **Function components and hooks only.** No class components.
- Every async action has visible **loading, success and error** states.
- Validate forms on the client for UX, but never rely on it: the server is the source of truth.
- Accessibility: every input has a `<label>`, errors are linked with `aria-describedby`, feedback uses `role="status"` / `role="alert"`.
- Keep components small. Extract a component or hook when a file mixes unrelated concerns or grows past ~150 lines.

## 6. Testing

- Business rules and every tRPC procedure have unit tests (Vitest).
- Tests are independent: each test builds its own store, with no shared mutable state between tests.
- Cover the happy path **and** the failure modes (validation errors, missing resources).
- A bug fix comes with a test that fails without the fix.

## 7. Git workflow

- `main` is always releasable. **Never commit directly to `main`.**
- **One issue → one branch → one pull request.**
- Branch names: `<type>/<short-description>` in kebab-case, e.g. `feat/task-form`, `fix/delete-feedback`, `docs/readme`.
- Commits follow **Conventional Commits**:

  ```
  <type>: <imperative summary, lower case, no period>
  ```

  Types: `feat`, `fix`, `refactor`, `test`, `docs`, `style`, `chore`, `ci`, `perf`.

- Keep commits small and focused; each one should build.
- No secrets, tokens or personal data in the repository. All sample data is fictitious.

## 8. Pull requests

- The PR title follows the commit convention and the description uses the template: summary, list of changes, how to test, and the linked issue (`Closes #<n>`).
- CI must be green before merging.
- Before requesting review, the author checks the list below.

### Definition of done

- [ ] Acceptance criteria of the issue are met
- [ ] `npm run lint`, `npm run typecheck`, `npm test` and `npm run build` pass
- [ ] New logic is covered by tests
- [ ] Loading, success and error states are handled in the UI
- [ ] Docs (README / ROADMAP) updated when behavior or setup changed
