# Spec 009: Hardware Discovery and Pairing

## Overview
This specification details the workflow for connecting physical hardware (tablets, Raspberry Pis, kiosks) to the Sous ecosystem using a local-first mesh discovery layer and secure code-based pairing.

## 1. Network Discovery (The Handshake)
Before pairing can begin, the hardware node must locate the Sous API. This is handled via an **Edge-First Auto-Discovery** layer.

### 1.1 Service Broadcast (mDNS)
The **Sous Edge Node** (Raspberry Pi or Primary POS) will broadcast its presence on the local network using Multicast DNS.
- **Service Type**: `_sous-api._tcp`
- **Hostname**: `sous-edge.local`
- **TXT Record**: Contains `version`, `clusterId`, and `environment`.

### 1.2 Device Discovery
When a Sous app (POS/KDS/Signage) is in an "Unpaired" state:
1. It initiates an mDNS scan for `_sous-api._tcp`.
2. If found, it automatically sets the `NEXT_PUBLIC_API_URL` to the local IP of the Edge Node.
3. The UI updates from "Searching for Kitchen..." to **"Connected to [Kitchen Name]. Enter Pairing Code."**

## 2. The Pairing Flow
Once the communication "pipe" is established via Discovery, the identity "key" is established via the Pairing Flow.

1. **Generation**: Admin opens the "Hardware Manager" on the Web Dashboard and clicks "Add Device".
2. **Code**: The system generates a short-lived (10 min) 6-digit alphanumeric code (e.g., `BX-901`).
3. **Entry**: The user enters this code on the physical hardware.
4. **Validation**: The hardware sends its `uniqueDeviceId` (UUID) + `pairingCode` to the API.
5. **Association**: If the code is valid, the API creates a `display_assignment` linking that hardware ID to the selected Layout/Role.
6. **Token**: The hardware receives a long-lived `HardwareJWT` which it stores in local encrypted storage for persistent authentication.

## 3. UI/UX Requirements
- **Hardware Side**: The pairing screen must clearly indicate the device's unique ID and the status of its network connection (e.g., "Scanning...", "Found Local Server", "Cloud Only").
- **Admin Side**: A "Live Discovery" toast should appear when a new unpaired device is detected on the local mesh, allowing for "one-click" approval.
