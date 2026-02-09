# ADR 022: Presentation Domain Strategy (Visuals & Output)

## Status

Decided

## Date

2026-02-04 (Merged)

## Context

Our platform drives diverse visual outputs: digital menu boards, authenticated web views, and physical thermal labels. All these outputs rely on a common need for a visual editor and dynamic data binding.

## Decision

We will unify these concerns under the **Presentation Domain**.

### 1. Two-Tier Layout Architecture

To ensure maximum reusability and specialized UX, the Presentation Domain will be split into two distinct functional layers:

#### A. Structural Template Editor

- **Role:** Designing the "Skeleton" of a layout.
- **Capabilities:** Users define the grid structure (e.g., 2 columns, fixed sidebar, responsive footer).
- **Content Slots:** Instead of actual data, the designer defines "Content Slots" (placeholders).
- **System Templates:** A set of core structural templates will be seeded by default to cover standard use cases.

#### B. Specialized Specialized Content Editors (Displays & Labels)

Once a structure is chosen, specialized WYSIWYG editors allow for targeted data binding:

- **Display Editor:** Optimized for high-resolution screens (TVs/Tablets). Allows assigning video, real-time POS feeds, and interactive menus to the slots.
- **Label Editor:** Optimized for thermal print dimensions. Allows binding slots to granular culinary data (expiration dates, barcodes, item weights).

### 2. Content Types & Data Binding

Content assigned to slots can be:

- **Media:** Images/Video from the Media Domain (ADR 028).
- **Static:** Manually defined JSON or text.
- **Dynamic:** Live streams from POS, Inventory, or Culinary domains.

### 3. Output Targets

- **Digital Screens:** Mapping logical `Display` entities to HDMI ports on hardware nodes (Tauri) or authenticated web URLs.
- **Labels:** Hydrating templates with real-time culinary data and routing to thermal printers via the Native Bridge.

### 3. Real-Time Orchestration

- Utilizing the Real-time Gateway (Socket.io) to push "Hot-Reload" events to active displays and printer nodes when templates are modified.

## Consequences

- **Positive:** Single source of truth for all visual designs; shared component mapping; consistent data binding logic.
- **Negative:** Designing a single editor that handles both high-res screens and low-res thermal labels requires flexible constraint management.
