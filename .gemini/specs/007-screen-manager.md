# Spec 007: Screen Manager

**Status:** Proposed
**Date:** 2026-02-09
**References:** Spec 006 (Layout Manager), Spec 008 (Presentation Shared Components), Spec 017 (Hardware Domain)

## Objective

Create a highly intuitive, user-friendly interface for managing Digital Signage Screens. This tool allows users to select a pre-made Layout Template (from Spec 006) and populate its "Content Slots" with real-world data (POS items, Images, Custom JSON) to create dynamic menu boards and promotional displays.

## Core Features

### 1. Live Preview Canvas
- **Full Screen Context:** The main editor area renders the selected Layout Template at 100% width/height of the container.
- **Skeleton Rendering:** Uses the shared `TemplateSkeletonRenderer` (Spec 008) to visualize the grid/flex structure.
- **Interactive Slots:**
  - Hovering over a defined content slot reveals a "Slot Action Bar" (Edit, Clear).
  - Empty slots show a distinct visual state ("Empty Slot").
  - Populated slots render a live preview of the assigned content (where feasible) or a high-fidelity representation.

### 2. Floating Toolbar (Draggable)
A persistent, draggable tool palette containing global screen settings:
- **Layout Switcher:** Button to open the `LayoutTemplateSelector` (Spec 008).
- **Custom CSS:** Toggle to open a lightweight code editor for injecting overrides.
  - *Context:* Popover showing documentation for targetable classes (e.g., `.menu-item-list`, `.price-tag`).
- **Assets:** Quick access to the `ImageSelector` (Spec 008) and a dropzone for immediate uploads.
- **Save/Publish:** Actions to persist the screen configuration.

### 3. Target Assignment (Display Output)
A section in the Toolbar or a dedicated "Publish" modal to define *where* this screen is shown.

#### A. Hardware Assignment (HDMI)
- **Discovery:** Queries the **Hardware Domain** for a list of registered Signage Nodes and their available HDMI ports.
  - *UI:* Dropdown list: "Kitchen Display 1 (HDMI-0)", "Lobby TV (HDMI-1)".
- **Conflict Resolution:** If a user selects a port that is already assigned to another screen:
  - Show a warning: "This port is currently showing 'Lunch Menu A'. Assigning it here will override that screen."
  - Action: "Steal Assignment" (Updates the `displayAssignments` table, clearing the old link and setting the new one).

#### B. URL Access (Headless/Browser)
- **Authenticated Link:** A direct internal URL (e.g., `https://sous.tools/admin/screens/preview/[id]`) for testing or internal dashboards. Requires Platform Login.
- **Public/Permalink:** A specialized subdomain route (e.g., `https://[tenant-slug].sous.tools/display/[screen-id]`) or a shortened slug.
  - *Use Case:* Smart TVs with built-in browsers that cannot run the Native App.
  - *Security:* Uses the Tenant Slug to scope the request. Optionally secured via a "Display Key" URL parameter if needed.

### 4. Content Assignment Workflow
Clicking "Edit" on a slot opens the **Content Configuration Modal**:

#### A. Data Source Selection
- **POS Data:** Connect to the Organization's Catalog/Menu.
  - *Filters:* Select by Category (e.g., "Draft Beers"), Tags, or manual Item selection.
  - *Overrides:* A UI to re-order items, mark specific items as "Featured", or force a "Sold Out" state (overriding the live POS status).
- **Media:** Select a single image or video from the `ImageSelector`.
- **Static JSON:** Manual entry of a JSON object/array for custom components.

#### B. Component Selection
- After selecting data, the user chooses *how* to render it.
- **Registry:** A list of available `@sous/ui` presentation components compatible with the data type.
  - *Example (POS Data):* `MenuItemList`, `HeroItem`, `PriceList`.
  - *Example (Media):* `Image`, `VideoPlayer`, `Slideshow`.
- **Props Editor:** Simple form controls to tweak component specific props (e.g., `showDescription`, `columns`, `imageSize`).

### 5. Data Merging & Overrides
- **Runtime Strategy:** The Screen configuration stores *intent* (e.g., "Show Category A, but hide Item X").
- **Presentation Layer:** When the actual Signage Node renders the screen:
  1. Fetches live POS data.
  2. Applies the stored filters/sorts.
  3. Merges the manual overrides (e.g., "Featured" badge).
  4. Injects the computed data into the selected Component.

## Data Model (Schema)

```typescript
type ScreenConfig = {
  id: string;
  name: string;
  layoutId: string; // Reference to Layout Template
  customCss?: string;
  // Assignment Data
  assignments: {
    hardwareNodeId?: string;
    hdmiPort?: number;
    publicSlug?: string;
  }[];
  slots: Record<string, SlotAssignment>; // Keyed by Slot ID from Layout
};

type SlotAssignment = {
  sourceType: 'POS' | 'MEDIA' | 'STATIC';
  dataConfig: {
    filters?: { categoryId?: string; tags?: string[] };
    overrides?: Record<string, { featured?: boolean; soldOut?: boolean; hidden?: boolean }>;
    staticData?: any;
    mediaId?: string;
  };
  component: string; // e.g., 'MenuItemList'
  componentProps: Record<string, any>;
};
```