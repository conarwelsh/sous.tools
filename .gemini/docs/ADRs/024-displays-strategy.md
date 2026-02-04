# ADR 024: Displays Domain Strategy

## Status
Proposed

## Date
2026-02-03

## Context
After designing a layout via the `LayoutManager` (ADR 023), we need a way to assign that content to physical hardware or web-accessible endpoints. The **Displays Domain** acts as the orchestration layer that maps "What to show" to "Where to show it."

**Key Requirements:**
- **Display Assignment:** Creating a `Display` entity that links a `LayoutTemplate` to a target.
- **Multi-Target Support:**
    - **Web Output:** A direct, authenticated URL hosted by `@sous/web` suitable for any browser-enabled device (Smart TVs, tablets, PCs).
    - **Hardware Output:** Targeted assignment to a specific HDMI port on a paired Raspberry Pi node (managed by `@sous/native-headless`).
- **Real-time Orchestration:** Using the real-time gateway (ADR 010) to notify hardware nodes when their assigned layout has changed or needs to be refreshed.
- **Status Monitoring:** Tracking whether a display is currently "Live" and what content it is rendering.

## Decision
We will implement the **Displays Domain** to manage the lifecycle and routing of visual content.

### Domain Responsibilities & Logic

1.  **Display Registry**
    - Managing `Display` entities which serve as the "logical" screen.
    - Each `Display` belongs to a `Location` and is assigned exactly one `LayoutTemplate`.

2.  **Hardware Mapping**
    - Interfacing with the `Hardware Domain` (ADR 017) to provide a list of available HDMI ports on paired nodes.
    - When a `Display` is assigned to a `HardwareNodePort`, the domain triggers a WebSocket command to the corresponding `@sous/native-headless` instance to begin rendering.

3.  **Web Rendering Endpoint**
    - Exposing a standard route in `@sous/web` (e.g., `/display/:displayId`) that renders the assigned layout in a full-screen, kiosk-optimized view.

4.  **State Synchronization**
    - Ensuring that if a `LayoutTemplate` is edited and saved, all `Displays` using that template are notified to hot-reload their content without a full device reboot.

### Data Relationships
- **Layout Manager:** Provides the templates to be displayed.
- **Hardware Domain:** Provides the physical targets (RPi ports).
- **Headless App:** The primary consumer of hardware-assigned displays.

## Consequences
- **Positive:**
    - **Hardware Agnostic:** A menu can be moved from a web-based smart TV to a dedicated RPi node with a single click.
    - **Centralized Control:** Managers can see exactly what is playing on every screen in their organization from the `Admin` dashboard.
    - **Rapid Deployment:** New screens can be added to the system via URL before the dedicated hardware even arrives.
- **Negative:**
    - **Dependency Chain:** A failure in the Real-time Gateway or Layout Manager can prevent displays from updating or rendering correctly.

## Research & Implementation Plan

### Research
- **Web Kiosk Mode:** Researched browser flags and fullscreen APIs for reliable web-based displays.
- **Real-time Synchronization:** Verified Socket.io performance for high-frequency content updates.

### Implementation Plan
1. **Display Registry:** Build the management module for Logical Displays and their assignments.
2. **Hardware Orchestrator:** Implement the logic that maps displays to RPi HDMI ports.
3. **Web Renderer:** Build the authenticated full-screen viewing route in `@sous/web`.
4. **Live Monitoring:** Implement the real-time status tracking for active displays.
