# Features

## Initial Setup

- **Monorepo Structure**: TurboRepo with pnpm workspaces.
- **Web-First Architecture**: Standard Next.js + Shadcn UI + Tailwind.
- **Apps**:
  - `@sous/web`: Next.js Universal Web App / PWA / Mobile (via Capacitor).
  - `@sous/api`: NestJS application using **Drizzle ORM**.
  - `@sous/cli`: NestJS CLI tool.
  - `@sous/docs`: Centralized documentation hub and design lab.
  - `@sous/wearos`: Native Wear OS app for hands-free operations.
- **Wear OS Enhancements (Spec 023):**
  - **Custom Watch Faces**: "Executive" and "Operator" designs with customizable complication slots.
  - **Platform Complications**: At-a-glance metrics for Daily Sales, Avg Ticket Time, Open Orders, Longest Open Order.
  - **Advanced Voice Commands**: Hands-free control for wastage tracking, timer management, order item addition, and marking items as sold out.
- **Packages**:
  - `@sous/client-sdk`: Generated client-server SDK.
  - `@sous/config`: Centralized configuration (Infisical + Zod).
  - `@sous/logger`: Centralized logging (Pino).
  - `@sous/ui`: Standard React UI component library (Shadcn pattern).
  - `@sous/features`: Shared business logic and "Organisms".
- **Shared Ingestion Engine (Spec 013)**:
  - **Gemini AI Integration**: Uses Google Gemini 1.5 Flash for high-accuracy extraction of recipe data from unstructured documents.
  - **Interactive Drive Picker**: Browse and select specific files/folders from Google Drive for ingestion.
  - **Multi-Format Support**: Automated processing of PDFs, Images (JPG/PNG/HEIC), and native Google Docs.
  - **AI Recipe Extraction**: Automatically extract recipe names, yields, and ingredient lists into structured database records.
  - **Smart Mapping**: Fuzzy-matching and automated creation of catalog items for extracted ingredients.
- **Mobile Background Update System (Spec 023)**:
  - **Autonomous Discovery**: Periodically checks Supabase-hosted `manifest.json` for new builds.
  - **Scheduled Updates**: Allows users to schedule installations outside of business hours.
  - **Background Download**: Downloads APK artifacts in the background via Capacitor plugins.
- **Presentation Engine (Spec 006/007)**:
  - **Unified Layout Architecture**: Single polymorphic engine for Digital Signage, Web Pages, and Thermal Labels.
  - **Polymorphic Designer**: Recursive, visual editor for both structural blueprints (Templates) and live data-bound instances.
  - **Contextual Binding**: Data-binding interface for mapping POS Catalog and Media assets to specific slots within a layout.
  - **Type-Specific Config**: Support for web slugs, custom dimensions (mm/in), and refresh intervals per layout type.
  - **Real-time Synchronization**: Zero-refresh updates pushed to hardware displays via Socket.io.
  - **Multi-Output Support**: Assign layouts to physical HDMI ports or unique web slugs.
- **Support & Feedback System (Spec 022)**:
  - **Multi-Channel Delivery**: Automated report routing to GitHub Issues and configured Support Email.
  - **Contextual Enrichment**: Automatic capture of app version, user ID, organization, and device metadata.
  - **SuperAdmin Configuration**: Dynamic management of support destinations via global platform settings.
- **Pricing & Plans (ADR 048 / Spec 024)**:
  - **Tiered Access**: Standard plans (Commis, Chef de Partie, Executive Chef) with hierarchical feature sets.
  - **Granular Scopes**: Fine-grained control over specific module access using shared constants.
  - **Usage Limits**: Numerical caps on resources (e.g., max recipes, monthly invoice processing).
  - **Grace Periods**: Configurable window for payment recovery before service suspension.
  - **Custom Overrides**: Capability to define bespoke plans for specific organizations.
  - **Performance**: Redis-backed caching of effective scopes and limits.

## CLI Capabilities (@sous/cli)

- **Development**: `sous dev` (Interactive Ink TUI), `sous install`.
- **Configuration**: `sous env config`, `sous env branding`.
- **Logging**: `sous env logs` (Centralized log tailing).
- **Maintenance**: `sous maintenance housekeep` (Build artifact cleanup).

## Deployment Targets

| Platform            | Strategy                          | Status          |
| :------------------ | :-------------------------------- | :-------------- |
| **Web / Admin**     | Vercel (Next.js)                  | ✅ Stable       |
| **Android / iOS**   | Capacitor Shell (Flavor: tools)   | ✅ Stable       |
| **KDS / POS**       | Capacitor Shell (Flavor: kds/pos) | ✅ Stable       |
| **Signage Node**    | Android OS (Flavor: signage)      | ✅ Stable       |
| **Signage Simulator** | Redroid (Docker)                | ✅ Stable       |
| **Wear OS**         | Native Android (Kotlin/Compose)   | ✅ Functional  |
| **Dev Bridge**      | WSL-Windows Health Recovery       | ✅ Stable       |
| **Backend**         | Render (NestJS)                   | ✅ Stable       |

## Infrastructure & Domains

- **Database**: Postgres 16 with Row-Level Security (RLS).
- **Real-time**: Socket.io for instant updates.
- **Hardware Simulation**: Dockerized Android OS (Redroid) for signage verification.
- **Unified Tag Engine (Spec 017)**: Polymorphic tagging system with organization-level isolation and color-coding for any UUID-based entity.
- **Domains**: IAM, Procurement, Culinary, Intelligence, Accounting, Presentation, Hardware, Integrations.
  - **Integrations**: Robust OAuth handling for Square and Google Drive with automatic token refresh and detailed error reporting.
