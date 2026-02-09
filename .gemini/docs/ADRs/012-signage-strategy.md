# ADR 012: Signage Strategy (SUPERSEDED)

## Status

Superseded by [ADR 041](./041-web-first-pivot.md) - Signage is now delivered via standard web browsers on RPi.

## Date

2026-02-03 (Superseded 2026-02-07)

## Context

We need a specialized application for dedicated hardware (primarily Raspberry Pi 4B) to serve as the platform's "presentation layer" in physical locations. These devices will drive digital menu boards and serve as local IoT gateways.

**Key Requirements:**

- **Multi-Display:** Support for dual HDMI output on RPi 4B, displaying full-screen signage views on both.
- **Dynamic States:** The app must handle three primary states:
  - **Pairing Mode:** Displaying a pairing code for "Google Home-style" onboarding.
  - **Configuration Mode:** Paired to a tenant but awaiting specific screen assignment.
  - **Active Mode:** Rendering the assigned digital menu/content.
- **Local Discovery:** Scanning the local network (mDNS/UDP) to identify other `@sous` devices, printers, and scanners.
- **Remote Management:** Real-time command execution (reboot, shutdown, display toggling) via a pusher-style (WebSocket) connection.
- **Telemetry:** Reporting hardware health (CPU temp, display status) back to the platform.

## Decision

We will implement **`@sous/signage`** as a React Native application hosted within a **Tauri** wrapper.

### Key Technology Choices

1.  **Framework: React Native + Tauri**
    - Uses the **Universal UI** strategy (ADR 006) to share components with the web and mobile apps.
    - Tauri provides the native bridge (ADR 011) to access RPi hardware APIs (vcgencmd, xrandr, systemd).

2.  **State Management & Routing**
    - A top-level state machine will manage the transition between Pairing, Configuration, and Active modes.
    - **Multi-Window:** Tauri will spawn two distinct webview windows, each pinned to a specific HDMI output/display.

3.  **Communication Layer**
    - **Inbound:** Uses the `RealtimeClient` from `@sous/client-sdk` (ADR 010) to receive pusher-style commands.
    - **Outbound:** Periodically pushes metrics via the SDK.
    - **Local:** Utilizes `@sous/native-bridge` for network scanning and hardware discovery.

4.  **Hardware Target: Raspberry Pi 4B**
    - Optimization for 2x 1080p or 4k outputs.
    - Implementation of "Kiosk Mode" to disable OS-level interactions (cursor, taskbars, screensavers).

### Onboarding Workflow (Pairing)

1. Device boots and checks for a stored `pairingToken` in `@sous/config`.
2. If missing, it generates a short code and displays it via the **Pairing View**.
3. User enters the code in `@sous/web` or `@sous/mobile`.
4. API validates and pushes the `organizationId` and `locationId` to the device.
5. Device transitions to **Configuration Mode**.

## Consequences

- **Positive:**
  - **Unified UI:** Digital menus use the same design system and components as the web app.
  - **Robustness:** Rust/Tauri ensures the application is performant and has stable access to system-level commands.
  - **Scalability:** The pairing method allows non-technical staff to deploy new hardware easily.
- **Negative:**
  - **Linux/ARM Specifics:** Hardware control (like HDMI power) requires RPi-specific CLI tool interaction which must be carefully abstracted in the bridge.
  - **Resource Consumption:** Running two webviews on an RPi 4B requires careful memory management and optimization.
