# Spec 002: CLI Command Refactoring (DDD Compliance)

**Status:** Completed
**Date:** 2026-02-04
**Reference:** ADR 008, Mandate 11, Mandate 16

## Objective

Refactor the `@sous/cli` command structure to strictly follow the DDD subcommand pattern (`sous [feature] [task]`) as mandated in ADR 008 and Mandate 16.

## Current vs. Target Structure

| Current Command  | Target Command                   | Strategic Domain |
| :--------------- | :------------------------------- | :--------------- |
| `sous dev`       | `sous dev` (or `sous dev start`) | Development      |
| `sous install`   | `sous dev install`               | Development      |
| `sous sync`      | `sous dev sync`                  | Development      |
| `sous config`    | `sous env config`                | Infrastructure   |
| `sous logs`      | `sous env logs`                  | Infrastructure   |
| `sous test`      | `sous quality test`              | Quality          |
| `sous check`     | `sous quality check`             | Quality          |
| `sous housekeep` | `sous maintenance housekeep`     | Maintenance      |

## Implementation Plan

### Step 1: Create Umbrella Commands

1. Create `src/commands/env/env.command.ts` (Umbrella for config, logs).
2. Create `src/commands/quality/quality.command.ts` (Umbrella for test, check).
3. Create `src/commands/maintenance/maintenance.command.ts` (Umbrella for housekeep).

### Step 2: Relocate & Nest Subcommands

1. Move `config/` and `logs/` folders into `env/`.
2. Move `test/` and `check/` folders into `quality/`.
3. Move `housekeep/` into `maintenance/`.
4. Update `dev.command.ts` to include `install` and `sync` as subcommands (already partially done).

### Step 3: Registration

1. Update `app.module.ts` in `@sous/cli` to register the new umbrella commands.
2. Ensure `nest-commander` decorators correctly link subcommands to their parents.

### Step 4: Documentation Update

1. Update ADR 008 "Planned Command List" section to reflect the final nesting structure.

## Free-Tier Considerations

- None. This is a code organization task.
