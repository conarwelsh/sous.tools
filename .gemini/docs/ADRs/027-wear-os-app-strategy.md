# ADR 030: Wear OS Application Strategy (@sous/wearos)

## Status

Proposed

## Date

2026-02-03

## Context

Chefs and restaurant managers are often mobile and have their hands occupied. A wearable application provides a discreet, hands-free way to receive alerts, manage timers, and perform quick data entry tasks without needing to reach for a phone or tablet.

**Key Requirements:**

- **Ecosystem Integration:** Automatic discovery/installation when `@sous/native` is present on a paired smartphone.
- **Haptic Feedback:** Specialized vibration patterns for critical events (e.g., timer completion, HACCP violations, high-priority order alerts).
- **Cook Mode Sync:** Real-time synchronization of culinary timers started on other devices (Tablet/Phone) to the watch.
- **Voice Commands:** Integration with Google Assistant to perform quick actions (e.g., "Add 50 lbs of flour to the order list").
- **Branded Watch Face:** A custom, theme-colored watch face with "Complications" for at-a-glance reporting (e.g., current food cost, pending orders, or active alerts).
- **Quick Actions:** One-tap interactions for common tasks (e.g., "Bump Order", "Record Waste").

## Decision

We will implement **`@sous/wearos`** as a native Android (Kotlin) application using **Compose for Wear OS** to ensure the best performance and integration with Google Assistant and Watch Face APIs.

### Key Technology Choices

1.  **Framework: Compose for Wear OS**
    - Provides a modern, declarative UI approach optimized for small, circular displays.
    - Deep integration with Android system services (Haptics, Data Layer API).

2.  **Cross-Device Communication: Wearable Data Layer API**
    - Used to synchronize state (like Timers) between the `@sous/native` Android app and the `@sous/wearos` app.
    - Ensures low-latency communication even without a direct internet connection if the phone is nearby.

3.  **Google Assistant Integration**
    - Utilizing **App Actions** and **Shortcuts** to enable voice-activated triggers for platform tasks.

4.  **Watch Face Studio / Watch Face API**
    - Implementing a custom watch face that pulls real-time data from the `client-sdk` via the phone's bridge or directly via Wi-Fi.

### Implementation Strategy

- The app will be housed in `apps/watch/` (internal package name `@sous/wearos`).
- It will utilize a shared "Mobile-Watch Bridge" logic within `@sous/native` to handle the heavy lifting of data synchronization.

## Consequences

- **Positive:**
  - **Hands-Free Operation:** Allows staff to interact with the platform without breaking sanitation protocols or workflow.
  - **High Visibility:** Real-time complications keep managers informed without checking a dashboard.
  - **Platform Value:** Deepening the ecosystem makes the platform more indispensable to the user's workflow.
- **Negative:**
  - **Development Fragmentation:** Requires Kotlin/Native Android expertise, deviating from the "Universal UI" (React Native) strategy used elsewhere.
  - **Battery Management:** Real-time data syncing and haptics must be carefully optimized to avoid draining the watch battery.

## Research & Implementation Plan

### Research

- **Compose for Wear OS:** Verified the components and UI patterns for circular displays.
- **Wearable Data Layer:** Analyzed the sync capabilities between Android phones and watches.

### Implementation Plan

1. **Watch App Core:** Initialize the Wear OS project with Compose and a branded theme.
2. **Haptic Manager:** Implement the specialized vibration patterns for platform alerts.
3. **Timer Sync:** Build the data layer listener for real-time timer synchronization.
4. **Assistant Shortcuts:** Implement the Google Assistant integration for voice-activated tasks.
5. **Watch Face:** Build the theme-colored watch face with custom complications.
