# ADR 047: Polymorphic Layout Architecture

## Status

Accepted

## Context

Originally, the presentation domain was split into `templates` (structural skeletons) and `screens` (data-bound instances). As the platform expanded to include **Thermal Labels** and **Web Pages**, maintaining separate tables and specialized logic for each output channel became increasingly redundant. Both labels and screens share 90% of the same requirements: a recursive JSON structure, slot-based data bindings, and specific metadata (dimensions for labels, slugs for pages).

## Decision

We will unify all visual entities into a single, polymorphic `layouts` table.

1.  **Unified Schema**: Replace `templates` and `screens` with a single `layouts` table.
2.  **Type-Based Discrimination**: Use a `type` column to differentiate between `TEMPLATE`, `SCREEN`, `LABEL`, and `PAGE`.
3.  **Core Columns**:
    - `structure`: Recursive JSON tree of visual elements.
    - `content`: Mapping of Slot IDs to data sources (POS, Media, Static).
    - `config`: Type-specific metadata (web slugs, physical dimensions, refresh rates).
4.  **Derivation Pattern**: Allow layouts to optionally reference a `parentId`, enabling a "Template -> Instance" workflow while maintaining the same data structure.
5.  **Polymorphic UI**: Refactor the `LayoutDesigner` to dynamically adapt its interface based on the active layout type.

## Consequences

- **Reduced Complexity**: Single set of CRUD operations and services for all visual outputs.
- **Increased Flexibility**: New output types (e.g., Reports, Kiosk Menus) can be added by simply defining a new type and configuration schema.
- **Faster Iteration**: Design improvements to the `LayoutDesigner` immediately benefit all channels (screens, labels, and pages).
- **Data Migration**: Existing templates and screens must be migrated to the new schema.
- **Real-time Payloads**: Hardware nodes will receive more cohesive updates that include both structure and content in a single push.
