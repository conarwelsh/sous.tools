# Spec 023: Wear OS Custom Watch Faces and Voice Features

**Status:** Proposed
**Date:** 2026-02-11
**Consumers:** @sous/wearos

## Objective

To define the technical implementation details for custom watch faces, platform-specific complications, and advanced voice command capabilities within the `@sous/wearos` application, ensuring a seamless, hands-free, and branded user experience.

## Watch Faces

Two primary custom watch faces will be developed:

### 1. "Executive" Watch Face

- **Layout:** Minimalist, digital time display with one primary complication slot (e.g., Daily Sales) and one secondary (e.g., Avg Ticket Time).
- **Style:** Understated, professional, adhering to `@sous` brand typography and color palette.
- **Complication Slots:**
  - **PRIMARY_LARGE_IMAGE:** (e.g., Sous Logo, current status icon)
  - **RANGED_VALUE:** (Daily Sales - current vs. target)
  - **SHORT_TEXT:** (Avg Ticket Time)

### 2. "Operator" Watch Face

- **Layout:** Information-dense, allowing for multiple complications arranged around the watch face. May include quick-action tappable zones.
- **Style:** Functional, clear, and action-oriented, using `@sous` branding with emphasis on readability.
- **Complication Slots:**
  - **RINGED_PERCENTAGE:** (e.g., Order Fulfillment Progress)
  - **LONG_TEXT:** (e.g., Longest Open Order, Inventory Alert)
  - **SMALL_IMAGE:** (e.g., status indicators)
  - **SHORT_TEXT:** (Multiple slots for various metrics)
  - **TAP_ACTION:** Customizable tap zones for quick actions like "Track Waste".

## Complication Data Points

All complication data will be sourced from the `@sous/api` and relayed to the watch via the Wearable Data Layer API. Each complication will have a dedicated `ComplicationDataSourceService` in the Wear OS app.

### Initial Complications:

- **Daily Sales:**
  - Type: `RANGED_VALUE` or `SHORT_TEXT`.
  - Value: Current sales for the day, possibly as a percentage of a target.
  - Data Path: `api/metrics/daily-sales`
- **Average Ticket Time:**
  - Type: `SHORT_TEXT`.
  - Value: Average time from order placement to completion.
  - Data Path: `api/metrics/avg-ticket-time`
- **Number of Open Orders:**
  - Type: `SHORT_TEXT`.
  - Value: Count of currently open orders.
  - Data Path: `api/metrics/open-orders-count`
- **Longest Open Order Duration:**
  - Type: `LONG_TEXT` or `SHORT_TEXT`.
  - Value: Time elapsed for the oldest open order.
  - Data Path: `api/metrics/longest-open-order`

### Future Complications (Considerations for later phases):

- **Inventory Alerts:** Low stock warning for configurable items.
- **Staff Clock-in Status:** Number of staff clocked in vs. scheduled.
- **Delivery Driver Status:** Number of active drivers, average delivery time.
- **HACCP Alerts:** Temperature deviations, critical timer expirations.

## Voice Commands

The voice command system will focus on context-aware, in-app interactions.

### 1. "Hot Phrase" Detection (High Priority Research)

- **Mechanism:** Utilize Android's `SpeechRecognizer` API with custom `RecognitionListener` to detect specific phrases (e.g., "Sous Watch", "Chef Mode") when the `@sous/wearos` app is active and foregrounded.
- **Goal:** Enable quick voice actions without requiring "Hey Google" by listening for application-specific triggers.
- **Limitations:** This is not a system-wide "hotword" replacement and will only function reliably when the app is prominently displayed. Power consumption will be a major optimization concern.

### 2. Command Set

- **Wastage Tracking:**
  - "Track [item name] wastage [amount] [unit] because [reason]" (e.g., "Track potato wastage 5 pounds because dropped")
  - API Endpoint: `POST /api/inventory/waste`
- **Timer Management:**
  - "Set timer for [X minutes/hours] [optional: for task name]" (e.g., "Set timer for 30 minutes for pasta")
  - "Show timers"
  - "Stop timer [timer name/number]"
  - API Endpoint: (Local watch management, potentially sync to API for persistence)
- **Order Management:**
  - "Add [item name] to order [table number/order ID]" (e.g., "Add steak to order 7")
  - "Mark [item name] as sold out" (e.g., "Mark salmon as sold out")
  - API Endpoint: `POST /api/orders/{orderId}/item` (for add), `PUT /api/inventory/{itemId}/status` (for sold out)
- **Reporting/Query:**
  - "What's my daily sales?"
  - "How many open orders?"
  - API Endpoint: `GET /api/metrics/daily-sales`, `GET /api/metrics/open-orders-count`

### 3. Voice UI Feedback

- Visual confirmation (e.g., "Listening...", "Command recognized: Set timer for 30 minutes")
- Haptic feedback on successful command execution.

## UI/UX Compliance

- **Branding:** Adherence to `branding.config.json` for all colors, typography (e.g., `Outfit`, `Inter`), and logo usage.
- **Styling:** Utilize Compose for Wear OS theming to enforce consistent padding, margins, and component styling according to `@sous/ui` guidelines.
- **Responsive Layouts:** All watch face and in-app layouts must gracefully adapt to various screen shapes (circular/square) and sizes, ensuring optimal readability and touch target sizes.
- **Accessibility:** Ensure sufficient color contrast and scalable text sizes.

## Implementation Plan

1.  **Watch Face Composables:** Develop reusable `Composable` functions for watch face elements (time display, complication containers, background).
2.  **Complication Data Provider Integration:** Create `ComplicationDataSourceService` for each metric, handling data fetching from the API and updates.
3.  **Voice Recognition Service:** Implement a foreground service for `SpeechRecognizer` to handle "hot phrase" and command parsing.
4.  **Intent Handling:** Map recognized voice commands to specific actions and API calls.
5.  **Theming:** Integrate `@sous` brand assets and theme into the Wear OS Compose project.
6.  **Battery Optimization:** Profile and optimize all real-time data fetches and voice listening processes.
