# Spec 008: Shared Presentation Components

**Status:** Proposed
**Date:** 2026-02-09
**Consumers:** Layout Manager (006), Screen Manager (007), Label Manager (Future)

## Objective

Define the specifications for the core reusable UI components that power the Presentation Domain's management interfaces. These components ensure consistency across the Layout, Screen, and Label editors.

## 1. Layout Template Selector

A modal interface for browsing and selecting structural templates.

### Features

- **Visual Grid:** Renders a grid of available layouts using the `TemplateSkeletonRenderer` (scaled down).
- **Filtering:**
  - **Tags:** Filter by user-defined tags (e.g., "Menu Board", "Promo", "Horizontal").
  - **Search:** Text search by template name.
- **Selection:** "Select" button on hover. Confirms choice and passes the `LayoutTemplate` ID back to the parent.
- **States:** Loading (skeletons), Empty (no results), Error.

### Usage

- **Screen Manager:** To switch the layout of the current screen.
- **Label Manager:** To choose a print label structure.

## 2. Image Selector (Asset Manager)

A centralized media picker for the Organization.

### Features

- **Gallery View:** Grid of thumbnails for uploaded assets.
- **Upload Zone:** Drag-and-drop area to upload new files directly within the modal.
  - _Processing:_ auto-converts to WebP/Grayscale per ADR 028 if configured, or standard optimization for screens.
- **External URL:** Option to input a direct image URL instead of uploading.
- **Selection:** Returns the `mediaId` or `url` to the parent.
- **Metadata:** Shows resolution and file size on hover.

### Usage

- **Screen Manager:** Assigning content to "Image" slots.
- **Layout Manager:** Adding static background images or logos to templates.

## 3. Template Skeleton Renderer

The core visualization engine for Layout Templates. This component is responsible for translating the abstract JSON structure into a visual DOM representation.

### Features

- **Recursive Rendering:** Traverses the JSON tree (Rows, Columns, Slots).
- **Layout Engine:** Applies correct CSS Grid and Flexbox styles based on the template's configuration.
- **Placeholder Mode:**
  - If no content is assigned, renders a "Slot" visual (dashed border, label).
- **Preview Mode:**
  - Accepts a `contentMap` prop to render actual children components inside the slots (used by Screen Manager).
- **Scaleable:** Accepts a `scale` prop (or uses CSS `transform`) to render miniature versions for the `LayoutTemplateSelector` without breaking layout logic.

### Props Interface

```typescript
interface TemplateSkeletonRendererProps {
  template: LayoutTemplate;
  contentMap?: Record<string, React.ReactNode>; // For Screen/Label Manager live views
  onSlotClick?: (slotId: string) => void;
  scale?: number; // For thumbnail views
}
```

## Implementation Strategy

These components should reside in `@sous/features/presentation/components/shared/` to be imported by the various domain editors.
