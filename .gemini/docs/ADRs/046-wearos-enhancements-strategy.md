# ADR 046: Wear OS Custom Watch Faces and Advanced Voice Commands

## Status

Proposed

## Date

2026-02-11

## Context

Building upon the initial Wear OS strategy (ADR 030), there is a need to enhance the `@sous/wearos` application with custom watch faces, domain-specific complications, and advanced voice interaction capabilities. The goal is to provide at-a-glance critical metrics and hands-free control for key platform functions, further optimizing workflows for busy professionals.

## Decision

We will extend the `@sous/wearos` application to include highly customizable watch faces with a rich set of platform-specific complications and implement a robust voice command system designed for efficiency and minimal friction.

### 1. Custom Watch Faces

- **Quantity:** Two primary watch face designs will be developed:
  1.  **"Executive" Face:** Clean, minimalist design emphasizing 1-2 critical metrics.
  2.  **"Operator" Face:** Information-dense, allowing for multiple complications and quick-action shortcuts.
- **Branding:** Watch faces will strictly adhere to `@sous` branding guidelines for colors, fonts, and spacing, utilizing the `branding.config.json`.
- **Complications:**
  - **Initial Set:** Daily Sales, Average Ticket Time, Number of Open Orders, Longest Open Order Duration.
  - **Future Considerations:** Inventory Alerts (e.g., low stock for a popular item), Staff Clock-in Status, Delivery Driver Status, HACCP alerts.
- **Data Source:** Complication data will be fetched from the `@sous/api` via the Wearable Data Layer API, ensuring real-time updates and efficient data transfer.

### 2. Advanced Voice Commands

- **Core Functionality:**
  - **Wastage Tracking:** "Track [item] wastage: [amount] [reason]"
  - **Timer Management:** "Set timer for [X minutes] for [task]", "Show timers", "Stop timer [X]".
  - **Order Management:** "Add [item] to order [table/ID]", "Mark [item] as sold out".
  - **Reporting:** "What's my daily sales?", "How many open orders?".
- **"Hey Google" Avoidance (Research & Strategy):**
  - **Primary Approach:** Investigate Wear OS SDK capabilities for custom "hot phrases" or always-on listening for specific app contexts. This likely involves utilizing the `SpeechRecognizer` API with custom `Intent` filters within the app when it is foregrounded.
  - **Secondary Approach (If Primary Fails/Limited):** Rely on Google Assistant "App Actions" and "Shortcuts" (as per ADR 030) but optimize their activation within the `@sous/wearos` UI to reduce the need for explicit "Hey Google" prompts by presenting clear, context-aware voice command options.
  - **Constraint:** Direct "Hey Google" replacement for system-wide commands is generally restricted by Android OS for security and user experience. Focus will be on context-specific voice input when the `@sous/wearos` app is active.

### 3. UI/UX Compliance

- The `@sous/wearos` app will strictly follow the UI themes, colors, spacing, and branding defined in the `branding.config.json` and `@sous/ui` design system. This includes utilizing Compose for Wear OS theming capabilities to ensure consistency.

## Consequences

- **Positive:**
  - Enhanced hands-free interaction for critical tasks.
  - Improved at-a-glance access to business-critical metrics.
  - Deeper integration into daily operational workflows.
  - Increased value proposition of the Wear OS app.
- **Negative:**
  - Increased complexity in Watch Face development and data synchronization.
  - Significant research and development effort for advanced voice command integration, especially for "hot phrase" detection.
  - Potential battery impact if not carefully optimized for real-time updates and always-on listening.

## Research & Implementation Plan

### Research

- Investigate `SpeechRecognizer` API and custom hot word detection on Wear OS.
- Explore best practices for Wear OS complication data providers and battery optimization.

### Implementation Plan

1.  **Watch Face Development:** Design and implement both "Executive" and "Operator" watch faces using Compose for Wear OS.
2.  **Complication Data Providers:** Develop data providers for each defined metric, fetching data via the Wearable Data Layer API.
3.  **Voice Command Module:** Implement the voice command recognition and intent parsing logic within the `@sous/wearos` application.
4.  **UI Theming:** Ensure full compliance with `@sous` branding guidelines for all UI elements.
