# Spec 006: Layout Manager (Template Designer)

**Status:** Proposed
**Date:** 2026-02-09
**References:** Spec 007 (Screen Manager), Spec 008 (Presentation Shared Components)

## Objective

Create a fully functional, user-friendly Drag-and-Drop UI for designing reusable **Layout Templates**. These templates produce a structured JSON definition used by downstream systems (ScreenManager, LabelManager) to render content.

## Core Features

### 1. Live Preview Canvas (The Stage)

- **TemplateStage Component:** A shared, standardized container (`<TemplateStage />`) that occupies the full width and height of its parent. It provides the "Full Screen Context" for the LayoutManager, ScreenManager, and LabelManager.
- **Scroll Awareness:** The stage and all layouts are designed to consume available scrollable space. Containers within the layout can be configured to scroll independently (`overflow: auto`).
- **Visual WYSIWYG:**
  - Displays the active CSS Grid / Flexbox structure using dashed lines/guides when in "Edit Mode".
  - **Skeleton Rendering:** Uses the shared `TemplateSkeletonRenderer` logic (Spec 008) to visualize the structure. 
  - **Empty States:** When no content is present, the renderer MUST utilize `min-height` and `min-width` (defaulting to sensible values like `100px` or `10%`) to ensure the structure is accurately represented visually.
  - **Interactivity:** Clicking on any container/slot opens a Property Modal/Popover for configuration.

### 2. Floating Toolbar (Draggable Palette)

A persistent, draggable window containing:

- **Component/Container Drawer:** Drag-and-drop elements:
  - **Grid Row/Column:** Containers for structuring layout.
  - **Content Slot:** Named areas where actual content (POS data, Images) will be injected later.
  - **Fixed Box:** Absolute positioned containers (e.g., for Logos/Overlays).
- **JSON Preview:** A toggle to view/edit the raw JSON structure of the current layout.
- **Save/Load:** Actions to name, tag, and persist the template to the Organization.

### 3. Layout Editing Capabilities

- **Nesting:** Containers can be infinitely nested (e.g., A Row containing 2 Columns, where Column 2 contains another Row).
- **Resizing Logic:**
  - **Flexbox/Grid First:** Resizing handles should default to `%`, `fr`, or `flex-grow` units.
  - **Pixel Override:** Option to switch to fixed `px` for specific edge cases (e.g., fixed sidebar).
- **Alignment:** Visual controls for `justify-content`, `align-items`, `gap`, and `padding`.
- **Positioning:** Support for `position: absolute` (e.g., "Top Right" for logos).

### 4. Organization & Metadata

- **Naming:** Ability to give the layout a human-readable name (e.g., "Standard Digital Menu").
- **Tagging:** Add one or more tags (e.g., `menu`, `vertical`, `1080p`) for easy filtering in the `LayoutTemplateSelector` (Spec 008).

## Use Case Example: Digital Menu Board

**Goal:**

- 2 Equal width columns (Main Content).
- Footer (Auto-height, stuck to bottom).
- Columns manage their own scroll areas.
- Fixed Logo (Top Right).
- Footer has 2 slots: Left aligned text, Right aligned text.

**Workflow:**

1.  **Root:** Set Root to `display: flex; flex-direction: column; height: 100%`.
2.  **Main Body:** Drag in a "Container". Set `flex-grow: 1` (Takes up remaining space). Set `display: flex; flex-direction: row`.
    - **Col 1:** Drag in "Content Slot". Set `width: 50%` or `flex: 1`. Enable `overflow-y: auto`.
    - **Col 2:** Drag in "Content Slot". Set `width: 50%` or `flex: 1`. Enable `overflow-y: auto`.
3.  **Footer:** Drag in a "Container" _below_ the Main Body. Set `height: auto` (or fixed). Set `display: flex; justify-content: space-between`.
    - **Slot Left:** Drag in "Content Slot". Set alignment `left`.
    - **Slot Right:** Drag in "Content Slot". Set alignment `right`.
4.  **Logo:** Drag in "Fixed Box". Set `position: absolute; top: 20px; right: 20px`.
5.  **Save:** Name "Dual Column Menu with Footer". Tag "Menu", "Digital Signage".

## Data Model (JSON Structure)

The editor produces a JSON object similar to:

```json
{
  "id": "layout_123",
  "name": "Dual Column Menu",
  "tags": ["menu", "1080p"],
  "root": {
    "type": "container",
    "styles": {
      "display": "flex",
      "flexDirection": "column",
      "height": "100%"
    },
    "children": [
      {
        "type": "container", // Main Body
        "styles": { "flex": "1", "display": "flex", "flexDirection": "row" },
        "children": [
          {
            "type": "slot",
            "id": "slot_main_left",
            "name": "Main Left",
            "styles": { "flex": "1", "overflow": "auto" }
          },
          {
            "type": "slot",
            "id": "slot_main_right",
            "name": "Main Right",
            "styles": { "flex": "1", "overflow": "auto" }
          }
        ]
      },
      {
        "type": "container", // Footer
        "styles": {
          "height": "auto",
          "display": "flex",
          "justifyContent": "space-between"
        },
        "children": [
          { "type": "slot", "id": "slot_footer_left", "name": "Footer Left" },
          { "type": "slot", "id": "slot_footer_right", "name": "Footer Right" }
        ]
      },
      {
        "type": "fixed", // Logo
        "styles": {
          "position": "absolute",
          "top": "20px",
          "right": "20px",
          "width": "100px",
          "height": "100px"
        },
        "content": { "type": "image_placeholder" }
      }
    ]
  }
}
```

## Integration Points

- **Skeleton Generation:** The JSON structure is passed to `TemplateSkeletonRenderer` (Spec 008) to auto-generate previews in the `LayoutTemplateSelector`.
- **Screen Manager:** Uses this JSON to know which "Slots" (`slot_main_left`, etc.) need content assigned.
