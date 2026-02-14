# Spec 021: All-Encompassing CLI Utility (Command Expansion)

## Status: Completed

## Strategic Umbrella: Tooling & DX

## 1. Objective

Expand `@sous/cli` beyond development and infrastructure into a comprehensive operational tool. The CLI should be the single entry point for managing hardware, integrations, organizational context, and domain-driven scaffolding.

## 2. New Command Groups

### 2.1 Hardware Management (`sous hardware`)

Bridges the terminal with physical nodes (RPi, KDS, POS).

- `list`: Show all paired devices in the active Organization.
- `status <id>`: Fetch real-time telemetry (CPU, Temp, App Flavor) for a node.
- `logs <id>`: Tail logs from a remote device via an automated SSH/Socket bridge.
- `reboot <id>`: Issue a remote reboot command to a specific display or node.
- `pair`: Generate a transient pairing code for the CLI itself or a local virtual node.

### 2.2 Third-Party Integrations (`sous integrations`)

Manage connectors without opening the web dashboard.

- `list`: Show connected providers (Square, Toast, Google Drive) and their sync status.
- `sync <provider>`: Manually trigger a data synchronization job (e.g., Pull Square Catalog).
- `test <provider>`: Verify API connectivity and credential validity.

### 2.3 Global Context (`sous context`)

Switch the CLI's target and view current identity.

- `whoami`: Display current user, active Organization ID, and target Environment (Dev/Staging/Prod).
- `switch-org <id>`: Set the default organization for all subsequent data-scoped commands.
- `switch-env <env>`: Switch the active config target (Local, Staging, or Production).

### 2.4 Culinary Intelligence (`sous intel`)

Fetch business reports directly in the terminal.

- `cost <recipe-id>`: Output a detailed cost breakdown and margin analysis for a recipe.
- `price-trends`: Summary of ingredient price volatility across all vendors.
- `ingest <path>`: Upload a local file (PDF/JPG) to the AI ingestion engine for processing.

### 2.5 Scaffolding & DX (`sous generate`)

Maintain monorepo standards through automated generation.

- `domain <name>`: Create a new strategic umbrella module in `@sous/api` and `@sous/features`.
- `tactical <domain> <name>`: Scaffold a new tactical feature (schema, service, controller) within a domain.
- `ui <name>`: Scaffold a new component in `@sous/ui` following the Shadcn/Radix pattern.

## 3. Implementation Mandates

- **Headless First**: Every new command MUST support a `--json` flag for AI agent consumption.
- **Confirmation**: Destructive operational commands (like remote reboot) in `production` require explicit confirmation.
- **Consistency**: Use brand colors and the standard "Chef" prompt prefix for all output.

## 4. Implementation Plan

1.  **Phase 1**: Implement `sous context whoami` and `sous env dashboard` (Completing Spec 004).
2.  **Phase 2**: Implement `sous hardware list` using the generated `client-sdk`.
3.  **Phase 3**: Re-implement `generate` commands using modern templates.
