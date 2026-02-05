# Branding Specification

## Overview
This document defines the new branding implementation for `@sous/ui`.

## 1. Wordmark
- **Components:** "SOUS" + Dynamic Suffix.
- **Font (SOUS):** Brand Font (Inter/System, All Caps, Black/Bold).
- **Font (Suffix):** Mono Font (JetBrains Mono/System Mono, Lowercase, Regular/Medium).
- **Color:**
  - "SOUS": Inherits from theme (Environment-aware: Primary/Success/Warning).
  - Suffix: Muted.
- **Dynamic Suffix:** Defaults to "tools" (e.g., "sous.lab", "sous.docs", "sous.api").

## 2. Lettermark (Logo)
- **Design Philosophy:** Clean lines, geometric, minimal.
- **Scalability:** Must look good from 16px to large scale.
- **States:**
  - **Static:** Default state.
  - **Animated:** Variant-specific subtle animation.
  - **Loading:** Rotating gear or variant-specific loading state.
- **Environments (Color Coding):**
  - **Production:** Brand/Primary Color.
  - **Staging:** Warning Color (Orange/Yellow).
  - **Development:** Success Color (Green).

## 3. Implementation Details
- **Component:** `Logo`, `Wordmark`
- **Props (Logo):**
  - `variant`: string.
  - `size`: number (pixel height/width).
  - `showWordmark`: boolean.
  - `suffix`: string.
  - `environment`: 'production' | 'staging' | 'development'.
  - `animate`: boolean.
  - `loading`: boolean.
  - `className`: string.

## 4. Variations List
1.  **Neon:** (Default) Neon light style logo.
2.  **Toque Tall:** (Hero) Straight tall hat with rotating gear in bottom-right.
3.  **Beaker:** Science lab beaker with liquid lines.
4.  **Hat and Gear:** Legacy "Chef Hat + Gear" Variant.
5.  **Chef Line:** Minimalist heartbeat line with the iconic chef hat silhouette.
6.  **Line:** Represents the "Kitchen Line" and the heartbeat of the operation.