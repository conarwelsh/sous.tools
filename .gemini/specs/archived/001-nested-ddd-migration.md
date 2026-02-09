# Spec 001: Nested DDD Migration

**Status:** Completed
**Date:** 2026-02-03
**Reference:** ADR 004, Mandate 14

## Objective

Migrate the source code of `@sous/api` and `@sous/web` from flat structures to the **Nested Strategic Umbrella** directory pattern mandated in ADR 004 and Mandate 14.

## Current State

- **`@sous/api`**: Standard NestJS scaffold with `app.controller.ts`, `app.service.ts`, etc., in `src/`.
- **`@sous/web`**: Standard Next.js App Router scaffold with `app/page.tsx` and `app/layout.tsx`.

## Target Architecture (Nested DDD)

### 1. `@sous/api` structure

All business logic must move into `src/domains/`.

```text
@sous/api/src/
  ├── domains/
  │     └── iam/
  │           ├── iam.module.ts
  │           └── users/
  │                 ├── user.controller.ts
  │                 ├── user.service.ts
  │                 └── user.schema.ts
  ├── app.module.ts
  └── main.ts
```

### 2. `@sous/features` structure (Shared logic)

The source of truth for all frontend organisms, hooks, and actions.

```text
@sous/features/src/
  ├── domains/
  │     └── iam/
  │           └── auth/
  │                 ├── components/
  │                 ├── hooks/
  │                 └── services/
```

### 3. `@sous/web` structure (Thin Shell)

The web app contains only routing and platform initialization.

```text
@sous/web/src/
  ├── app/ (Routes only)
  └── lib/ (Platform glue)
```

## Implementation Plan

### Step 1: `@sous/api` Migration

1. Create `src/domains/iam/` directory.
2. Initialize `iam.module.ts`.
3. Update `app.module.ts` to import `IamModule`.
4. (Optional) Move existing boilerplate controller/service to a temporary `src/domains/core/` for cleanup.

### Step 2: `@sous/web` Migration

1. Create `src/features/` and `src/lib/` directories.
2. Ensure `tsconfig.json` supports `@/*` mapping to `src/*`.
3. Move `app/globals.css` and `app/favicon.ico` to appropriate shared locations if needed, but primarily focus on the `features/` group for any new logic.

### Step 3: CI/CD Verification

1. Run `pnpm lint` and `pnpm build` across the monorepo to ensure path aliases are still resolving.

## Free-Tier Considerations

- None. This is a directory structure change only.
