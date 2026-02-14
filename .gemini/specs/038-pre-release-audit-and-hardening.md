# Spec 038: Comprehensive Pre-Release Audit & Hardening Strategy

## 1. Context & Objective

The @sous platform is approaching a critical release milestone. To ensure a "bulletproof" production deployment, we must conduct a rigorous, 360-degree audit of the entire codebase. This specification details the methodology, tools, and acceptance criteria for achieving 100% test coverage, eliminating dead code, ensuring security/performance compliance, and verifying full feature parity between backend and frontend.

## 2. Audit Phases

### Phase 1: Static Code Analysis & Cleanup

**Goal:** Eliminate technical debt, dead code, and placeholders.

- [ ] **Dead Code Elimination:**
  - Use `ts-prune` or `knip` to identify and remove unused exports, files, and dependencies.
  - Audit `package.json` files for unused dependencies.
- [ ] **Placeholder Identification:**
  - Global grep for `TODO`, `FIXME`, `HACK`, `TEMP`, `XXX`, `mock`, `placeholder`.
  - Review all instances and either resolve them or convert them to tracked issues if non-blocking (strictly defined).
- [ ] **Linting & Formatting:**
  - Enforce strict ESLint rules across all workspaces (`apps/*`, `packages/*`).
  - Ensure zero warnings in the build output.

### Phase 2: Security & Vulnerability Assessment

**Goal:** Secure the application against known threats and vulnerabilities.

- [ ] **Dependency Audit:**
  - Run `pnpm audit` (or `npm audit`) to identify vulnerabilities in 3rd-party packages.
  - Upgrade or patch any critical/high severity vulnerabilities.
- [ ] **SAST (Static Application Security Testing):**
  - Integrate a tool like SonarQube or CodeQL to scan for common security flaws (e.g., injection, XSS, hardcoded secrets).
  - **Secret Scanning:** Scan codebase for accidental commits of API keys or credentials (using `trufflehog` or similar).
- [ ] **Auth & Authorization Review:**
  - Audit all API endpoints (`@sous/api`) to ensure proper `Guard` (Authentication) and `Policy` (Authorization) usage.
  - Verify RLS (Row Level Security) policies if using Supabase/Postgres directly.

### Phase 3: Performance & Architecture

**Goal:** Ensure system scalability and responsiveness.

- [ ] **Bottleneck Identification:**
  - Profile API response times. Identify slow endpoints (> 200ms).
  - Analyze database queries (N+1 problems, missing indexes).
- [ ] **Job Queue Offloading:**
  - Audit all synchronous operations.
  - Ensure email sending, file processing, and third-party integrations are offloaded to a job queue (e.g., BullMQ/Redis).
- [ ] **Bundle Size Analysis:**
  - Analyze `@sous/web` and `@sous/wearos` build artifacts using `@next/bundle-analyzer`.
  - Optimize large chunks and lazy-load non-critical components.

### Phase 4: Testing & Coverage (The "100%" Mandate)

**Goal:** Prove system stability through rigorous testing.

- [ ] **Unit Testing:**
  - Target: **100% Code Coverage** for core logic (Services, Utils, Helpers).
  - Generate coverage reports (Istanbul/Jest/Vitest).
- [ ] **E2E Testing (End-to-End):**
  - Tool: Playwright.
  - Requirement: Create test suites for **ALL** critical user flows:
    - Authentication (Login, Register, Forgot Password).
    - Onboarding & Setup.
    - Core Domain Workflows (Ordering, Inventory, Recipes).
    - Error states and edge cases.
- [ ] **Integration Testing:**
  - Verify API-Database interactions.
  - Verify CLI commands against the running API.

### Phase 5: Feature Parity & Completeness

**Goal:** Ensure the Frontend exposes all Backend capabilities, and vice-versa.

- [ ] **"Orphaned" Backend Features:**
  - Map all API controllers/resolvers.
  - Verify each endpoint is consumed by the client SDK or Frontend.
- [ ] **"Mocked" Frontend Features:**
  - Identify UI components that are purely visual (no data binding).
  - Connect them to real backend endpoints or remove them.
- [ ] **Event Monitoring & Logging:**
  - **Logging:** Verify `@sous/logger` is used everywhere. Ensure logs are structured (JSON) for production ingestion.
  - **Error Tracking:** Verify Sentry (or equivalent) integration in API, Web, and Mobile.
  - **Audit Trails:** Ensure critical actions (CRUD on sensitive entities) create audit log entries.

## 3. Execution Plan (The "Remote Build" Strategy)

Since this audit requires significant compute resources (running all test suites, generating coverage, compiling all apps), the actual execution will happen on a dedicated high-performance environment.

1.  **Preparation (Local):**
    - Commit all current work-in-progress to the `development` branch.
    - Ensure the `development` branch builds successfully.

2.  **Execution (Remote):**
    - Pull the `development` branch.
    - Run the **"sous-audit"** mega-script (to be created) which performs:
      1.  `pnpm install --frozen-lockfile`
      2.  `pnpm build` (verify build integrity)
      3.  `pnpm lint` (strict)
      4.  `pnpm test:coverage` (generate reports)
      5.  `pnpm audit`
      6.  Custom script to grep for placeholders.
      7.  Custom script to map API routes to Client usage.

3.  **Reporting:**
    - Generate a consolidated **"Pre-Release Health Report"**.
    - This report will list:
      - Coverage percentages.
      - List of identified "TODOs".
      - List of security warnings.
      - List of unconnected backend/frontend features.
      - Performance metrics (bundle sizes).

## 4. Deliverables

- [x] **`scripts/audit-codebase.ts`**: A master script to orchestrate the local audit tools (Run via `pnpm audit:codebase`).
- [ ] **`coverage/`**: HTML reports of code coverage.
- [ ] **`audit-report.md`**: The final generated report file.
- [ ] **Cleaned Codebase**: PRs created to fix lint errors, remove dead code, and resolve placeholders.

### Initial Local Audit Findings (2026-02-13)

- **Dependencies:** 5 vulnerabilities found (1 High, 1 Moderate, 3 Low).
- **Linting:** Failures in `@sous/emails`, `@sous/client-sdk`, `@sous/docs`, `@sous/ui`, `@sous/web`.
- **Placeholders:** No critical TODOs found in source code; verified script effectiveness.
- **Typecheck:** Passed.

## 5. Next Steps

1.  Approve this spec.
2.  Implement `scripts/audit-codebase.ts` and necessary sub-scripts.
3.  Push to `development`.
4.  Trigger the audit on the remote environment.
