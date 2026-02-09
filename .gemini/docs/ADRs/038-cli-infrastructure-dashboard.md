# ADR 038: CLI Infrastructure Dashboard Strategy

## Status

Proposed

## Date

2026-02-04

## Context

As a "Free-Tier First" platform, we need constant visibility into our infrastructure usage (row counts, storage limits, API requests) to prevent service interruptions. While we have a SuperAdmin web dashboard, a CLI-native version allows for rapid health checks without leaving the terminal.

## Decision

We will implement an interactive **Infrastructure Dashboard** within `@sous/cli` using **React Ink**.

### 1. Data Ingestion

- **Source:** The dashboard will query the `SuperAdmin` domain of the `@sous/api`.
- **Environment Switching:** The `--env` flag will determine which remote environment's configuration (API URL, API Key) is loaded from `@sous/config` to perform the fetch.
- **Authentication:** Access is restricted via a dedicated `superadmin` API Key.

### 2. Metric Categories

- **Resource Constraints (Critical):** Real-time tracking of Supabase row counts (vs 500k limit), Storage usage (vs 1GB), and Upstash Redis requests.
- **App Health:** Uptime and "Cold Start" status for Vercel/Render services.
- **Operational Data:** BullMQ pending job counts and active IoT/Hardware node heartbeats.

### 3. Visuals & Interaction

- **Engine:** React Ink.
- **Styling:** Use brand colors (defined in `brand-identity.md`) and ANSI animations for "Live" status indicators.
- **Auto-Refresh:** The dashboard will poll the API every 30 seconds to maintain "Live" metrics.

## Consequences

- **Positive:** Immediate visibility into infrastructure bottlenecks; proactive management of free-tier limits; consistent DX between local dev (`sous dev`) and remote monitoring.
- **Negative:** Requires `@sous/api` to be operational to report metrics; adds dependency on `superadmin` endpoints.
