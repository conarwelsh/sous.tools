# Spec 007: Screen Manager

**Status:** Proposed
**Date:** 2026-02-09
**References:** Spec 006 (Layout Manager), Spec 008 (Presentation Shared Components), Spec 009 (Device Pairing)

## Objective

Create a highly intuitive, user-friendly interface for managing Digital Signage Screens. This tool allows users to select a pre-made Layout Template (from Spec 006), populate its "Content Slots" with real-world data, and assign the resulting screen to physical hardware or web endpoints.

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
- **Target Assignment:** Button to open the "Display Target Settings" modal (New).
- **Custom CSS:** Toggle to open a lightweight code editor for injecting overrides.
  - *Context:* Popover showing documentation for targetable classes (e.g., `.menu-item-list`, `.price-tag`).
- **Assets:** Quick access to the `ImageSelector` (Spec 008) and a dropzone for immediate uploads.
- **Save/Publish:** Actions to persist the screen configuration.

### 3. Content Assignment Workflow
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

### 4. Target Assignment (Hardware & Web)
A dedicated modal/panel for determining *where* this screen is displayed.

#### A. Physical Hardware (HDMI)
- **Source:** Queries the **Hardware Domain** for a list of active `Device` nodes and their available `Display` ports (e.g., "Kitchen Pi - HDMI 1", "Bar Controller - HDMI 2").
- **Status Indicators:** Shows if a port is "Available", "Offline", or "Assigned to [Screen Name]".
- **Assignment Logic:**
  - Selecting a port links this `ScreenConfig` to that hardware `DisplayId`.
  - **Steal Strategy:** If the user selects a port already assigned to another screen, a confirmation prompt appears: *"This port is currently showing 'Lunch Menu'. Do you want to overwrite it?"* Confirming updates the database and triggers a real-time refresh on the device.

#### B. Web / Smart TV (URL)
- **Slug Generation:** User defines a URL-friendly slug (e.g., `bar-menu-vertical`).
- **Access Control Mode:**
  - **Authenticated (Private):** Default. The URL requires a valid session or API key to load. Suitable for internal browser sources.
  - **Public (Subdomain):** Uses the tenant subdomain (e.g., `dtown-cafe.sous.tools/display/bar-menu-vertical`).
    - *Security:* If public, the endpoint verifies the subdomain matches the tenant ID of the screen configuration.
- **Copy Link:** Quick action to copy the full URL to the clipboard.

## Data Model (Schema)

```typescript
type ScreenConfig = {
  id: string;
  name: string;
  layoutId: string; // Reference to Layout Template
  customCss?: string;
  slots: Record<string, SlotAssignment>; // Keyed by Slot ID from Layout
  // Target Configuration
  assignments: {
    hardware?: string[]; // Array of Display IDs (HDMI ports)
    webSlug?: string;    // URL slug
    isPublic?: boolean;  // Access control
  }
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

## User Experience (UX) Flow

1. **Initialization:** User creates a new Screen -> Prompted to select a Layout via `LayoutTemplateSelector`.
2. **Visual Editor:** User sees the empty skeleton.
3. **Assignment:** User clicks "Main Column" -> Selects "POS Data" -> Chooses "Burgers" Category -> Selects "MenuItemList" component.
4. **Targeting:** User clicks "Assign Target".
   - Selects "Hardware" tab.
   - Sees "Front Counter Pi" is available.
   - Clicks "Assign".
5. **Save:** Configuration is saved. The "Front Counter Pi" immediately refreshes to show the new burger menu.
