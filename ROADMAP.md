# Roadmap

Development plan for the task manager. Each item is a GitHub issue resolved in its own branch and pull request. Items are checked as their pull requests are merged.

## Phase 1: Project foundation

- [x] Bootstrap Next.js 15 project with TypeScript (`chore/bootstrap-nextjs`)
- [x] Set up ESLint, Prettier and CI pipeline (`chore/code-quality-ci`)
- [x] Add README, roadmap and development rules (`docs/project-docs`)

## Phase 2: Backend: task API with tRPC

- [x] Configure tRPC server and HTTP handler (`feat/trpc-setup`)
- [x] Implement in-memory task store (`feat/task-store`)
- [x] Task CRUD procedures with validation and error handling (`feat/task-crud`)
- [x] Unit tests for task procedures (`test/task-router`)

## Phase 3: Frontend: task management UI

- [x] tRPC client provider and server-side caller (`feat/trpc-client`)
- [x] Task list page with SSR (`feat/task-list-ssr`)
- [ ] Delete tasks from the list with feedback (`feat/delete-task`)
- [ ] Create and edit task form with validation (`feat/task-form`)
- [ ] Loading, error and not-found states (`feat/app-states`)

## Phase 4: Bonus

- [ ] Infinite scroll on the task list (`feat/infinite-scroll`)
- [ ] Final documentation pass (`docs/final-docs`)

## Out of scope

- Database persistence (tasks live in memory by design)
- Authentication and multi-user support
- Deployment
