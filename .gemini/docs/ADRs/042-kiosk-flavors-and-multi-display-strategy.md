# ADR 042: Kiosk Flavors & Multi-Display Strategy

## Status

Proposed

## Date

2026-02-07

## Context

With the pivot to a web-first architecture using Capacitor, we need to generate multiple application "flavors" (KDS, POS, Signage, Tools) from a single `@sous/web` codebase. Additionally, the Signage application requires the ability to project content to secondary HDMI displays (e.g., on a Raspberry Pi running Android).

## Decision

### 1. Android Product Flavors

We will implement standard Android Product Flavors in `apps/web/android/app/build.gradle`.

- **Dimensions**: `app`
- **Flavors**:
  - `tools`: Primary administrative app (`com.sous.tools`).
  - `kds`: Kitchen Display System (`com.sous.kds`).
  - `pos`: Point of Sale terminal (`com.sous.pos`).
  - `signage`: Digital Signage node (`com.sous.signage`).

### 2. Flavor-Specific Logic

Each flavor will define a `SOUS_FLAVOR` string resource. The web application will read this via a simple bridge or Capacitor plugin on boot.

- If `SOUS_FLAVOR` is detected and the user is at the root path (`/`), the app will automatically redirect to the corresponding route:
  - `kds` -> `/kds`
  - `pos` -> `/pos`
  - `signage` -> `/hardware` (to initiate pairing) or saved signage route (e.g., `/signage/[id]`).

### 3. Multi-Display (HDMI) Projection

For Digital Signage nodes with multiple HDMI ports, we will implement a custom Capacitor plugin `SousHardware`.

- **Mechanism**: Use Android's `DisplayManager` and `Presentation` class.
- **Implementation**:
  - Detect secondary displays via `DisplayManager`.
  - Instantiate a `Presentation` object targeting the secondary `Display`.
  - The `Presentation` will contain its own `WebView` instance.
  - This `WebView` will load the specific signage route (e.g., `/signage/[id]`).
- **Hardware Target**: Raspberry Pi running an Android-based OS (e.g., LineageOS, Emteria, or custom AOSP build).

## Consequences

- **Positive**:
  - **Single Codebase**: All kiosk logic and administrative UI live in one Next.js project.
  - **Native Performance**: Using Android's `Presentation` API ensures high-performance secondary display rendering.
  - **Streamlined Deployment**: Build specific APKs for different hardware roles.
- **Negative**:
  - **Native Complexity**: Requires maintaining a small amount of Java/Kotlin code for the HDMI projection bridge.
  - **Webview Overhead**: Running multiple WebViews (Primary + Secondary) on low-end hardware (RPi) may require memory optimization.
