# Spec 004: CLI Infrastructure Dashboard (Ink TUI)
**Status:** Completed
**Date:** 2026-02-04
**Reference:** sous dev (INFRA tab)

## Objective
Implement the `sous env dashboard` command using **React Ink**. This command provides a real-time, colorful, and animated summary of platform health and infrastructure limits.

## Features
- **Real-time Metrics:** Animated gauges or progress bars for resource usage.
- **Environment Aware:** Supports `--env=[dev|staging|prod]`.
- **Free-Tier Watcher:** Explicit warnings when approaching service limits (e.g., 80% row usage).
- **Service Status:** "Ping" check for API, Web, and Docs endpoints.

## CLI Structure
- **Command:** `sous env dashboard`
- **Options:** 
    - `-e, --env <environment>`: Target environment (default: `development`).
    - `-i, --interval <seconds>`: Refresh rate (default: `30`).

## UI Components (Ink)
- `<SummaryHeader />`: Logo and environment name in large text.
- `<LimitGrid />`: A 2x2 grid showing Row Count, Storage, Redis Requests, and Email Credits.
- `<ServiceStatusList />`: Vertical list of apps with "Live" vs "Down" blinking indicators.
- `<AlertFooter />`: Scrolling ticker for recent system alerts or HACCP violations.

## Implementation Plan

### Step 1: API Foundation
- Ensure `@sous/api` has an authenticated `GET /superadmin/metrics` endpoint that aggregates data from all domains.

### Step 2: CLI Fetcher
- Implement `src/commands/env/metrics-client.ts` using `axios` or `fetch` to securely pull metrics from the target environment.

### Step 3: TUI Implementation
- Build the dashboard layout in `src/commands/env/ui/dashboard.tsx` using Ink and `ink-spinner`.

### Step 4: Integration
- Add the `DashboardCommand` to the `EnvCommand` sub-commands list in `@sous/cli`.

## Free-Tier Considerations
- Use efficient polling to ensure the dashboard itself doesn't consume excessive API request credits.
