# ADR 015: Universal Platform Application Strategy (@sous/web & @sous/native)

## Status
Proposed

## Date
2026-02-03

## Context
The `sous.tools` platform requires a comprehensive suite of tools for restaurant management (Inventory, Culinary, IoT, Identity). While we have specialized apps like `@sous/native-kds` and `@sous/native-pos`, we need a "primary" interface that exposes all platform functionality to administrators and owners.

**Key Requirements:**
- **Feature Parity:** `@sous/web` and `@sous/native` must provide the same features and user experience.
- **Maximum Reuse:** Minimize development overhead by sharing as much code (Views, Hooks, Logic) as possible.
- **Web Availability:** A browser-based version (`@sous/web`) for desktop management.
- **Mobile Presence:** A native mobile application (`@sous/native`) for on-the-go management.
- **Wearable Extension:** A specialized watch app (`@sous/wearos`) for hands-free alerts and quick actions.
- **Offline Backup:** The web version must be a Progressive Web App (PWA) to serve as a fallback for the native app.

## Decision
We will treat `@sous/web` and `@sous/native` as two distributions of the same **Universal Frontend Codebase**.

### Key Technology Choices

1.  **Framework: React Native Universal**
    - Both apps will consume the **Universal UI** library (`@sous/ui`) as defined in ADR 006.
    - **@sous/web:** Next.js 16 utilizing `react-native-web` for rendering.
    - **@sous/native:** React Native for iOS and Android.

2.  **Code Sharing Strategy**
    - **Shared Views:** All domain-specific views (e.g., `InventoryView`, `RecipeDetailView`) will be written using React Native primitives and housed in a shared location (or within `@sous/ui` features) to be imported by both apps.
    - **Shared Logic:** Data fetching and business logic will be encapsulated in shared hooks that utilize `@sous/client-sdk`.
    - **Routing:** 
        - Web uses Next.js App Router.
        - Native uses React Navigation (or Expo Router).
        - A light abstraction layer will be used to handle navigation across platforms.

3.  **PWA Configuration (`@sous/web`)**
    - `@sous/web` will be configured with a Service Worker (using `next-pwa` or similar) to allow offline access to cached data and provide an "App-like" experience on mobile browsers.

### Implementation Details
- Features will follow the **Controller-View** pattern (ADR 004), allowing the *View* to be 100% shared, while the *Controller* handles platform-specific navigation or deep-linking logic if necessary.
- Native-specific features (e.g., Push Notifications, Camera/Barcode scanning) will be abstracted so that the Web version can use browser-based fallbacks.

## Consequences
- **Positive:**
    - **Single Source of Truth:** A bug fix or feature addition in a shared view instantly updates both Web and Mobile platforms.
    - **Consistent Branding:** Exact visual parity across all user touchpoints.
    - **Speed to Market:** Developing one comprehensive frontend for two platforms significantly reduces effort.
- **Negative:**
    - **Abstraction Overhead:** Some features (like file uploads or complex navigation) require platform-specific implementations that must be carefully managed.
    - **Bundle Size:** Ensuring the Web app remains lightweight while supporting the React Native ecosystem requires careful build optimization.

## Research & Implementation Plan

### Research
- **React Navigation vs. Expo Router:** Selected Expo Router for its file-based routing that closely mirrors Next.js, simplifying the shared architecture.
- **PWA Capabilities:** Verified `next-pwa` support for Next.js 16.

### Implementation Plan
1. **Shared Layouts:** Define the core platform layout (Sidebar, Header, Navigation) in `@sous/ui`.
2. **Domain Integration:** Implement the primary feature views (Inventory, Culinary, Admin) as shared components.
3. **Routing Abstraction:** Create a `useAppNavigation` hook that abstracts between Next.js and Expo Router.
4. **PWA Setup:** Configure the Web manifest and service worker for `@sous/web`.
