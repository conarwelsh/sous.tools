# ADR 006: Universal UI Component Strategy (SUPERSEDED)

## Status

Superseded by [ADR 041](./041-web-first-pivot.md)

## Date

2026-02-03 (Superseded 2026-02-07)

## Context

The platform requires a shared design system (`@sous/ui`) consumed by:

1.  **Web:** `@sous/web` (Next.js)
2.  **Mobile:** Future React Native applications.

**Constraints:**

- **No Direct DOM Access:** Components cannot use `<div>`, `<span>`, or `<img>` directly, as these break in React Native.
- **Shadcn UI:** We want to leverage the aesthetics and patterns of Shadcn UI (Tailwind + Accessible Primitives).
- **Single Source of Truth:** We want to write UI components once and run them on both platforms.

## Decision

We will adopt a **Universal UI** architecture based on **React Native Web** and **NativeWind**.

### Key Technology Choices

1.  **Core Abstraction: React Native Web**
    - We will write components using React Native primitives: `<View>`, `<Text>`, `<Image>`, `<Pressable>`.
    - **Web:** These compile to standard HTML DOM (`<div>`, `<span>`, etc.) via `react-native-web`.
    - **Mobile:** These render as native UI views.

2.  **Styling: NativeWind (v4)**
    - This allows us to use **Tailwind CSS** classes on React Native components.
    - Matches the "Shadcn" developer experience (`className="..."`).
    - Handles platform-specific styling logic automatically.

3.  **Headless Primitives & Component Kit: React Native Reusables (RNR)**
    - To satisfy the "Shadcn" requirement without the labor of manual conversion, we will use **React Native Reusables**.
    - RNR provides a CLI-based, copy-paste workflow identical to Shadcn but built on top of **@rn-primitives** and **NativeWind v4**.
    - This ensures our components are accessible and universal (supporting both Web and Native) out of the box.

4.  **Icons: `lucide-react-native`**
    - Universal icon set that works on both platforms with consistent SVGs.

### 4. Required Atomic Components (Phase 1 Baseline)

To match the feature requirements of the platform, `@sous/ui` will implement the following universal atoms:

- **Navigation:** Tabs, Sheet (Drawer), Accordion.
- **Form:** Button, Input, Textarea, Label, Checkbox, Switch, Select, Slider.
- **Display:** Card, Badge, Separator, Table, Progress, Skeleton.
- **Overlay:** Dialog (Modal), Popover, Tooltip, Dropdown Menu.
- **Layout:** View, Text, ScrollArea.

### Component Structure

All components in `@sous/ui` will follow this pattern:

```tsx
import { Text, View } from "react-native";
import { cn } from "./utils";

// Universal Button
export function Button({ className, children, ...props }) {
  return (
    <View
      className={cn("bg-primary rounded-md px-4 py-2", className)}
      {...props}
    >
      <Text className="text-primary-foreground font-medium">{children}</Text>
    </View>
  );
}
```

### Theming

- We will define our design tokens (colors, radius, fonts) in a shared configuration.
- **Web:** Mapped to CSS Variables (standard Shadcn approach).
- **Mobile:** Mapped to NativeWind configuration which resolves these variables at runtime/build time.

## Consequences

- **Positive:**
  - **True Cross-Platform:** 95%+ code reuse for UI components.
  - **Consistent Branding:** Exactly the same visual, spacing, and behavior on Web and Mobile.
  - **Developer Experience:** Familiar Tailwind syntax.
- **Negative:**
  - **Setup Complexity:** Configuring TurboRepo to handle `react-native-web` transpilation for Next.js 16 requires careful configuration (transpile-modules).
  - **Web-First Limitations:** Some web-specific CSS properties (like complex animations or grid layouts) have limited support in React Native and must be handled carefully.

## Research & Implementation Plan

### Research

- **NativeWind v4:** The latest version allows for a "Shadcn-like" experience using Tailwind CSS on both Web (via CSS) and Native (via runtime transformations).
- **React Native Web:** Maturity check confirmed it's stable for Next.js 16 integration.
- **@rn-primitives:** Verified these offer the accessibility features of Radix UI while remaining platform-agnostic.

### Implementation Plan

1. **Monorepo Setup:** Configure the `@sous/ui` package with the necessary Babel/Metro/Turbo configurations for cross-platform transpilation.
2. **Design Tokens:** Define the theme (colors, spacing, radius) in a `tailwind.config.js` shared across the monorepo.
3. **Core Atoms:** Build the base component set (Button, Input, Card, Text) using React Native primitives and NativeWind.
4. **Documentation (Storybook):** Setup Storybook (or `@sous/docs`) to visualize components on both Web and (simulated) Mobile.
