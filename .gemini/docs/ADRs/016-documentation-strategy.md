# ADR 016: Documentation Platform & Branding Lab (@sous/docs)

## Status
Proposed

## Date
2026-02-03

## Context
As the `sous.tools` ecosystem expands, we need a single source of truth for technical documentation, design standards, and brand identity. Static documentation is insufficient for a platform that spans Web, Mobile, Kiosk, and POS.

**Key Requirements:**
- **Living Style Guide:** A real-time showcase of theme colors, typography, and spacing tokens with interactive examples.
- **Branding Lab:** An interactive playground for tweaking the Brandmark (logo) and Lettermark, with live previews across all platform contexts (e.g., app icons at every required resolution, favicons, splash screens).
- **Component Driven Development (CDD):** A sandbox for developing and testing `@sous/ui` components in isolation (e.g., Storybook or custom implementation).
- **Consolidated Docs:** Automatic aggregation of `README.md` files from every app and package in the monorepo.
- **Maintenance Mandate:** Documentation must be a first-class citizen, updated automatically during development.

## Decision
We will implement **`@sous/docs`** as a specialized Next.js application designed to serve as the "Intelligence Hub" of the platform.

### Key Technology Choices

1.  **Framework: Next.js + MDX**
    - MDX allows for embedding interactive React components (Branding Lab, Style Guide) directly within documentation pages.

2.  **Branding Lab & Icon Generator**
    - A dedicated suite of tools to visualize the logo in context.
    - Integration with a canvas-based or SVG-manipulation engine to preview icons at all required sizes (16x16 up to 1024x1024).

3.  **CDD Sandbox**
    - We will utilize a component-driven development environment to build `@sous/ui` atoms.
    - Since `@sous/ui` is Universal (ADR 006), the sandbox must support rendering components using `react-native-web`.

4.  **Automatic Aggregation**
    - A build-time script will crawl the `apps/` and `packages/` directories to pull in `README.md` files, ensuring they are always visible in the centralized docs app.

### Documentation Mandate (README Standard)
Every `README.md` in the monorepo must follow a strict template:
- **Description:** High-level purpose and responsibilities.
- **Installation:** Step-by-step setup instructions.
- **3rd Party Integration:** Setup procedures for external platforms (e.g., Infisical, Resend, Better Stack).
- **Functionality:** Comprehensive list of features.
- **Tech Stack:** Tools and libraries used.
- **Related Links:** Connections to ADRs or other internal documentation.

## Consequences
- **Positive:**
    - **Branding Consistency:** Zero-guesswork implementation of the brand across all platforms.
    - **Developer Onboarding:** Comprehensive, automated READMEs make it easy for new contributors to understand any part of the system.
    - **Quality Control:** CDD ensures components are robust and platform-agnostic before they are integrated into apps.
- **Negative:**
    - **Maintenance Overhead:** Keeping the Branding Lab and Style Guide perfectly in sync with the production theme requires disciplined update workflows.

## Research & Implementation Plan

### Research
- **MDX in Next.js:** Verified compatibility with `react-native-web` components for the live style guide.
- **Icon Generation:** Identified `canvas` (for Web) and `skia` (for potential automation) as the core technologies for the Branding Lab.

### Implementation Plan
1. **Docs Core:** Setup the Next.js app with MDX support and a custom theme.
2. **Aggregation Script:** Write a Node.js script that collects `README.md` files and generates the navigation structure.
3. **Style Guide:** Build the interactive color and typography showcase using theme tokens from `@sous/ui`.
4. **Branding Lab:** Implement the logo preview and icon generation tools.
