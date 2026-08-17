# ForgetMeNot AI

ForgetMeNot AI is a mobile personal omission prediction engine that helps people notice what they are likely to forget before it becomes a problem.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/forgetmenot-ai/app/index.tsx` — mobile screens, navigation, and first-build interactions.
- `artifacts/forgetmenot-ai/constants/colors.ts` — ForgetMeNot semantic color tokens.
- `artifacts/forgetmenot-ai/assets/images/` — generated globe, memory, prediction, and app icon artwork.
- `artifacts/forgetmenot-ai/docs/ARCHITECTURE.md` — product and implementation evolution notes.

## Architecture decisions

- The first build is frontend-first and uses local state so core product interactions work immediately in Expo Go.
- A single root route owns the full product surface to keep navigation lightweight while the product concept is validated.
- Five everyday destinations are always available; prediction, action, memory, and contact views are focused secondary screens.
- The black/pink/cyan/green/gold palette is semantic: pink draws attention, cyan shows context, green indicates prevention, and gold signals care/practicality.

## Product

The app gives users a daily AI signal overview, a context-aware events view, note/photo/voice capture entry points, a conversational second brain, an omission radar, preventive action checklist, private signal map, and a feedback channel.

## User preferences

- The product identity is ForgetMeNot AI: a Personal Omission Prediction Engine, not a traditional reminder app.
- The visual language should stay black with bright pink, cyan, fluorescent green, and gold, and should reuse the F-inside-a-globe motif.

## Gotchas

- The Expo app is served through the managed `artifacts/forgetmenot-ai: expo` workflow.
- Use Expo Go-compatible device APIs when replacing the first-build local capture and profile placeholders.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
