# ADR 011: Native Bridge Strategy (SUPERSEDED)

## Status

Superseded by [ADR 041](./041-web-first-pivot.md) - Native interop is now handled via **Capacitor Plugins** instead of a Capacitor bridge.

## Date

2026-02-03 (Superseded 2026-02-07)

## Context

Our ecosystem includes multiple desktop and kiosk applications built with **Capacitor** (e.g., `@sous/signage` for kiosks). These applications share a common set of requirements for low-level system access, hardware interaction, and network operations that are best handled in **Native** for performance and safety.

We need a centralized way to manage:

- **Hardware Discovery:** Scanning the local network for printers, TVs, and IoT gateways.
- **Hardware Communication:** Sending and receiving commands to various peripherals.
- **BLE Gateway:** Acting as a bridge for Bluetooth Low Energy devices (e.g., thermometers).
- **System Metrics:** Collecting host-level performance and health data.
- **Offline Reliability:** Providing a local persistent cache for critical platform data to ensure operation during network outages.
- **Unified Integration:** Ensuring these native capabilities are coupled with our standard configuration and API communication layers.

## Decision

We will create a specialized package, **`@sous/native-bridge`**, to serve as the shared core for all Capacitor-based applications.

### Key Components

1.  **Shared Native Core:**
    - A library crate containing common Capacitor commands and logic.
    - Modules for:
      - `metrics`: Host health and performance monitoring.
      - `network`: Network scanning (mDNS, SSDP, or custom UDP/TCP scanning).
      - `ble`: BLE gateway functionality for interacting with nearby IoT devices.
      - `storage`: Local SQLite-backed persistent cache for offline capabilities.
      - `peripherals`: Drivers/protocols for printers (ESC/POS) and TV control.

2.  **Exposed SDKs:**
    - The bridge will act as a "fat" client for native apps by re-exporting or encapsulating:
      - **`@sous/config`**: To ensure native apps respect global environment settings.
      - **`@sous/client-sdk`**: To provide typed API access for reporting hardware status or receiving remote commands.

3.  **Cross-Platform Abstraction:**
    - While primarily targeting Linux (Raspberry Pi), the bridge should maintain compatibility with macOS/Windows where possible to support developer workflows.

### Implementation Strategy

- Use **Capacitor Plugins** where appropriate to modularize features (e.g., a "Metrics Plugin").
- Expose typed TypeScript bindings for all Native commands to ensure end-to-end type safety.
- The bridge will be a package within the `packages/` directory of the monorepo.

### 4. Safety Mode (Local SQLite Fallback)

As the POS and KDS are mission-critical, the bridge will implement a **Safety Mode**:

- **Persistence:** When the device is offline, incoming orders (POS) and telemetry (KDS) are saved to a local SQLite database (`rusqlite`).
- **Sync Orchestrator:** A background thread in the bridge periodically attempts to "Flush" these local records to the `@sous/api` once connectivity is restored.
- **Conflict Resolution:** The API will implement a "Last-Write-Wins" or "Idempotent Upsert" strategy for these delayed records.

## Consequences

- **Positive:**
  - **Code Reuse:** Logic for complex hardware protocols is written once in Native and shared across all native apps.
  - **Consistency:** All native apps report metrics and discover hardware using the same battle-tested code.
  - **Simplified DX:** Application developers don't need to write Native; they consume the bridge via TypeScript.
- **Negative:**
  - **Build Complexity:** Compiling Native-based packages adds overhead to the CI/CD pipeline and requires the host to have the Android SDK installed.
  - **Tight Coupling:** Changes to the bridge may require simultaneous updates and testing across multiple native applications.

## Research & Implementation Plan

### Research

- **Capacitor 2.0:** Selected for its improved plugin system and native mobile support (if needed later).
- **Native Crates:** Identified `btleplug` for BLE, `mdns-sd` for discovery, and `sysinfo` for metrics.

### Implementation Plan

1. **Bridge Skeleton:** Create the `@sous/native-bridge` package as a Capacitor plugin.
2. **Metrics Module:** Implement Native commands to fetch CPU temperature, memory usage, and display status.
3. **Network Module:** Implement mDNS discovery for local network scanning.
4. **Storage Module:** Integrate `rusqlite` for local persistent caching of platform data.
5. **TS Bindings:** Generate TypeScript types for all Native commands to ensure type safety in the consuming apps.
