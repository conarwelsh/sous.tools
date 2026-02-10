# ADR 013: KDS Strategy (SUPERSEDED)

## Status

Superseded by [ADR 041](./041-web-first-pivot.md) - KDS is now a web view.

## Date

2026-02-03 (Superseded 2026-02-07)

## Context

Kitchen operations require a high-performance, real-time interface for managing order flow and ensuring food safety compliance. Unlike the `@sous/web` dashboard, the KDS is a mission-critical tool designed for touch-screen interaction in high-heat, fast-paced environments.

**Key Requirements:**

- **Real-time Order Flow:** Instant updates and interaction (bumping/clearing) for incoming orders.
- **HACCP Hub:** A centralized view for monitoring live temperature data from BLE thermometers.
- **Incident Logging:** Quick-action interface for recording manual incidents (e.g., equipment failure, safety violations).
- **Platform Integration:** Must consume the platform's core services for authentication, configuration, and data synchronization.

## Decision

We will implement **`@sous/native-kds`** as a React Native application wrapped in **Capacitor**.

### Key Technology Choices

1.  **Framework: React Native + Capacitor**
    - Leverages the **Universal UI** strategy (ADR 006) for shared components.
    - Uses the **Native Bridge** (ADR 011) for low-level system access and BLE gateway functionality.

2.  **Real-time Communication**
    - Uses the `RealtimeClient` from `@sous/client-sdk` (ADR 010) to receive orders and push incident logs.
    - Subscribes to local BLE telemetry streams via the `@sous/native-bridge`.

3.  **UI/UX Design**
    - Optimized for large touch-screen displays.
    - High-contrast visual cues for order aging (e.g., color shifts from Green to Yellow to Red).
    - Large "Action Zones" to ensure ease of use for staff wearing gloves or in high-stress situations.

4.  **Resilience**
    - Utilizes the **Offline Caching** (ADR 011) to ensure the kitchen remains operational and incident logging persists even during internet outages.

### Implementation Strategy

- The app will be housed in `apps/native-kds/`.
- It will depend on `@sous/ui`, `@sous/client-sdk`, `@sous/config`, and `@sous/native-bridge`.

## Consequences

- **Positive:**
  - **Operational Safety:** Centralizing BLE monitoring directly in the KDS ensures staff are immediately aware of temperature violations.
  - **Developer Efficiency:** Shares significant code with `@sous/web` and `@sous/signage`.
  - **Reliability:** Capacitor provides a stable, low-resource wrapper compared to a standard browser.
- **Negative:**
  - **UI Complexity:** Designing for touch-first kitchen environments requires rigorous testing and potentially specialized component variants in `@sous/ui`.

## Research & Implementation Plan

### Research

- **Touch-First UX:** Evaluated "Large Action Zone" patterns used in industry-leading KDS solutions.
- **BLE Integration:** Verified `btleplug` performance for continuous temperature monitoring from multiple sensors.

### Implementation Plan

1. **Real-time Order Feed:** Build the WebSocket listener that receives and manages active order state.
2. **KDS View:** Implement the multi-column order grid with high-contrast aging indicators.
3. **HACCP Hub:** Create the temperature monitoring dashboard using data from the `native-bridge`.
4. **Incident Logger:** Implement the quick-report modal for manual logging (waste, equipment issues).
