# Spec 009: App Pairing & Device State

**Status:** Proposed
**Date:** 2026-02-09
**Consumers:** KDS App, POS App, Signage App (FullPageOS/Capacitor)

## Objective

Define a reusable, resilient, and secure pairing workflow for all "Node" applications in the `sous.tools` ecosystem. This component ensures devices can easily attach to an Organization, recover from network failures, and handle configuration changes (like screen reassignment) automatically.

## Core Component: `<DevicePairingFlow />`

This component acts as the "Root Gatekeeper" for KDS, POS, and Signage applications. It manages the high-level state of the application.

### State Machine

The component transitions between four primary states:

1.  **UNPAIRED (Pairing Mode)**
    - **Trigger:** Initial boot, LocalStorage cleared, or explicit "Unpair" command from server.
    - **UI:** Shows the Brand Logo, a 6-character alphanumeric **Pairing Code**, and instructions ("Go to sous.tools > Hardware to pair this device").
    - **Behavior:**
      - Generates a transient `pairingCode` on mount.
      - Polls the API (or connects via WebSocket channel `pairing:{code}`) waiting for an Organization to claim it.
      - _Timeout:_ Codes expire every 15 minutes; auto-regenerate if expired.

2.  **PENDING_CONFIG (Paired, No Content)**
    - **Trigger:** Successfully claimed by an Organization, but no specific `Screen` (Signage) or `Station` (KDS/POS) has been assigned yet.
    - **UI:** "Device Paired! Waiting for configuration..." with a "Refresh" button.
    - **Behavior:**
      - Establishes a persistent authenticated WebSocket connection to the Organization's `hardware` room.
      - Listens for `device:update` events.

3.  **ACTIVE (Content Render)**
    - **Trigger:** Device has a valid `deviceId` AND a valid assignment (e.g., `screenId` for Signage, `stationId` for POS).
    - **UI:** Renders the actual application content (e.g., `<ScreenManagerRenderer />` or `<KDSInterface />`).
    - **Behavior:**
      - Injects the configuration data into the child components.
      - Maintains heartbeat with the server.

4.  **DISCONNECTED (Error/Recovery)**
    - **Trigger:** Network loss or WebSocket disconnect.
    - **UI:** A non-intrusive "Reconnecting..." toast/overlay (or full screen if critical data is missing).
    - **Behavior:**
      - Exponential backoff retry strategy.
      - If Auth Token is rejected (401), auto-transition to **UNPAIRED**.

## Logic & Resilience

### 1. Persistence

- **Storage:** `localStorage` (Web) or `SQLite` (Native) stores:
  - `device_id`: The UUID generated upon successful pairing.
  - `device_token`: The long-lived JWT for hardware authentication.
  - `pairing_code`: (Transient)
- **Boot Check:** On app launch, check for `device_token`.
  - If present -> Verify API. If valid -> Go to **ACTIVE/PENDING**.
  - If missing/invalid -> Go to **UNPAIRED**.

### 2. "Steal" & Reassignment Handling

- **Scenario:** A user in Screen Manager assigns "HDMI 1" to a new Screen, "Lunch Menu".
- **Event:** Server emits `device:config_update` to the specific `deviceId`.
- **Action:** The `<DevicePairingFlow />` receives the payload containing the new `screenId`.
- **Reaction:** It immediately updates the internal state, causing the `ACTIVE` view to re-render with the new content (Hot Swap). No reboot required.

### 3. Remote Unpair / Wipe

- **Scenario:** Admin deletes the device from the Hardware Dashboard.
- **Event:** Server emits `device:unpair` or returns 401 on Heartbeat.
- **Action:**
  - Clear `localStorage`.
  - Transition immediately to **UNPAIRED**.
  - Generate new pairing code.

### 4. Flavor Awareness

- The Pairing Screen should visually indicate _what_ flavor of app is running (e.g., "Sous KDS", "Sous POS", "Sous Signage") to help the Admin identify it during the pairing process in the web dashboard.

## Implementation Plan

- **Location:** `@sous/features/hardware/components/DevicePairingFlow.tsx`
- **Dependencies:** `useHardware` hook (from `@sous/features`), `@sous/ui` atoms.
- **Integration:** This component will wrap the main routes in the `FlavorGate` (ADR 042).
