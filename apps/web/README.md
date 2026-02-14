# @sous/web

The unified frontend shell for the Sous platform. Built with **Next.js 16**, **Tailwind CSS 4**, and **Capacitor**.

## Responsibilities

This application serves as a thin "Shell" (Mandate #15). It handles:
- **Routing**: Client and Server-side routing for all platform flavors.
- **Platform Glue**: Capacitor integration for native hardware access.
- **Initialization**: Apollo Client, Auth Providers, and Design System setup.
- **Layouts**: High-level structural containers for different view modes.

**Note**: All core business logic, components ("Organisms"), and domain-specific hooks reside in `@sous/features`.

## Product Flavors

The web app is optimized for multiple deployment targets using Capacitor:

| Flavor | Target | Description |
| :--- | :--- | :--- |
| **Admin** | Desktop Web | Central management console for organizations. |
| **POS** | Tablet | Touch-optimized terminal for order entry. |
| **KDS** | Large Tablet / Monitor | Kitchen Display System with real-time ticket aging. |
| **Signage** | TV / 1080p | Digital menu board and promotional display. |
| **Mobile** | Phone | Consumer and staff mobile companion. |

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS 4 + `@sous/ui`
- **Data Fetching**: Apollo Client (GraphQL + WebSockets for Subscriptions)
- **Animations**: Framer Motion (Real-time updates)
- **Native Bridge**: Capacitor 7

## Installation & Setup

1.  **Dependencies**:
    ```bash
    pnpm install
    ```

2.  **Environment**:
    All configuration is managed via `@sous/config` and injected via `sous env exec`.

3.  **Development**:
    ```bash
    # Start the dev server
    pnpm dev
    ```

## Functionality List

- [x] **Unified Authentication**: SSR-compatible auth flow with RBAC.
- [x] **Real-time KDS**: Subscriptions-based ticket management with animated transitions.
- [x] **Touch POS**: Interactive catalog and cart management.
- [x] **Digital Signage**: Dynamic layout engine driven by API content.
- [x] **Device Pairing**: 6-digit code pairing for native hardware nodes.

## Documentation

- [Design System Tokens](../../packages/ui/README.md)
- [Feature Architecture](../../packages/features/README.md)
- [Capacitor Workflow](../../.gemini/docs/dev-device-installation.md)
