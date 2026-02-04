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
Code will be organized by **Business Domain** using a **Nested Strategic Umbrella** structure rather than technical type.
- **Backend (`@sous/api`):** Source code must live in `src/domains/[strategic-group]/[tactical-feature]/`.
    - *Example:* `src/domains/procurement/invoices/` and `src/domains/procurement/suppliers/`.
- **Frontend (`@sous/web`):** Features should be grouped similarly in `src/features/[strategic-group]/[tactical-feature]/` containing all necessary logic and specific components for that feature.
- **Packages:** Shared logic should be extracted into domain-specific packages where appropriate.

### 2. Frontend Architecture: Controller-View Pattern
For `@sous/web` (and other UI apps), we strictly separate **Logic** from **Rendering**.

#### **Mandate: "use client" Directive Usage**
- **Explicit Requirement:** Any component that interacts with the DOM, Browser APIs (e.g., `window`, `document`), or uses React hooks (e.g., `useState`, `useEffect`, `useContext`) MUST include the `"use client"` directive at the top of the file.
- **Strict Necessity:** The `"use client"` directive MUST ONLY be added if the component or file actually requires client-side execution. We must default to Server Components to minimize client-side bundle size.

#### A. The Controller (Container)
- **Role:** Handles data fetching, state management, and side effects.
- **Implementation:**
  - In Next.js App Router: This is typically the **Page** (Server Component) or a top-level **Client Component** wrapper.
  - **Mandate: Server-Side First:** Whenever possible, data fetching must happen on the server using **Server Components**. 
  - **Mandate: Server Actions:** Mutations and side effects should prefer **Server Actions** to reduce client-side bundle size and improve reliability.
  - Responsibilities:
    - Validating inputs (Zod).
    - Calling APIs/SDKs (Directly in Server Components when possible).
    - Managing local state (hooks in Client Components).
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
  
  ## Research & Implementation Plan
  
  ### Research
  - **Next.js App Router:** Optimized for server-side data fetching. Server Components act naturally as "Controllers" in the Controller-View pattern.
  - **NestJS Modules:** Align perfectly with DDD, grouping related logic into cohesive modules.
  
  ### Implementation Plan
  1. **Directory Convention:** Enforce `features/` folders in `@sous/web` and domain-based modules in `@sous/api`.
  2. **View Standards:** Create a lint rule or template that forbids data fetching inside components located in `_components/` or `View.tsx` files.
  3. **Controller Standards:** Document the use of Server Actions for mutations and `fetch` (with caching) in Server Components for data.
  4. **Shared Types:** Ensure the `client-sdk` provides the shared types needed by both Controllers and Views.
  
