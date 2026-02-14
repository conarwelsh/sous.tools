# Spec 036: The Sous Edge Hardware Node

## Overview
This specification defines the "Edge Node" — the physical hardware anchor for a local Sous deployment. It combines the roles of **Digital Signage Player**, **Local API Gateway**, and **Mesh Discovery Server** into a single device (typically a Raspberry Pi 5 or NUC).

## 1. Responsibilities
The Edge Node is not just a "kiosk"; it is the **Local Leader**.

1.  **Service Discovery (mDNS)**: Broadcasts `_sous._tcp` so tablets can find the network without cloud DNS.
2.  **Content Rendering**: Runs `@sous/web` (Signage Flavor) in Kiosk Mode on the HDMI output.
3.  **Local Caching (L1)**: Mirrors critical cloud data (Menu, Employees, Device List) to Redis/Postgres on-device to survive internet outages.
4.  **Hardware Bridge**: Exposes a local HTTP/WebSocket server to proxy commands to USB/Bluetooth peripherals (Printers/Card Readers) attached to it.

## 2. Hardware Specification
- **Reference Device**: Raspberry Pi 5 (8GB RAM).
- **OS**: Custom Buildroot or DietPi image (minimized Linux).
- **Runtime**: Docker Compose (running `sous-api`, `sous-redis`, `sous-signage-ui`).

## 3. Software Architecture

### 3.1 The "Sidecar" Pattern
The Edge Node runs a standard instance of `@sous/api` but with `EDGE_MODE=true`.
- **Cloud Mode**: Connects to Supabase/Neon.
- **Edge Mode**: Connects to local Dockerized Postgres.
- **Sync**: A background "Replicator" service handles bidirectional sync between Cloud DB and Edge DB.

### 3.2 Kiosk Browser
The display output is driven by a hardware-accelerated browser (e.g., WPE WebKit or Chromium) pointing to `http://localhost:3000/signage`.

## 4. Failure Modes
- **Power Loss**: Device must auto-boot and recover state within 60 seconds.
- **Network Loss**: Device switches API to "Local Mode" and queues all outbound analytics/payments.

## 5. Security
- **Local TLS**: The Edge Node generates a self-signed certificate upon initialization.
- **Pairing**: Tablets must "pair" with the Edge Node (Spec 009) to trust its certificate.
