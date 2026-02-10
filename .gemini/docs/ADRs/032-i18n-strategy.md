# ADR 032: Internationalization (I18n) & Localization Strategy

## Status

Proposed

## Date

2026-02-04

## Context

Restaurant staff are globally diverse. The platform (`@sous/ui`) must support multiple languages, RTL/LTR layouts, and locale-specific unit formatting (Metric vs. Imperial) to be effective in professional kitchens.

## Decision

We will adopt a **Type-Safe, Code-Split I18n** strategy.

### 1. Framework & Tooling

- **Engine:** `i18next` with `react-i18next`.
- **Typing:** Use `i18next`'s TypeScript integration to ensure translation keys are validated at compile time.
- **Unit Formatting:** `Intl` API for currency and date; specialized custom hooks in `@sous/ui` for unit conversion (e.g., Grams to Ounces) based on user preference.

### 2. Implementation Strategy

- **Code Splitting:** Translations will be stored in JSON files scoped by Domain (e.g., `culinary.json`, `procurement.json`) and loaded on-demand to minimize the initial JS bundle.
- **Universal Support:** The I18n setup must work in Next.js (Web) and React Native (Mobile/Capacitor) via the shared `@sous/ui` package.
- **Directionality:** Tailwind's `rtl` / `ltr` utilities will be mandated for layout-sensitive components.

## Consequences

- **Positive:** Global market readiness; professional DX with type-safe keys.
- **Negative:** Increased development overhead for adding new features (managing translation keys).
