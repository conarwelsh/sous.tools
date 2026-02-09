# ADR 033: Testing & Quality Assurance Pyramid

## Status

Proposed

## Date

2026-02-04

## Context

The platform's complexity (Web, Tauri, RPi, Wear OS) requires a rigorous testing strategy to prevent regressions in mission-critical features like POS and KDS.

## Decision

We will adopt a multi-layered testing pyramid.

### 1. Unit & Integration (Vitest / Jest)

- **Scope:** Business logic, math engines (costing), and utility packages.
- **Goal:** Fast feedback loop. Mandated for all shared packages (`@sous/config`, `@sous/logger`).

### 2. Universal UI Testing (React Testing Library)

- **Scope:** `@sous/ui` components.
- **Goal:** Ensure cross-platform accessibility and visual consistency.

### 3. End-to-End (Playwright & Appium)

- **Web:** **Playwright** for critical path flows (Auth, Organization setup).
- **Native (Tauri/Android):** **Appium** (or Playwright's Tauri driver) for KDS/POS simulation.

### 4. Hardware-in-the-Loop (HITL) Simulation

- Since testing on physical RPi 4B hardware is slow, we will use a **Dockerized RPi Emulator** (via QEMU) in the CI pipeline to verify the Native Bridge's interaction with the virtualized OS.

## Consequences

- **Positive:** High confidence in platform stability; automated verification of native/hardware logic.
- **Negative:** Maintaining E2E and HITL tests is resource-intensive and increases CI build time.
