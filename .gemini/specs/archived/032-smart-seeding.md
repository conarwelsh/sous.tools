# Spec 032: Smart Seeding System

**Status:** Completed
**Date:** 2026-02-13
**Reference:** `SeederService`, `[Domain]Seeder`

## Objective

Implement a modular, domain-driven seeding system that supports both local system initialization and external sandbox synchronization. This system ensures developer velocity and consistency across environments.

## Architecture

### 1. Domain-Specific Seeders

- Seeders are located in `apps/api/src/domains/maintenance/seeders/`.
- Each domain (IAM, Presentation, Procurement, Culinary) has its own seeder class implementing the `Seeder` interface.
- **Interface:**
  ```typescript
  export interface Seeder {
    seedSystem(orgId?: string): Promise<string | void>;
    seedSample(orgId: string): Promise<void>;
  }
  ```

### 2. Coordinator Service

- `SeederService` acts as the orchestrator.
- It ensures correct order of operations (e.g., seeding IAM first to get a valid `organizationId`).
- It uses `Promise.all` for parallel domain seeding where dependencies allow.

### 3. External Synchronization

- **Culinary Seeder:** Includes a `seedExternal` method.
- **Trigger:** When `seedSample` is called and a Square Sandbox integration is configured.
- **Logic:** Pushes the local sample catalog (Categories, Products) to the Square Sandbox using the `SquareDriver`.
- **Idempotency:** Uses `onConflictDoNothing` or `onConflictDoUpdate` in local DB, and Square's `idempotencyKey` for external calls.

## Implementation Details

### IAM Seeder

- Seeds the initial `SuperAdmin` user and the `System` organization.
- Provides sample users for the `sample-kitchen` organization.

### Culinary Seeder

- Seeds base ingredients, recipes, and a sample catalog.
- If `SQUARE_APPLICATION_ID` and `SQUARE_ENVIRONMENT=sandbox` are set, it automatically attempts to seed the Square Sandbox catalog.

### Seeder CLI

- Integrated into `sous maintenance seed`.
- Supports flags for `--system` and `--sample`.

## Success Metrics

- Full system initialization in under 5 seconds.
- Successful synchronization of catalog items to Square Sandbox.
- Modular structure allows adding new domains without touching core seeder logic.
