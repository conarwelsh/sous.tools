# ADR 041: Pivot to Web-First Architecture

## Status

Accepted

## Date

2026-02-07

## Context

The previous "Universal UI" architecture based on **React Native Web (RNW)** and **NativeWind v4** proved to be excessively fragile when integrated with **Next.js 16** and **React 19 Server Components**. The complexities of shimming `react-native` primitives, managing global context conflicts, and handling deep dependencies (like `styleq`) created significant development friction and build stability issues.

## Decision

We have decided to abandon the RNW-based universal bridge in favor of a **Web-First** architecture.

### Key Components:

1.  **Single Source of Truth**: `@sous/web` (Next.js) is now the primary application for all platforms.
2.  **Standard Web Stack**: Use standard HTML5, standard Tailwind CSS, and Shadcn UI (Radix UI) for the entire frontend.
3.  **Mobile Target**: Use **Capacitor** to wrap the web application for Android and iOS. This allows access to native APIs (camera, haptics, hardware) without the overhead of React Native's bridge.
4.  **Kiosk Target**: Use **Raspberry Pi** nodes running **FullPageOS** or similar kiosk-mode browsers pointing to the hosted web application.
5.  **Simplified UI Package**: Refactor `@sous/ui` to be a standard React component library, eliminating all `react-native` dependencies and shims.

## Consequences

- **Positive**:
  - **Stability**: Full compatibility with Next.js 16, React 19, and modern web tooling.
  - **Developer Velocity**: Standard web development workflows with zero shimming overhead.
  - **Performance**: Reduced bundle size and faster rendering by removing the RNW abstraction layer.
  - **Maintainability**: Standard CSS/Tailwind is easier to debug and scale than RNW's inline style engine.
- **Negative**:
  - Requires refactoring existing RN-based components to standard HTML/Tailwind.
  - Native mobile performance may be slightly lower than pure React Native (though negligible for most SaaS applications).
  - Requires a different approach for low-level hardware discovery (standard web APIs or Capacitor plugins).
