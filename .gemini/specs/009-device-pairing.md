# Spec 009: Device Pairing & Boot Flow

**Status:** Proposed
**Date:** 2026-02-09
**Consumers:** @sous/web (KDS/POS/Signage/Tools flavors)

## Objective

Define a standardized, reusable "Boot & Pair" lifecycle component for all Native/Kiosk applications. This ensures that any device (KDS, POS, Signage) follows the same security and onboarding protocols regardless of its specific function.

## 1. The Finite State Machine (FSM)

The root of every Kiosk application will be governed by a hook/machine with the following states:

1.  **`UNPAIRED`**: Device has no valid identity token.
2.  **`PAIRING`**: Device is generating/displaying a code and polling for confirmation.
3.  **`PAIRED_IDLE`**: Device is authenticated but has no configuration/content assigned.
4.  **`ACTIVE`**: Device is authenticated and has a valid configuration (Screen ID, Station ID).
5.  **`DISCONNECTED`**: Device is authenticated but cannot reach the server (Offline Mode).

## 2. UI/UX by State

### A. UNPAIRED / PAIRING (The "Handshake" Screen)
- **Visuals:** High-contrast brand background. Large, readable 6-character alphanumeric code (e.g., `H7K-9P2`).
- **Instructions:** "Go to Admin > Hardware > Add Device and enter this code."
- **Flavor Identity:** Clearly displays the device role (e.g., "Sous KDS", "Sous Signage") so the admin knows what they are pairing.
- **Logic:**
  - On mount, generates a random `pairingCode`.
  - Emits `device:handshake` socket event with `code`, `hardwareSpecs`, and `appFlavor`.
  - Listens for `device:paired` event containing the `authToken` and `nodeId`.

### B. PAIRED_IDLE (The "Waiting" Screen)
- **Trigger:** Device has `authToken` but the Hardware Domain reports `assignment: null`.
- **Visuals:** "Device Paired successfully. Waiting for assignment..."
- **Action:** A "Refresh" button to manually check for config updates.
- **Logic:**
  - Establishes persistent socket connection using `authToken`.
  - Listens for `config:update` events.

### C. ACTIVE (The Application)
- **Trigger:** Hardware Domain returns a valid configuration (e.g., `screenId` for Signage, `stationId` for POS).
- **Visuals:** Renders the specific application view.
  - **Signage:** Renders the `ScreenRenderer` with the assigned `screenId`.
  - **KDS:** Renders the `OrderGrid` for the assigned `stationId`.
- **Logic:**
  - Maintains heartbeat.
  - If the server sends a `device:unpaired` event (Admin removed device), transition immediately back to `UNPAIRED`.

## 3. Resilience & Auto-Recovery

### Assignment Stealing
- **Scenario:** Admin reassigns a Screen from Device A to Device B.
- **Device A Action:** Receives `config:update` -> `assignment: null`. Transitions to **PAIRED_IDLE**.
- **Device B Action:** Receives `config:update` -> `assignment: { screenId: ... }`. Transitions to **ACTIVE**.

### Reset / Wipe
- **Scenario:** Admin hits "Factory Reset" in Hardware Manager.
- **Action:** Device clears `localStorage` (tokens, config) and transitions to **UNPAIRED** (generates new code).

## 4. Implementation Details

- **Component:** `DeviceBootloader` (Shared Feature).
- **Storage:** Uses `Capacitor Storage` (or `localStorage` fallback) to persist the `authToken`.
- **Socket:** Uses the shared `RealtimeClient`.

## 5. Hardware Domain Integration

When a device connects:
1. It identifies itself (e.g., "I am a KDS on Android 13").
2. The Hardware Domain creates a temporary "Pending Device" record.
3. When Admin enters the code, the record is promoted to "Active Node" and linked to the Organization.
