# Task Manager

A simple task manager built with **Next.js 15** and **tRPC**. Tasks are kept in memory on the server and exposed through type-safe tRPC procedures.

> Work in progress. See the [roadmap](./ROADMAP.md) for what is done and what is next.

## Stack

- [Next.js 15](https://nextjs.org/) (App Router) and React 19
- [tRPC 11](https://trpc.io/) with [TanStack Query](https://tanstack.com/query)
- [Zod](https://zod.dev/) for validation
- TypeScript (strict), ESLint, Prettier
- GitHub Actions for CI

## Getting started

Requirements: Node.js 20+ (the version used in development is in `.nvmrc`).

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Scripts

| Command             | What it does                 |
| ------------------- | ---------------------------- |
| `npm run dev`       | Start the development server |
| `npm run build`     | Production build             |
| `npm start`         | Run the production build     |
| `npm run lint`      | Lint with ESLint             |
| `npm run format`    | Format with Prettier         |
| `npm run typecheck` | Type-check with `tsc`        |

## Contributing

Read the [development rules](./RULES.md) before opening a pull request. In short: one issue per branch, Conventional Commits, and a green CI before merging.
