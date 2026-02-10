# History

## 2026-02-10 (Layout Manager Refactor & Stability)

- **Layout Manager Refactor:**
    - Transitioned `LayoutManager` to use standard Next.js routing (`/presentation/layouts/new`, `/presentation/layouts/[id]`).
    - Implemented a robust Drag-and-Drop system in `LayoutDesigner` using `@dnd-kit`.
    - Added automatic nesting logic for structural elements (Containers, Slots, Fixed Boxes).
    - Fixed API crash during template saves by sanitizing payloads to match the Drizzle schema.
    - Resolved port conflict (EADDRINUSE: 4000) issues by cleaning up orphan `nest` and `node` processes.
    - Updated `TemplateSkeletonRenderer` to support custom child rendering for the designer.

## 2026-02-09 (Presentation & Infrastructure Stability)

- **Functional Layout Designer (Spec 006):**
  - Upgraded the **`LayoutDesigner`** from a static mockup to a fully functional visual editor.
  - **Recursive Tree Management:** Implemented logic to ensure all layout nodes have internal tracking IDs and can be updated or deleted recursively within the tree.
  - **Property Editor:** Developed a context-aware sidebar for editing node properties (Flex, Gap, Padding, Background, and absolute positioning for fixed boxes).
  - **Node Creation:** Implemented functional "Element Cards" to add new Groups (Containers), Slots, and Fixed boxes to the selected container.
  - **Interactive Canvas:** Enhanced the **`TemplateSkeletonRenderer`** with click-to-select functionality and high-fidelity visual feedback for the active node.
- **Screen Manager Implementation (Spec 007):**
  - **Database Expansion:** Added the `screens` table to the PostgreSQL schema via Drizzle ORM to persist persistent content assignments.
  - **Relational Integrity:** Updated the display assignment logic to link physical displays to **Screens** (which contain content and styles) instead of raw Layout Templates.
  - **Backend API:** Implemented a full suite of CRUD endpoints in the `PresentationController` and `PresentationService` for managing screens.
  - **UI Foundations:** Scaffolded the **`ScreenManager`** and **`ScreenEditor`** in `@sous/features`, allowing users to select a layout and bind real-world data sources (POS, Media, Static) to defined slots.
- **Infrastructure & Environment Recovery:**
  - **ESM require Resolution:** Fixed a critical "Dynamic require" error in `@sous/config` by implementing a resilient `eval('require')` check that correctly identifies CJS vs ESM environments.
  - **Build Command Sanitization:** Marked Node.js built-ins (`fs`, `path`, etc.) as external in the `tsup` configuration for the config package, preventing bundler-induced runtime crashes.
  - **Database Migration Reliability:** Resolved schema resolution issues in `drizzle-kit` by removing hardcoded `.js` extensions from TypeScript imports and switching to glob-based schema scanning.
  - **Typecheck Stability:** Configured `tsconfig.json` to exclude the `.next` directory, preventing transient build errors from blocking development quality checks.
- **Result:** ACHIEVED a fully functional presentation management loop (from structural design to content assignment) while stabilizing the monorepo build and development environment.

## 2026-02-05 (Identity & Asset Strategy)

- **Implemented Android Product Flavors:**
  - Added `tools`, `kds`, `pos`, and `signage` flavors to `apps/web/android/app/build.gradle`.
  - Configured unique application identifiers and application names per flavor.
  - Injected a `sous_flavor` string resource into each APK for runtime identification.
- **Unified Kiosk Redirection:**
  - Implemented `FlavorGate` component in `@sous/web` root layout.
  - Automatically redirects standard web root (`/`) to specialized kiosk routes (`/kds`, `/pos`, etc.) when running in a flavored Capacitor build.
- **Hardware Simulation & Orchestration:**
  - Integrated **Redroid (Android in Docker)** into `docker-compose.yml` to simulate a physical signage node.
  - Added **scrcpy-web (signage-ui)** for browser-based visualization of the signage node at `signage.sous.localhost`.
  - Created `scripts/launch-kiosks.sh` to automate the building of all flavors and their deployment to specific emulator ports (WearOS: 5554, POS: 5556, Tools: 5558, KDS: 5560, Signage: 5555).
- **HDMI Projection Infrastructure:**
  - Developed `SousHardwarePlugin` and `SousPresentation` in the Android project.
  - Enables the Signage app to detect and project content to secondary HDMI displays (using Android `Presentation` API), specifically targeting Raspberry Pi hardware.
- **Brand Identity Alignment:**
  - Updated KDS, POS, and Signage pairing screens to use specialized logo suffixes (`sous.kds`, `sous.pos`, `sous.signage`).

## 2026-02-07 (Runtime & Bundling Fixes)

- **Resolved "Dynamic require of 'fs'" Error:**
  - Fixed a critical runtime error in `@sous/features` where `socket.io-client` sub-dependencies (`xmlhttprequest-ssl`) were being bundled with Node.js-specific code (`fs`, `path`).
  - **Bundling Isolation:** Updated `packages/features/tsup.config.ts` to explicitly mark `socket.io-client`, `lucide-react`, `react-markdown`, and `remark-gfm` as external.
  - **Dependency Correction:** Added `socket.io-client` to the `dependencies` of `@sous/features` and `@sous/web` to ensure correct resolution now that it is excluded from the library bundle.
  - **Result:** ACHIEVED a stable browser environment for `@sous/web` while maintaining full functionality for the `useHardware` realtime hook.

## 2026-02-07 (Tauri-to-Capacitor Refactor Completion)

- **Tauri to Capacitor Migration Implementation:**
  - Completed the full refactor of native application targets from Tauri to Capacitor as per ADR 041.
  - **@sous/web Consolidation:** Migrated all specialized native app views (KDS, POS, Signage) into the primary Next.js web application as dedicated routes under `(kiosk)` and `(admin)` groups.
  - **Capacitor Integration:** Initialized and configured Capacitor in `apps/web` with support for Android and iOS platforms.
  - **Hardware Pairing Strategy:** Implemented a new `useHardware` hook in `@sous/features` to manage browser-based hardware identification and pairing workflows, replacing the Rust-based `native-bridge`.
  - **CLI Orchestrator Update:** Refactored `sous dev` and the `ProcessManager` service to support the new Capacitor-based development loop and remove references to deleted Tauri applications.
  - **UI & Feature Cleanup:** Finalized the removal of `react-native`, `nativewind`, and `tauri` dependencies across the monorepo, standardizing on a pure React/Tailwind/Radix UI stack.
  - **Documentation & Scripts Refresh:** Updated `README.md`, `pnpm-workspace.yaml`, and `install-rpi.sh` to reflect the web-first architecture and browser-only kiosk targets.

## 2026-02-07 (Architectural Pivot)

- **Web-First Pivot**: Abandoned React Native Web and Tauri universal architecture due to integration fragility with Next.js 16/React 19.
- **UI Refactor**: Converted `@sous/ui` from React Native primitives to standard Shadcn UI patterns (Radix + Tailwind).
- **Dependency Cleanup**: Removed all `react-native`, `nativewind`, and `tauri` related packages from the monorepo.
- **Mobile Strategy**: Switched to Capacitor for mobile shells, allowing for a single high-performance web codebase.
- **Kiosk Strategy**: Switched to FullPageOS for Raspberry Pi nodes, eliminating the need for custom Rust/Tauri builds on Linux.
- **Documentation Update**: Refreshed all ADRs and architectural docs to reflect the new direction.

## 2026-02-07

- **Web App Build & Dev Recovery (@sous/web):**
  - Resolved critical build and development failures in `@sous/web` related to Next.js 16, React 19, and NativeWind v4 compatibility.
  - **PostCSS Stability:** Renamed `postcss.config.mjs` to `postcss.config.js` and converted to CommonJS. Removed `nativewind` from the PostCSS plugin list (it's now a Tailwind preset), fixing `SyntaxError: Unexpected token 'typeof'` in `next/font` workers.
  - **Client-Side Dependency Isolation:** Implemented Webpack aliases in `next.config.ts` to mock server-only dependencies (`@infisical/sdk`, `dotenv`, `fs`, `path`, `os`) to `false` on the client. This resolved `Attempted import error` related to AWS SDK and Smithy packages leaking into the browser bundle.
  - **JSX Runtime Resolution:** Added a Webpack alias for `nativewind/jsx-runtime` pointing directly to the `react-native-css-interop` runtime.
  - **Dependency Alignment:** Aligned `react-native` version across the monorepo to `^0.77.3`.
  - **Result:** ACHIEVED 100% successful production build and stable `next dev` environment for `@sous/web`.

## 2026-02-06 (Evening)

- **Universal React 19 & Vite Stability:**
  - Resolved critical React 19 compatibility issues across all apps by implementing a robust `react-dom-compat.mjs` shim that manages `ReactDOM` roots per container.
  - Standardized absolute path resolution for all shims (`react-dom`, `react-native`, `react-native-svg`) across both Next.js and Vite/esbuild configurations.
  - Introduced `packages/ui/src/react-native-svg-shim.mjs` to mock missing SVG filter components (Filter, FeGaussianBlur, etc.) in web environments, resolving pre-bundling errors in `@sous/ui`.
  - Fixed deep import resolution for `react-native/Libraries/Utilities/codegenNativeComponent` via a dedicated internal shim.
- **Branding Identity & Logo Evolution:**
  - Ported the "Circuit" lettermark variant into `@sous/ui` based on user-provided high-fidelity SVG paths.
  - Fully implemented missing `plate`, `link`, and `dot` scalable logo variants to match the platform configuration schema.
  - Enhanced the `Logo` component with consistent neon glow effects for technical variants.
- **Android & WearOS Build Recovery:**
  - Fixed `@sous/wearos` build failures by correctly configuring `android.useAndroidX=true` in workspace-level `gradle.properties` and aligning Compose Compiler (1.5.8) with Kotlin (1.9.22).
  - Resolved Android project synchronization issues for `@sous/kds` and `@sous/pos` by cleaning out-of-sync `gen/android` directories and ensuring identifier alignment.
  - Stabilized `sous dev` multi-device orchestration with explicit port assignments and serial targeting.

## 2026-02-06 (Major Milestone: Platform Rollout Complete)

- **Phase 4 & 5 Implementation:**
  - Established **Intelligence Domain** with BullMQ-backed async costing engine and price trend analysis.
  - Implemented **Accounting Domain** with general ledger and P&L generation logic.
  - Built **Integrations Domain** using a Driver/Adapter pattern for external POS (Square/Toast) and Storage (Google Drive) providers.
  - Implemented **Inventory Domain** with stock ledger and theoretical depletion logic.
  - Integrated **GraphQL** (Apollo) for complex data requirements alongside REST (Scalar).
  - Established **Data Pruning** (Cron) and **Real-time Throttling** strategies to sustain free-tier operations.
  - Implemented **Internationalization (I18n)** in `@sous/ui` using `i18next`.
- **Phase 6 Implementation (POS & KDS):**
  - Built **`KDSFeature`** with real-time order grid and integrated BLE temperature monitoring (HACCP).
  - Built **`POSFeature`** with high-speed order entry, cart management, and receipt printing.
  - Implemented **`LabelEditor`** for thermal prep label design and printing.
  - Enhanced **`NativeBridge`** with actual hardware communication hooks (Printers, BLE).
- **Quality & E2E:**
  - Established a comprehensive **Playwright E2E suite** covering POS, KDS, and Pairing flows.
  - Verified **Unit Tests** for core domain services (Costing, Accounting, Inventory).
  - Achieved full, functional parity across Web, Signage, POS, and KDS apps.
- **Result:** Successfully completed the entire **Phase Rollout Plan**, transitioning from scaffold to a fully functional, multi-tenant SaaS platform ready for production optimization.

## 2026-02-05

- **Identity & Multi-Tenancy (Phase 1.6):** - Established the core Drizzle ORM infrastructure in `@sous/api`.
  - Implemented a multi-tenant database schema with `organizations`, `users`, `locations`, and `media` tables.
  - Integrated JWT-based authentication and RBAC (User, Admin, Superadmin) in the `IAM` domain.
  - Added `sous maintenance db push` to the CLI for automated schema synchronization.
- **Media & Asset Strategy (Phase 1.7):**
  - Implemented the `Media` domain in `@sous/api` for centralized asset management.
  - Integrated **`sharp`** for mandatory grayscale and WebP optimization (ADR 028) to stay within free-tier storage limits.
  - Implemented **`SupabaseStorageService`** for tenant-isolated cloud storage.
  - Created a secure **`MediaController`** with JWT-protected upload endpoints and automatic optimization pipelines.
  - Added comprehensive storage configuration to `@sous/config`.
- **Signage MVP (Phase 2):**
  - **Presentation Engine (Phase 2.1):**
    - Established the `Presentation` domain in `@sous/api` with `templates`, `displays`, and `displayAssignments` tables.
    - Implemented **Real-time Gateway** using `socket.io` for instant content updates.
    - Integrated `socket.io-client` into `@sous/native-headless` to listen for `presentation:update` events.
    - Created a universal **`PresentationRenderer`** in `@sous/features` to handle dynamic layout rendering.
    - Implemented **System Template Seeding** in `@sous/api` to provide out-of-the-box fullscreen and grid layouts.
- **Production Readiness (Phase 1.5):**
  - **WearOS Fix:** Manually generated and configured the Gradle wrapper for `@sous/wearos`, including `gradlew`, `gradlew.bat`, and `gradle-wrapper.jar`. This resolves the immediate failure in Android Studio due to missing build scripts.
  - **Priority Realignment:** Shifted Phase 1.5 focus to prioritize stable production deployments for the core platform (`@sous/api`, `@sous/web`, `@sous/docs`) and the signage output (`@sous/native-headless`).
- **Dashboard & Dev Experience (God View):**
  - **Resolved @sous/docs "barking" issues:**
    - Fixed "Workspace Root" warning in Next.js by explicitly setting `outputFileTracingRoot`.
    - Silenced "Port 3000 in use" noise by passing the correct `PORT=3001` in the `dev.kdl` orchestrator.
    - Resolved several ESLint errors and warnings in `apps/docs` (unused variables, illegal `require` in tailwind config).
    - Cleaned up unused `react-dom-shim.js` logic and unified React 19 compatibility shims.
  - Added `[c]` keyboard shortcut to `sous dev` to clear logs for the currently active panel (Services, Combined, Terminal, or Gemini).
- **Branding Identity & Lab Evolution:**
  - Upgraded **`@sous/docs`** to use the official **`Wordmark`** component, eliminating hardcoded logo text.
  - Enhanced the **Branding Lab** with interactive controls for `variant`, `size`, and `wordmark` props.
  - Implemented a list of predefined wordmark options (`sous.api`, `sous.docs`, `sous.kds`, etc.) to ensure cross-platform brand consistency.
  - Improved **`NeonLogo`** visuals with sophisticated SVG filters (glows) and robust wordmark rendering.
  - Standardized wordmark rendering across all variants (**Neon**, **Plate**, **Link**, **Dot**) to follow the brand identity (Main white, .TLD in brand color, all caps).
  - Unified monorepo versioning to **v0.0.0** and ensured UI components reflect this state.
  - Fixed Next.js 16 Turbopack compatibility issue in `@sous/docs` by explicitly enabling the Webpack compiler for custom alias support.
- **Universal Design System (Phase 1.3):**
  - Implemented standardized `Button`, `Input`, and `Card` atoms in `@sous/ui` using universal styling (NativeWind v4).
  - Created an interactive "Atomic Playground" in `@sous/docs` for CDD verification.
- **Native Bridge & Offline Safety (Phase 1.4):**
  - Implemented `NativeBridge` with persistent `OfflineAction` queue.
  - Integrated SQLite via `@tauri-apps/plugin-sql` for native environments with a `localStorage` fallback for the web.
- **Infrastructure Dashboard:** Integrated real-time system metrics (CPU, Memory, Uptime) into the `sous dev` TUI.
- **Documentation Hub UI Overhaul:**
  - Implemented a professional, responsive layout for `@sous/docs` with a collapsible desktop sidebar and animated mobile menu.
  - Designed a structured navigation system that automatically groups ADRs, Specifications, and READMEs.
  - Integrated high-fidelity typography and custom prose styling using the project's brand fonts (Outfit/Inter).
  - Optimized `@sous/features` to use web-native components for the Knowledge Base to resolve bleeding-edge Next.js 16/Turbopack compatibility issues with universal `react-native` aliases.
- **Phase 1.2 Accomplishments:**
  - **Documentation Hub:** Implemented `@sous/docs` with a persistent Knowledge Base that aggregates ADRs, Specs, and READMEs. Refactored `@sous/features` build system to support split client/server entries for Next.js compatibility.
  - **CLI DDD Refactoring:** Reorganized `@sous/cli` into strategic umbrellas (`dev`, `env`, `quality`, `maintenance`).
  - **Robust Dev Orchestrator:** Implemented an interactive React Ink TUI for `sous dev`, replacing static logging with a real-time process dashboard.
  - **ZSH Customization:** Implemented `sous dev install shell` which adds brand-aligned prompts, infrastructure health indicators, and productivity aliases (`sous`, `sd`, `sl`, `c`, `ls`, etc.) to the user's terminal.
- Enforced **Mandate 15: The Shell Pattern** by moving strategic umbrellas from `@sous/web` to the shared **`@sous/features`** package, ensuring absolute logic reuse between platforms.
- Completed **Phase 1.1** of the rollout plan.
- Migrated `@sous/api` and `@sous/web` to the **Nested DDD** folder structure (moving core logic to `domains/` and `features/`).
- Configured Traefik in `docker-compose.yml` as a reverse proxy, including a dynamic bridge to the Raspberry Pi (`rpi.sous.local`).
- Created **ADR 040: CI/CD Strategy for Native Binaries** to utilize self-hosted GitHub runners for Windows and ARM64 builds.
- Refined **ADR 039: CLI-Driven ZSH Customization** to include a robust set of productivity aliases (`sous`, `c`, `ls`, `sd`, `sl`, etc.).
- Comprehensive README overhaul: Created/Updated `README.md` for all 9 apps and 8 packages, adhering to **Mandate 6** (Responsibilities, Setup, Tech Stack, ADR links).
- Rewrote `@sous/cli` README.md to accurately reflect the tool's capabilities and document the upcoming shell customization features.
- Created **ADR 039: CLI-Driven ZSH Customization** to improve Developer Experience with brand-aligned prompts and infrastructure status indicators.
- Updated `phase-rollout-plan.md` to include ZSH customization in Phase 1.2.
- Refactored `scripts/dev-orchestrator.ts` to use absolute `pnpm` paths and avoid `shell: true` issues, fixing `ENOENT` errors during app startup.
- Updated root `.idea` configuration to use `#GRADLE_LOCAL_JAVA_HOME` for better WSL compatibility in Android Studio.
- Switched to `includeBuild` in the root `settings.gradle.kts` for Tauri-based projects.
- Fixed a Gradle sync error in the `apps/native` subproject by removing the redundant `allprojects` repository block.
- Fixed Android Studio "Invalid Gradle JDK" warnings by switching to `#PROJECT_SDK` and defining a clean `17` JavaSDK in `.idea/misc.xml`.
- Configured monorepo for "Single Window" Android Studio support by adding root `settings.gradle.kts` and `build.gradle.kts`.
- Updated `dev-device-installation.md` with physical device setup and monorepo IDE instructions.
- Fixed `@sous/config` package by implementing a proper build step with `tsup`. This resolved a `SyntaxError: Named export 'localConfig' not found` in Vite.
- Improved `scripts/install-dev.sh` to support ZSH, use correct Android SDK paths, and export `TAURI_DEV_HOST`.
- Fixed missing `unzip` dependency and added automatic ARM64 `apt` source fixing in `scripts/install-dev.sh`.
- Verified `@sous/docs` and `@sous/web` functionality.
- Configured development environment with non-conflicting ports:
  - API: 4000
  - Web: 3000
  - Docs: 3001
  - Native Apps (Vite): 1421-1424
- Fixed `@sous/native*` application identifiers in `tauri.conf.json` to avoid reserved keywords (e.g., changed `com.conar.native` to `com.sous.nativeapp`).
- Successfully started all core services and native app dev servers.
- Verified all services are responding via curl.
- Updated ADR 004: Added mandate for strict `"use client"` directive usage (DOM/Browser API interaction only).
- Added Mandate 13: Strict `"use client"` usage (only when DOM/Browser APIs are required).
- Updated ADR 005: Refined domain boundaries, introduced the **Intelligence** domain for asynchronous costing, and renamed "Catalog" to "Procurement" and "IoT" to "Hardware".
- Converted `@sous/ui` to Universal Architecture using **NativeWind v4**, **React Native Web**, and **React Native Reusables** pattern.
- **Branding Migration:**
  - Migrated **Neon Lettermark/Wordmark** from the legacy project.
  - Converted SVG branding components to **`react-native-svg`** for universal cross-platform support.
  - Added 3 new scalability-focused lettermark variants: **`plate`**, **`link`**, and **`dot`**.
  - Updated **`brand-identity.md`** with professional `oklch` theme tokens.
  - Established **.gemini/specs/005-documentation-hub.md** for a pixel-perfect Branding Lab with persistence and a CDD playground.
  - Expanded **ADR 006** with a comprehensive baseline of required UI atoms (Button, Input, Card, Dialog, etc.).
- **Architectural Refinement:**
  - Re-indexed all ADRs (001-030) for proper logical/dependency ordering.
  - Merged **Admin Domains** (SuperAdmin + TenantAdmin) into ADR 021.
  - Merged **Visual Domains** (Layouts + Displays + Labels) into ADR 022 (Presentation).
  - Created **ADR 028: Media Management Strategy** (Supabase + Cloudinary).
  - Created **ADR 029: Data Retention & Pruning Strategy** (Free-tier row management).
  - Updated **ADR 011: Native Bridge** with **Offline Safety Mode** (Local SQLite).
  - Refined ADR 022: Defined the two-tier layout system (Structural Templates vs. Specialized Content Assignment).
  - **Final Strategic Refinements:**
    - Differentiated **Intelligence** (Real-time) vs. **Accounting** (Historical) domains.
    - Created **ADR 032: I18n Strategy** (Type-safe, code-split translations).
    - Created **ADR 033: Testing Strategy** (HITL simulation + Universal UI testing).
- Created ADR 034: Real-time Throttling (60s batching for free-tier sustainability).
- Created **ADR 035: Docker Infrastructure Strategy** (Local Cloud Mocks: Postgres, Redis, MailDev, Minio).
- Created **ADR 036: Shared Features & Shell Pattern Strategy** (Maximizing reuse via `@sous/features`).
- Created **ADR 037: Robust Dev Orchestrator Strategy** (Implementing custom React Ink TUI).
- Created **ADR 038: CLI Infrastructure Dashboard Strategy** (Animated TUI for platform metrics).
- Established **.gemini/specs/004-cli-infra-dashboard.md** for the real-time reporting tool.
- Integrated **Docker Compose management** (Status, Start/Stop, Logs) into the Dev Orchestrator plan.
- Added **RPi Edge Integration** to Dev Orchestrator (SSH log tailing, one-click Sync+Start).
- Expanded **`sous maintenance`** brainstorming with `dead-code`, `unused-packages`, and `unused-css` commands.
- Added **`ubuntu-sandbox` image** to ADR 035 for ephemeral testing of installation scripts.
- Added **Mandate 17: Build Artifact Exclusion** (Ensuring @.gemini is excluded from production).
- Added **Mandate 18: Development Branch Isolation** (No cloud deployments for `development`).
- Configured **Husky** to skip all checks (commit and push) when on the `development` branch.
- Scaffolded **`@sous/features`** package for domain-specific "Organisms" and logic.
- Added **Mandate 15: The Shell Pattern** (Apps are thin shells; logic lives in `@sous/features`).
- Added **Mandate 16: CLI Command Aggregation** (All `package.json` scripts must be aggregated into `@sous/cli`).
- **Phase Rollout Plan Realignment:**
  - Prioritized "Phase 1.5: Production Readiness" to ensure all native apps build/deploy successfully.
  - Elevated "Phase 2: Signage MVP" to high priority for immediate restaurant usage.
  - Reorganized Culinary domains to focus on "Data Entry" before "Intelligence."
  - Deprioritized KDS and POS to the final phase.
- Established **.gemini/docs/brand-identity.md** for visual and stylistic principles. - Updated **ADR 028** with strict Grayscale/WebP mandate for Invoice storage. - Renamed ADR 030 to **ADR 031: Android Dev Workflow**.
  - Established `.gemini/specs/` directory for implementation planning.

## 2026-02-03

- Initial scaffolding of the project structure.
- Created apps: web, api, cli.
- Created packages: client-sdk, config, eslint-config, logger, typescript-config, ui.
- Established mandates in .gemini/GEMINI.md.
- Switched package manager from `npm` to `pnpm`.
- Created ADR 002: Centralized Configuration Strategy (Infisical + Zod).
- Created ADR 003: Centralized Logger Strategy (Pino + Better Stack).
- Created ADR 004: Domain-Driven Design & Frontend Architecture.
- Created ADR 005: Platform Domains & Multi-Tenancy Strategy.
- Created ADR 006: Universal UI Component Strategy (React Native Web + NativeWind).
- Created ADR 007: Deployment & Environment Strategy.
- Created ADR 008: CLI Orchestrator Strategy (@sous/cli).
- Created ADR 009: Security, Authentication, and Authorization Strategy.
- Added Global Mandate: All infrastructure must operate within service **Free Tiers**.
- Created ADR 010: Backend API Architecture & Communication Strategy (REST, GQL, WS, BullMQ, Resend, Cron, Drizzle ORM).
- Selected **Drizzle ORM** as the primary data access layer for the platform.
- Created ADR 011: Native Bridge Strategy (@sous/native-bridge - BLE Gateway, Offline Caching).
- Created ADR 012: Headless Kiosk Strategy (@sous/native-headless).
- Created ADR 013: Kitchen Display System (KDS) Strategy (@sous/native-kds).
- Created ADR 014: Point of Sale (POS) Strategy (@sous/native-pos).
- Created ADR 015: Universal Platform Application Strategy (@sous/web & @sous/native).
- Created ADR 016: Documentation Platform & Branding Lab (@sous/docs).
- Created ADR 017: Hardware Domain Strategy (Supersedes/Refines IoT Domain).
- Created ADR 018: Recipes Domain Strategy (AI Ingestion, Advanced Scaling).
- Created ADR 019: Invoices Domain Strategy (AI Extraction, Price History).
- Created ADR 020: Ingredients Domain Strategy (Market Intelligence, Price Wars).
- Created ADR 021: SuperAdmin Domain Strategy (Platform Oversight, Tenant Management).
- Created ADR 022: Tenant Admin Domain Strategy (Organization & Location Management).
- Created ADR 023: Layout Manager Domain Strategy (Visual WYSIWYG Editor).
- Created ADR 024: Displays Domain Strategy (Content Assignment & Orchestration).
- Created ADR 025: Labels Domain Strategy (Visual Label Design & Printing).
- Created ADR 026: Accounting & Financial Intelligence Domain Strategy.
- Created ADR 027: Third-Party Integrations Strategy (Driver/Adapter Pattern).
- Created ADR 028: Virtual Inventory & Order Management Strategy.
- Created ADR 029: Order Manager Strategy (Vendor Optimization & Reconciliation).
- Created ADR 030: Wear OS Application Strategy (@sous/wearos).
- Defined Phased Rollout Plan in `.gemini/phased-rollout.md`.
- Added Mandate 7: Server-Side Data Fetching (Next.js Server Components & Actions).
- Added Mandate 8: Local Development Branch (Mandatory `development` branch for local work).
- Added Mandate 6: Automated Documentation (READMEs) for all packages and apps.
- Implemented `sous logs tail` and `sous logs wipe` commands in `@sous/cli`.
- Fixed `@sous/config` and `@sous/cli` Infisical integration to use SDK v4.
- Added `sous config add` command for upserting secrets.
- Refactored `@sous/cli` folder structure to follow DDD principles (grouped by command in `src/commands/`).
- Added Mandate 11: Feature-Based Folder Structure (Mandatory grouping by feature/domain).
- Stabilized Build: Enabled Webpack for `@sous/cli` to handle monorepo path aliases correctly.
- Verified `sous dev` and `sous logs tail` functionality.
- Implemented `sous test` (runs turbo test) and `sous check` (runs lint, typecheck, test, build).
- Implemented `sous housekeep` to deep clean build artifacts from the monorepo root.
- Verified `@sous/docs` and `@sous/web` load correctly in the development environment.
- Updated `sous dev` plan to include native apps (Native, Headless, KDS, POS) with focus on Android emulator.

## 2026-02-06 (Late Evening Refresh)

- **Ghost Hunting Automation:** Added `sous kill` to `@sous/cli` for rapid termination of lingering processes on application ports.
- **System Bootstrapping:** Implemented and executed system-level seeding for the primary superadmin ("Chef Conar" @ "Dtown Café").
- **Universal SVG Filter Support:** Enhanced `@sous/ui` with a robust web shim for SVG filters (`Filter`, `FeGaussianBlur`, `FeMerge`), enabling high-fidelity rendering of `neon` and `circuit` logo variants in web environments.
- **Web App Stability:** Resolved critical `AuthProvider` undefined error in `@sous/web` by correcting export paths in `@sous/features` and aligning workspace dependencies.
- **Configuration Alignment:** Expanded `brandingConfigSchema` in `@sous/config` to support the full suite of 10 logo variants.
- **Infrastructure:** Standardized on `sous_user`/`sous_password` for local Postgres development.