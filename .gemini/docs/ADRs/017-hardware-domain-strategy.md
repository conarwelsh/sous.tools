# ADR 017: Hardware Domain Strategy

## Status

Proposed

## Date

2026-02-03

## Context

As a platform that bridges software and physical environments (`sous.tools`), managing hardware assets is as critical as managing culinary data. We need a centralized domain to track, configure, and control all physical devices associated with a tenant.

**Managed Assets Include:**

- **Platform Nodes:** Instances of `@sous/signage`, `@sous/native-kds`, `@sous/native-pos`, and `@sous/native`.
- **Peripherals:** Discovered and paired devices such as BLE thermometers, receipt printers, and scanners.
- **Infrastructure:** Gateways and host machines (e.g., Raspberry Pis).

## Decision

We will establish a dedicated **Hardware Domain** within the `@sous/api` and expose its management capabilities through the `@sous/web` and `@sous/native` primary applications.

### Domain Responsibilities

1.  **Device Registry & Identity**
    - Managing the lifecycle of a device from "Discovered" to "Paired" to "Active".
    - Storing metadata: MAC addresses, IP addresses, firmware/app versions, and hardware specifications.

2.  **Configuration & State Management**
    - **Remote Config:** Pushing settings (e.g., screen assignments for `@sous/signage`, printer defaults).
    - **State Monitoring:** Real-time visibility into device health (Online/Offline status, CPU temp, connectivity).

3.  **Command & Control**
    - Providing the interface for "Pusher-style" remote commands (Reboot, Shutdown, Toggle Displays).
    - Managing the "Pairing Workflow" (generating and validating pairing codes).

4.  **Hardware Topology**
    - Mapping devices to specific **Locations** within an **Organization** (ADR 005).
    - Grouping peripherals under specific Host Nodes (e.g., "Printer A is connected to POS Terminal 1").

### Integration Layer

- **API:** NestJS Hardware Module containing controllers for device management and services for interacting with the Real-time Gateway (ADR 010).
- **SDK:** The `@sous/client-sdk` will include typed methods for querying device status and sending commands.
- **Hardware Bridge:** Leverages `@sous/native-bridge` (ADR 011) on host nodes to report telemetry and scan for local peripherals.

## Consequences

- **Positive:**
  - **Unified Visibility:** Owners can see the health of their entire physical operation from a single dashboard.
  - **Remote Maintenance:** Reduces the need for on-site technical intervention through remote command support.
  - **Scalability:** Standardized hardware management makes it easy to add support for new device types (e.g., smart ovens, digital scales) in the future.
- **Negative:**
  - **Security Risk:** Centralized control of physical hardware (like shutting down a POS) requires extremely rigorous authorization and audit logging.
  - **Complexity:** Maintaining a real-time state of hundreds of distributed hardware nodes introduces significant overhead on the WebSocket/Message Bus layer.

## Research & Implementation Plan

### Research

- **Hardware Metadata:** Researched common IoT device schemas to ensure our `Device` entity is flexible.
- **Pairing Workflows:** Evaluated Bluetooth and local network pairing patterns for ease of use.

### Implementation Plan

1. **Hardware Module:** Build the NestJS module for device registration and state tracking.
2. **Telemetry Processor:** Implement the worker that ingests and aggregates health data from nodes.
3. **Command Gateway:** Build the real-time interface for sending commands (Reboot, Update) to specific devices.
4. **Pairing UI:** Implement the front-end workflow in `@sous/web` for adding and configuring new hardware.
