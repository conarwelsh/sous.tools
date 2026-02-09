# ADR 027: Third-Party Integrations Strategy

## Status

Proposed

## Date

2026-02-03

## Context

The `sous.tools` platform must interact with external ecosystems to simplify data ingestion (e.g., Google Drive for Recipes) and bridge with existing operational tools (e.g., Square/Toast for POS data). We need a scalable way to manage these integrations without coupling our core logic to any specific third-party API.

**Key Requirements:**

- **OAuth & Credential Management:** Securely storing and refreshing tokens for multiple providers per tenant.
- **Provider-Agnostic Interface:** Defining "Clean Interfaces" for common integration types (e.g., `POSProvider`, `StorageProvider`).
- **Driver-Based Architecture:** Allowing the system to dynamically select the correct implementation (Square, Toast, Lightspeed) based on the tenant's configuration.
- **Background Sync:** Reliable, scheduled synchronization of data (e.g., pulling yesterday's sales or scanning new files in a Drive folder).

## Decision

We will implement an **Integrations Domain** based on the **Adapter/Driver Pattern**.

### Architectural Components

1.  **Integration Registry**
    - Managing the `IntegrationConfiguration` entity, which stores the provider type (e.g., `SQUARE`), encrypted credentials, and sync settings for a tenant.

2.  **Clean Interfaces (Abstractions)**
    - **`POSIntegration`**: Methods like `fetchSales()`, `fetchCatalog()`, `onOrderCreated()`.
    - **`StorageIntegration`**: Methods like `listFiles()`, `fetchFile()`, `watchFolder()`.

3.  **Driver Implementations**
    - Concrete classes (e.g., `SquareDriver`, `ToastDriver`, `GoogleDriveDriver`) that translate the platform's clean interface calls into provider-specific API requests.

4.  **The "Integration Factory"**
    - A service that resolves the correct driver at runtime based on the stored tenant configuration.
    ```typescript
    const pos = integrationFactory.getPOSDriver(tenantId);
    const sales = await pos.fetchSales(dateRange);
    ```

### Integration Workflow

1.  **Connection:** User initiates "Connect to [Provider]" via `@sous/web`.
2.  **Authorization:** Platform handles OAuth callback and stores the encrypted `accessToken`/`refreshToken`.
3.  **Discovery:** Platform queries the provider to map external entities (e.g., Square Locations) to `sous.tools` Locations.
4.  **Synchronization:** Background workers (BullMQ - ADR 010) use the appropriate Driver to sync data periodically.

## Consequences

- **Positive:**
  - **Scalability:** Adding a new POS (e.g., Lightspeed) only requires writing a new Driver, not modifying the Accounting or POS domains.
  - **Reliability:** Core domains interact with a stable, typed interface regardless of which third-party tool the tenant uses.
  - **Consistency:** Users have a unified "Connections" dashboard in the Admin domain.
- **Negative:**
  - **Feature Parity:** Third-party APIs differ significantly; our "Clean Interface" must find the common denominator or handle optional features gracefully.
  - **Credential Security:** Storing third-party tokens increases the platform's security surface area, requiring robust encryption (via `@sous/config` and Infisical).

## Research & Implementation Plan

### Research

- **OAuth Flows:** Analyzed the OAuth2 implementations for Google, Square, and Toast to ensure a unified callback strategy.
- **Adapter Patterns:** Verified the efficiency of the Driver/Adapter pattern for supporting heterogeneous APIs.

### Implementation Plan

1. **Integrations Registry:** Build the encrypted storage and management system for provider credentials.
2. **OAuth Gateway:** Implement the unified OAuth callback and token refresh logic.
3. **Driver Suite:** Build the initial drivers for Google Drive, Square, and Toast.
4. **Sync Orchestrator:** Implement the background worker system for scheduled data synchronization.
