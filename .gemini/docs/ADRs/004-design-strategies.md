# ADR 004: Domain-Driven Design & Frontend Architecture

## Status
Proposed

## Date
2026-02-03

## Context
As the codebase grows, organizing code purely by technical role (e.g., all controllers in one folder, all components in another) leads to tight coupling and poor discoverability.
- **Backend:** Logic needs to be grouped by business domain to ensure modularity.
- **Frontend:** Mixing business logic (data fetching, state) with UI rendering makes components hard to test, reuse, and maintain.

## Decision
We will adopt **Domain-Driven Design (DDD)** principles for project structure and the **Controller-View (Container-Presentational)** pattern for frontend development.

### 1. Domain-Driven Design (Global)
Code will be organized by **Business Domain** rather than technical type.
- **Backend (`@sous/api`):** Modules should represent domains (e.g., `UserModule`, `BillingModule`, `AuthModule`) containing their own controllers, services, and entities.
- **Frontend (`@sous/web`):** Features should be grouped by domain directories (e.g., `features/dashboard`, `features/profile`) containing all necessary logic and specific components for that feature.
- **Packages:** Shared logic should be extracted into domain-specific packages where appropriate.

### 2. Frontend Architecture: Controller-View Pattern
For `@sous/web` (and other UI apps), we strictly separate **Logic** from **Rendering**.

#### A. The Controller (Container)
- **Role:** Handles data fetching, state management, and side effects.
- **Implementation:**
  - In Next.js App Router: This is typically the **Page** (Server Component) or a top-level **Client Component** wrapper.
  - Responsibilities:
    - Validating inputs (Zod).
    - Calling APIs/SDKs.
    - Managing local state (hooks).
    - Defining event handlers.
    - Passing data *down* to Views.

#### B. The View (Pure Component)
- **Role:** purely distinct UI representation.
- **Implementation:** React components.
- **Rules:**
  - **No Data Fetching:** Must receive all data via props.
  - **Deterministic:** Same props = same output.
  - **Visuals Only:** Focused on layout, styling (`@sous/ui`), and user interaction.
  - **Callbacks:** Delegates actions back to the Controller via props (e.g., `onSave`, `onCancel`).

### Example Structure (`@sous/web`)
```text
src/app/dashboard/
├── page.tsx            <-- Controller (Fetches data, passes to View)
└── _components/
    └── DashboardView.tsx <-- View (Renders UI based on props)
```

## Consequences
- **Positive:**
  - **Testability:** Views are easy to unit test (mock props). Controllers are easier to integration test.
  - **Maintainability:** Clear boundary between "how it looks" and "how it works".
  - **Scalability:** New domains can be added without polluting global folders.
- **Negative:**
  - **Verbosity:** Requires creating at least two files per major feature (Controller + View).
  - **Prop Drilling:** Data must be passed explicitly from Controller to View.
