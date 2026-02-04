# ADR 007: Deployment & Environment Strategy

## Status
Proposed

## Date
2026-02-03

## Context
We need a clear path from local development to production deployment for the `sous.tools` platform.
- **Domains:**
  - Production: `https://sous.tools`
  - Staging: `https://staging.sous.tools`
- **Infrastructure:** We are utilizing a mix of cloud providers (Vercel, Render, Supabase, Redis Cloud/Upstash) to leverage their specific strengths.
- **Visual Safety:** Developers and QA must immediately know which environment they are using to prevent data accidents.

## Decision

### 1. Development Environment (Local)
- **Goal:** Fast feedback loop, complete local replication of the stack.
- **Orchestration:** Managed via `@sous/cli` (command: `sous dev`).
- **Core Stack:**
  - **Docker Compose:** Runs infrastructure services (DBs, Redis) and backend services.
  - **TurboRepo:** Handles building and serving Node.js apps (`@sous/web`, `@sous/api`) with HMR.
- **Networking:** Utilization of Docker networking to ensure seamless communication between containers and host.
- **Startup Strategy:**
  - **Default:** Starts `@sous/api` and `@sous/web`.
  - **Opt-in:** Native apps (iOS/Android) and auxiliary services are only started if explicitly requested to save resources.

### 2. Staging Environment
- **Domain:** `https://staging.sous.tools`
- **Hosting:**
  - **Frontend:** Vercel (`@sous/web`).
  - **Backend:** Render.com (`@sous/api`).
  - **Database:** Supabase.
  - **Cache:** Redis Cloud.
- **CI/CD:**
  - **Runner:** A local **GitHub Self-Hosted Runner** will be used for heavy build tasks (e.g., native app compilation, AppImage generation). This runner will be defined in our `docker-compose.yml`.
  - **Release Candidates:** Full native app builds occur here.

### 3. Production Environment
- **Domain:** `https://sous.tools`
- **Hosting:**
  - **Frontend:** Vercel.
  - **Backend:** Render.com.
  - **Database:** Supabase.
  - **Cache:** Upstash (Serverless Redis).

### 4. Visual Environment Indicators (MANDATE)
To prevent confusion, **App Icons** must change color based on the active environment.
- **Development:** **Success Color** (Green)
- **Staging:** **Warning Color** (Yellow/Orange)
- **Production:** **Brand/Primary Color** (Blue/Theme Default)

*This applies to all applications (Web Favicons, Mobile App Icons, Desktop Tray Icons).*

## Consequences
- **Positive:**
  - **Safety:** Impossible to mistake Production for Staging due to color coding.
  - **Cost/Performance:** Using specialized providers (Upstash for Prod serverless, Redis Cloud for Staging) optimizes for the specific needs of each environment.
  - **Control:** Self-hosted runners allow unlimited build minutes for complex native compilations.
- **Negative:**
  - **Complexity:** managing credentials across different providers (Redis Cloud vs Upstash) requires careful config management via `@sous/config` and Infisical.

## Research & Implementation Plan

### Research
- **Vercel/Render/Supabase:** Selected for their best-in-class DX and generous free tiers.
- **GitHub Self-Hosted Runners:** Evaluated as the cost-effective solution for heavy ARM64/Native builds that exceed free CI limits.

### Implementation Plan
1. **Infrastructure as Code:** Document the manual setup of each service until we scale to needing Terraform/Pulumi.
2. **Environment Synchronization:** Use the Infisical CLI to sync secrets between Vercel, Render, and Supabase.
3. **CI/CD Workflows:** Create GitHub Actions for:
    - Web/API deployment (Vercel/Render).
    - Native build artifact generation (Android/iOS/AppImage).
4. **Branding Assets:** Create a script in `@sous/ui` that generates environment-specific icons/colors for all apps.
