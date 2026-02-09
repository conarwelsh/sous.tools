# ADR 036: Shared Features & Shell Pattern Strategy

## Status

Proposed

## Date

2026-02-04

## Context

The platform requires multiple high-level applications (Web, Native Mobile, KDS, POS) that share significant business logic and UI components ("Organisms"). Maintaining these features independently in each app leads to duplication, inconsistent behavior, and slow development cycles.

## Decision

We will adopt a **Shell Pattern** for applications and a **Centralized Feature Store** for logic and views.

### 1. The `@sous/features` Package

We will create a dedicated package, `@sous/features`, to house all "Next-Level" composition above the atomic components in `@sous/ui`.

- **Content:** Domain-specific Organisms (e.g., `RecipeEditor`), shared custom hooks (e.g., `useInvoices`), and shared Server Actions.
- **Structure:** Follows the **Nested DDD** mandate (e.g., `src/domains/culinary/recipes/`).
- **Platform:** Must remain **Universal** (React Native primitives + NativeWind) to ensure compatibility across Web and Mobile.

### 2. The "Shell" Pattern for Apps

Applications (`@sous/web`, `@sous/native`) will be treated as thin "Shells."

- **Responsibilities:**
  - **Routing:** Defining the URL or native navigation structure.
  - **Platform Glue:** Native modules (Camera, Haptics), PWA setup, and entry-point providers.
  - **Initialization:** Auth state, Global theme providers.
- **Restriction:** Apps should contain **zero** business logic and **zero** complex UI definitions. They simply import features from `@sous/features` and map them to routes.

### 3. Development Workflow

To build a new feature (e.g., "Menu Manager"):

1. Build the Atoms in `@sous/ui`.
2. Build the Organisms and Logic in `@sous/features`.
3. Import the feature into the appropriate routes in `@sous/web` and `@sous/native`.

## Consequences

- **Positive:**
  - **90%+ Code Reuse:** Logic and UI are written once.
  - **Maintenance:** Bug fixes in a feature instantly update all platforms.
  - **Consistency:** Ensures the KDS, Web, and Mobile apps always behave the same way.
- **Negative:**
  - **Dependency Management:** Changes to `@sous/features` require careful testing across all shells to prevent breaking changes.
  - **Abstraction Overhead:** Developers must think "Universally" by default.
