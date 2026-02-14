# Product Features

This document provides a comprehensive list of implemented and planned features for the Sous platform.

## 1. Core Platform

### Unified Authentication (IAM)
- **Status**: ✅ Implemented
- **Details**: JWT-based login, registration, and password recovery. Supports multi-tenant organization switching.
- **Tech**: NestJS Passport + `@sous/features`.

### Device Pairing
- **Status**: ✅ Implemented
- **Details**: 6-digit code pairing for native nodes (KDS, POS, Signage). Automatic discovery via mDNS.
- **Tech**: `@sous/client-sdk` + Socket.io.

## 2. Operations (KDS & POS)

### Kitchen Display System (KDS)
- **Status**: ✅ Hardened (Feb 2026)
- **Details**: Real-time ticket visualization with GraphQL Subscriptions. Automated ticket aging and bump logic.
- **UX**: Framer Motion animations for ticket entry/exit.

### Point of Sale (POS) Terminal
- **Status**: ✅ Hardened (Feb 2026)
- **Details**: Touch-optimized interface for order entry. Dual-driver support (Square + Proprietary Sous Driver).
- **Features**: Employee PIN Login, Floorplan view with SVG tables, Shift Dashboard, Modifiers Modal.
- **UX**: Category filtering and animated cart management with 'Neon' design system.

### Catalog Management
- **Status**: ✅ Implemented
- **Details**: Centralized product and category management with organization-level scoping.

## 3. Presentation & Signage

### Digital Menu Boards
- **Status**: ✅ Implemented
- **Details**: Dynamic layout engine. Real-time content updates from the API.
- **Tech**: Next.js Server Components.

### Sous Asset Forge
- **Status**: ✅ Implemented (Feb 2026)
- **Details**: Centralized brand asset generation engine ensures 100% uniformity across Web, Android, iOS, and WearOS.
- **Tech**: `resvg-js` + `sharp` + `@sous/ui` React Components.
- **Command**: `sous dev quality forge`.

### Branding Lab (Atelier)
- **Status**: ✅ Hardened (Feb 2026)
- **Details**: Interactive playground for testing theme variables and design tokens. Includes high-fidelity icon masking previews for all platforms.
- **Path**: `@sous/docs` -> `/branding`.

## 4. Hardware & IoT

### Remote Node Management
- **Status**: ✅ Implemented
- **Details**: Centralized logging ("God View") and remote terminal access via the Windows Agent bridge.
- **Hardware**: Raspberry Pi 4/5, Android Tablets, Wear OS.

## 5. Intelligence & Growth

### Real-time Metrics
- **Status**: 🚧 In Progress
- **Details**: Live dashboard for sales and operational efficiency.

### Procurement & Inventory
- **Status**: 🚧 Refactoring
- **Details**: Automated stock auditing and invoice ingestion.
