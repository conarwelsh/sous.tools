# Deployment & Development Strategy

This document outlines the lifecycle of the `sous.tools` platform, from local development to production.

## 1. Development Environment

The development environment is optimized for rapid iteration using a hybrid of local processes, emulators, and containers.

### Core Services (WSL2)
- **@sous/api**, **@sous/web**, and **@sous/docs** run directly in the WSL2 Ubuntu environment.
- Orchestration is handled via `sous dev` or `scripts/dev-tools.ts`.

### Native & Wearable Extensions (Emulators)
- **Native App Flavors** (`pos`, `kds`, `tools`): Ran via targeted Android emulators (Pixel 5, Pixel C, etc.) using Capacitor.
- **@sous/wearos**: Ran via the Wear OS emulator.

### Digital Signage (Docker)
- **Signage Nodes**: Development is done using the `sous-signage-node` (Redroid) container in `docker-compose.yml`. 
- This ensures parity with the final Android-based OS used on physical hardware without needing a connected RPi.

## 2. Staging Environment (Release Candidates)

Before production, all native builds are promoted to **Release Candidates (RC)** and installed on physical test hardware.

### Test Device Registry
- **Admin/Mobile**: Physical Android Phone & Tablet.
- **Hands-Free**: Samsung Galaxy Watch (Old model for legacy API testing).
- **Kitchen/Signage**: Local Raspberry Pi (running Emteria.OS or custom AOSP).

### Procedure
1. Build signed APKs/AABs for each flavor.
2. Sideload to physical devices via ADB or internal distribution.
3. Perform E2E and hardware-integration testing (BLE, Printers, HDMI).

## 3. Production Environment

### Core API & Web
- **@sous/api**: Deployed to [Render](https://render.com).
- **@sous/web**: Deployed to [Vercel](https://vercel.com).
- Promotion occurs via Git merges: `development` -> `staging` -> `main`.

### Kiosks & Hardware
- **Raspberry Pi**: Flashed with a pre-configured Android image (Emteria/AOSP) with the `@sous/web` signage flavor sideloaded as the default launcher.
- **Tablets/Phones**: Distributed via private App Store or MDM.

## Deployment Mandates

1. **Development Isolation**: The `development` branch MUST NEVER be deployed to production.
2. **Binary Parity**: The exact APK tested in staging must be the one promoted to production.
3. **Environment Sync**: All production secrets must be managed via Infisical.