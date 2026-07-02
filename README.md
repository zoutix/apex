
# ApexFuel

ApexFuel is a full-stack fitness tracking monorepo generated from the provided `my fitness.txt` code dump. It includes a NestJS API, Prisma/PostgreSQL data model, and a Next.js 15 frontend with dashboard, food, workout, recipe, and analytics UI.

## Structure

- `apps/web` - Next.js frontend with Tailwind, Framer Motion, TanStack Query, Recharts, and reusable UI components.
- `apps/api` - NestJS API modules for auth, food logging, workouts, recipes, and analytics.
- `packages/database` - Prisma schema and generated client package.
- `packages/types` - Shared TypeScript types.

## Getting Started

```bash
npm install
cp .env.example .env
npm run db:generate
npm run dev
```

Set `DATABASE_URL` and `JWT_SECRET` before running migrations or the API in a real environment.

## Notes

The original source was a single text file, so this repo organizes it into a conventional monorepo layout and adds minimal wiring files that were missing from the dump.
