## 2026-02-13 (User Management & Auth Expansion)

- **Social Logins (OAuth2):**
  - Expanded `AuthController` and `AuthService` to support **GitHub** and **Facebook** authentication alongside Google.
  - Implemented a unified `validateSocialUser` logic that automatically links social IDs to existing accounts via email.
  - Updated `users` schema to include `githubId` and `facebookId` with unique constraints.
- **Full Team Management UI:**
  - Established `UsersController` and `UsersModule` in the API to manage organization members.
  - Implemented `TeamList` component in `@sous/features` allowing managers to view active members, toggle roles (Admin/Member), and remove users from the organization.
  - Added role-based safeguards to prevent users from changing their own roles or removing themselves.
  - Integrated `TeamList` and `InvitationManager` into a unified **Team Management** dashboard in the web app.
- **Sync Config & CLI Injection Strategy:**
  - Researched a refactor for `@sous/config` (**ADR 057**) to move from brittle async runtime resolution to a strictly synchronous pattern.
  - Designed a **CLI Injector (Spec 034)** within `@sous/cli` that fetches secrets from Infisical and injects them into any subprocess, ensuring "Config-on-Line-1" availability.
  - Established mandatory environment wrapping for all scripts, eliminating the need for manual `.env` management or direct Infisical calls during debugging.
- **Unified Observability & Metrics Dashboard:**
  - Researched a consolidated monitoring strategy (**ADR 056**) using **OpenTelemetry (OTel)** to pipe logs, errors, and traces into **HyperDX**.
  - Designed an internal **"Control Plane" (Spec 033)** to visualize infrastructure usage (Free Tier tracking), code analytics (Tech Debt/Dependencies), and "Life of the System" events.
  - Established a "Lead with Metrics" approach to proactively monitor bottlenecks like slow DB queries and cold starts directly within the Sous SuperAdmin dashboard.
- **Unified Asset Pipeline (The Asset Forge):**
  - Established a centralized brand asset strategy (**ADR 054**) to ensure 100% uniformity across Web, Capacitor, WearOS, and Desktop targets.
  - Designed the **Sous Asset Forge (Spec 031)**, a CLI-driven engine that injects branding tokens into master SVGs and rasterizes them using Sharp.
  - Standardized on **Sovereign Templates** with LOD (Level of Detail) support for micro-icons vs. high-res splashes.
  - Integrated an "Asset Audit" mandate for the Branding Lab, ensuring build artifacts are visually verified in the documentation hub.
- **Smart Seeding & DDD Schema Standards:**
  - Established decentralized seeding standards (**ADR 055**) where domain-specific logic is encapsulated in `[domain].seed.ts` files.
  - Designed a "Smart Seed" architecture (**Spec 032**) capable of orchestrating both internal Drizzle updates and external POS sandbox (Square) synchronization.
  - Mandated strict DDD folder structures for all upcoming domains, ensuring schemas and seeders are co-located with their respective services.
- **Payment & Billing Orchestration Strategy:**
  - Defined a provider-agnostic billing architecture (**ADR 049**) using a Driver/Adapter pattern to support Stripe, **CardConnect**, and custom merchants.
  - Scoped the registration-to-activation workflow, including `PENDING_PAYMENT` states and automated provisioning.
  - Detailed the foundations for **POS Terminal hardware integration** via unified Payment Intent endpoints.
  - Established **Spec 026** for the database schema, driver interfaces, and multi-tenant notification engine.
- **Sales Attribution & Commission Engine:**
  - Established the **Salesman Role** (**ADR 053**) to sit between SuperAdmin and TenantAdmin, enabling a professional sales force.
  - Designed a **Commission Ledger (Spec 030)** for automated recurring RevShare tracking and payouts.
  - Integrated attribution into the invitation and registration flows via unique salesman IDs.
- **Scalability & Infrastructure Prep:**
  - Defined a "Zero-Cost" architecture strategy (**ADR 058**) to prepare for future sharding via mandatory `organization_id` partition keys and UUIDs.
  - Established **Spec 035** for a Read/Write split pattern in `DatabaseService` and a tiered L1/L2/L3 caching strategy.
  - Outlined the migration path from Free Tier (Render/Supabase) to Hyperscale (Kubernetes/Citus) without requiring code rewrites.
- **Edge-First Mesh Discovery:**
  - Proposed a local-first mesh architecture (**ADR 052**) using **mDNS** for automatic service discovery during internet outages.
  - Updated the hardware onboarding strategy (**Spec 009**) to utilize auto-discovery handshakes, removing the need for manual IP configuration.
- **User Invitation System:**
  - Established the `invitations` table and domain logic for organization-scoped invites.
  - Built a robust workflow: Admin sends invite -> System generates UUID token -> Background job (BullMQ) sends high-fidelity email -> User joins via `/register?token=...`.
  - Added `InvitationManager` component in `@sous/features` for tracking and revoking pending invites.
- **Account Recovery & UI Foundations:**
  - Implemented secure **Forgot Password** and **Reset Password** flows using short-lived tokens.
  - Built `ForgotPasswordForm` and `ResetPasswordForm` with modern, brand-aligned aesthetics.
  - Refactored `RegisterForm` to support invitation pre-filling and social signup.
- **Bug Fixes & Technical Debt:**
  - Resolved Next.js font loader errors by migrating variable constants to explicit literals in root layouts.
  - Fixed `useAuth` hook to export the `register` method, enabling registration from the new UI.
  - Stabilized `CoreModule` by dynamically resolving BullMQ/Redis connections from the centralized `@sous/config` package.
  - Hardened `@sous/emails` build pipeline by resolving missing React types and misconfigured TS inheritance.
  - Synchronized database schema across all environments via `db:push`.

## 2026-02-13 (Recipe Cook Mode, Inline UX, and Screen Designer Polish)

- **Recipe Cook Mode:**
  - Implemented a high-readability, full-screen "Execution Protocol" view (`/cook`) optimized for tablets.
  - Integrated browser **Wake Lock API** to keep screens active during culinary operations.
  - Built a **Baker's Math & Scaling Engine**: users can lock a specific ingredient weight or target yield, and the system automatically recalculates the entire formula.
  - Added interactive **Phase Timers** that can be triggered directly from the instruction steps.
- **Inline Recipe Editing:**
  - Refactored `RecipeDetailPage` into a seamless inline form.
  - Created `InlineInput` and `InlineTextArea` components in `@sous/ui` that mimic static text until hovered or focused.
  - Implemented a "Commit Changes" FAB (Floating Action Button) that appears only when the recipe state is dirty.
- **Screen Designer Enhancements:**
  - Renamed "Library" to "Layout Design" for clarity.
  - Added an **"Editor vs. Preview"** toggle to the canvas, allowing designers to view a 1:1 representation of the final output.
  - Enabled **Hierarchy Reparenting**: users can now drag-and-drop elements within the tree view to change their parents.
  - Forced floating elements to remain children of the root Flex container to prevent layout fragmentation.
  - Resolved an "Internal Server Error" during sync by sanitizing and stringifying complex JSON structures before database insertion.
- **Dev & Infrastructure:**
  - Refined Android Emulator startup logic in `device-manager.ts` to fallback to standard Windows SDK paths when environment variables are missing.
  - Fixed Dashboard Metrics rendering by handling bigint-to-string conversion in Postgres aggregations.
  - Implemented `sous context login-as <orgId>` CLI command for rapid cross-organizational debugging.

## 2026-02-12 (Dashboard Metrics & OrderManager Implementation)

... (rest of the file) ...
