# ADR 014: POS Strategy (SUPERSEDED)

## Status

Superseded by [ADR 041](./041-web-first-pivot.md) - POS is now a web view.

## Date

2026-02-03 (Superseded 2026-02-07)

## Context

A restaurant's Point of Sale (POS) system is the primary revenue-generating tool. It must be extremely fast, intuitive for staff, and resilient to network instability. It needs to handle complex order configurations (modifiers, splits) and integrate with payment hardware.

**Key Requirements:**

- **Order Entry:** High-speed interface for taking complex orders.
- **Order Management:** Tracking open tabs, modifying active orders, and processing returns/voids.
- **Payment Integration:** Bridging to physical card readers and payment gateways.
- **Hardware Support:** Interacting with cash drawers and receipt printers (via ADR 011).
- **Offline Resilience:** Ability to take orders and queue payments/syncs during internet outages.

## Decision

We will implement **`@sous/native-pos`** as a React Native application wrapped in **Tauri**.

### Key Technology Choices

1.  **Framework: React Native + Tauri**
    - Consistent with the **Universal UI** strategy (ADR 006).
    - Uses the **Native Bridge** (ADR 011) for local peripheral control (printers, cash drawers).

2.  **State Management**
    - Optimized for complex "Cart" logic (modifiers, discounts, taxes).
    - Local state must be synchronized with the backend via the `client-sdk`, but functional independently.

3.  **UI/UX Design**
    - Tablet-first design (optimized for iPad/Android tablets and touch-screen monitors).
    - "Dark Mode" optimized for high-glare restaurant environments.
    - Highly customizable "Grid" layout for menu items.

4.  **Peripheral Integration**
    - Utilizes `@sous/native-bridge` to send ESC/POS commands to receipt printers.
    - Integrates with local payment terminals via SDKs bridged through Rust/Tauri.

### Implementation Strategy

- The app will be housed in `apps/native-pos/`.
- It will heavily utilize `@sous/ui` for high-performance touch components.
- Offline data persistence is mandatory via the `@sous/native-bridge` storage module.

## Consequences

- **Positive:**
  - **Speed:** Tauri's lightweight nature ensures the UI stays responsive even with large menus.
  - **Reliability:** Built-in offline support ensures service never stops.
  - **Unified Ecosystem:** Orders placed on the POS immediately appear on the KDS (@sous/native-kds) via the shared backend/SDK.
- **Negative:**
  - **Complex Logic:** POS state management (taxes, rounding, discounts) is notoriously difficult to maintain and requires extensive unit testing.
  - **Payment Certification:** Direct integration with payment hardware may require platform-specific native modules that add complexity to the bridge.

## Research & Implementation Plan

### Research

- **Cart Logic:** Analyzed common "Tax and Modifiers" data structures to ensure our schema supports complex restaurant orders.
- **ESC/POS:** Researched the protocol for thermal printing to ensure compatibility with most receipt printers.

### Implementation Plan

1. **POS Core:** Implement the "Grid-based" menu navigation and Cart management logic.
2. **Order Lifecycle:** Build the flow for opening, modifying, and finalizing orders.
3. **Receipt Printing:** Use the `native-bridge` to send ESC/POS commands to discovered printers.
4. **Offline Sync:** Implement the queueing logic that saves orders to local storage when the network is down.
