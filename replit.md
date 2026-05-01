# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Artifacts

### exam-schedule (React + Vite, preview path: `/`)
Student exam schedule lookup app for Spring 2026 Final Exams. Students enter their student ID and see all their exams with date, time, room, and subject. Data is embedded from the uploaded Excel file (`attached_assets/Spring_2026_-_Final_Exam_Schedule_1777654578478.xlsx`) and compiled into `src/examData.json` (4,265 students, 18,720+ exam records). Fully frontend-only — no backend needed.

### api-server (Express, preview path: `/api`)
Shared backend API server. Currently serves a health check endpoint only.

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
