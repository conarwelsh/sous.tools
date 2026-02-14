# Spec 031: Sous Asset Forge

**Status:** Proposed
**Date:** 2026-02-13
**Consumers:** @sous/cli, @sous/ui, @sous/web, @sous/native

## Objective

Implement a centralized brand asset generation engine that ensures 100% uniformity across all platforms (Web, Android, iOS, WearOS). This replaces fragmented script-based generation with a unified CLI command.

## 1. Core Logic

### 1.1 Source of Truth
The forge uses `branding.config.json` as its input. This file contains the finalized tweaks from the **Branding Lab** (Spec 005).

### 1.2 Rendering Pipeline
1.  **SVG Injection**: Load master SVG templates (Logos, Icons, Splashes).
2.  **Rasterization**: Use `resvg-js` to render the SVGs to high-resolution PNGs.
3.  **Optimization**: Use `sharp` to resize, optimize, and generate the required density variants (mdpi, hdpi, xhdpi, etc.).

## 2. CLI Command (`sous quality forge`)

### Flags
- `--target`: web, android, ios, all (Default: all).
- `--clean`: Wipe existing assets before generating.

### Process
1.  Read `branding.config.json`.
2.  Identify all targets.
3.  Generate:
    - **Web**: Favicons (16, 32, 180), OG Images.
    - **Android**: Adaptive Icons, Notification Icons, Splash Screens.
    - **iOS**: App Icons, Launch Images.
    - **WearOS**: Watch Face background elements.

## 3. Storage
Generated assets are written directly to the `public/` or `assets/` folders of the respective apps.

## Implementation Plan

1.  **CLI**: Create `ForgeCommand` in `apps/cli/src/commands/quality/`.
2.  **Logic**: Implement the rendering loop using `resvg-js` and `sharp`.
3.  **Cleanup**: Delete `scripts/generate-splash.ts` once verified.
