# Spec 005: Documentation Hub & Branding Lab
**Status:** Completed
**Date:** 2026-02-04
**Reference:** @sous/docs app

## Objective
Implement `@sous/docs` as the centralized intelligence hub for the platform, combining Component Driven Development (CDD), a persistent Branding Lab, and an automated Knowledge Base.

## Features

### 1. Persistent Branding Lab
- **Interactive Tweaking:** Sliders and inputs to modify React props for each target size (e.g., "Scale the 'plate' variant to 85% for the 16x16 Favicon").
- **Local Persistence (Dev Only):** 
    - In the development environment, a "Save to Workspace" button hits a local API that writes the configuration to `branding.config.json` using the Node.js `fs` module.
- **Manual Import (Dev Only):**
    - A "Paste Configuration" field will allow you to import JSON strings (e.g., sent via email from a designer using the production site). This will live-update the Lab state and allow for a "Save to Workspace" action to commit those changes.
- **Cloud Mode (Production):** 
    - On Vercel, the "Save" button is replaced with "Copy Configuration to Clipboard" to allow sharing design tweaks.
- **WYSIWYG Parity:** The Lab renders the exact same SVG components the CLI will use for generation.

### 2. Component Playground (CDD)
- **Living Style Guide:** Auto-generated pages for every atom in `@sous/ui`.
- **Controls Engine:** A Storybook-like interface within the docs that allows live prop manipulation.
- **Universal Previews:** Uses `react-native-web` to show components exactly as they will look on the web.

### 3. Unified Knowledge Base
- **ADR/Spec Reader:** Automatically parses and renders everything in `@.gemini/docs/ADRs/` and `@.gemini/specs/`.
- **Package READMEs:** Crawls the monorepo to aggregate documentation for every app and package.

### 4. Icon Generation CLI (`sous env branding`)
- **Process:**
    1. Read `branding.config.json`.
    2. For each target (Web, Android, iOS, WearOS):
        - Render the `Logo` component with the saved props to an SVG string.
        - Use `resvg-js` to convert to PNG at high DPI.
        - Use `sharp` to optimize and save to the respective app's asset directory.

## Architecture

### The Config Schema (`branding.config.json`)
```json
{
  "favicon": { "variant": "plate", "size": 32, "props": { "padding": 2 } },
  "android": { "variant": "neon", "size": 512, "props": { "isAnimated": false } }
}
```

### The Playground Wrapper
A higher-order component in `@sous/docs` that wraps `@sous/ui` components and provides a standard "Control Panel" UI for manipulating their properties.

## Implementation Plan

### Step 1: Configuration Infrastructure
1. Define the Zod schema for `branding.config.json` in `@sous/config`.
2. Create a local API route in `@sous/docs` to handle filesystem writes during development.

### Step 2: Branding Lab UI
1. Build the multi-target preview matrix.
2. Implement the property editors (sliders/pickers) linked to the config state.

### Step 3: Component Engine
1. Implement the `ComponentPlayground` feature in `@sous/features`.
2. Map the baseline atoms (Button, Input, etc.) to playground pages.

### Step 4: The CLI Generator
1. Implement `sous env branding` using `resvg-js`.
2. Verify that `resvg-js` preserves the `oklch` colors and SVG filters correctly.

## Free-Tier Considerations
- Entirely local processing for generation.
- Zero cost for documentation hosting on Vercel.