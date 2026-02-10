# ADR 044: Two-Tier Presentation Engine

**Status:** Decided
**Date:** 2026-02-09

## Context

The platform requires a highly flexible way to manage digital signage and other visual outputs (POS, KDS). Static templates are too rigid for varied restaurant needs, but raw CSS is too complex for end-users. 

We need a system that:
1.  Allows structural reuse (Layouts).
2.  Supports dynamic data binding (Screens).
3.  Works across both physical hardware (RPi/Android) and standard web browsers.

## Decision

We have implemented a **Two-Tier Presentation Engine**:

### Tier 1: Layout Templates (Structural)
- Defines the "skeleton" of a display using a recursive `LayoutNode` tree.
- Uses standard CSS Flexbox/Grid properties for positioning.
- Contains "Content Slots" (placeholders) identified by unique IDs.
- Stored in the `templates` table as a structural JSON string.

### Tier 2: Screens (Functional)
- References a specific Layout Template.
- Maps real-world data sources (POS Categories, Media Library, Static JSON) to the slots defined in the template.
- Supports global CSS overrides for custom branding.
- Stored in the `screens` table.

### Communication
- Updates are pushed via **Socket.io** using the `presentation:update` event.
- The payload includes the full structural JSON and the resolved content bindings, allowing immediate, zero-refresh updates on hardware nodes.

## Consequences

- **Pros:**
  - High degree of reuse: One "Two Column" layout can be used for a Menu, a Welcome Screen, or a Beer List.
  - Real-time previews: The editor can render exactly what the hardware will show.
  - Decoupled data: Changing a menu category automatically updates all screens using that category without re-editing the screen.
- **Cons:**
  - Increased complexity in the rendering engine (recursive `TemplateSkeletonRenderer`).
  - Higher database load during initial fetch (requires joining templates, screens, and assignments).
