# ADR 023: Layout Manager Domain Strategy

## Status
Proposed

## Date
2026-02-03

## Context
Our platform needs to drive diverse visual outputs, primarily Digital Menu Boards (@sous/native-headless), but also potentially web embeds or mobile views. We require a flexible, non-technical way for users to design these layouts without writing code.

**Key Requirements:**
- **Visual Editor:** A drag-and-drop WYSIWYG interface.
- **Template System:** Layouts are saved as structured JSON templates defining content blocks and their positions.
- **Content Block Types:**
    - **Image:** Integrated with a tenant-scoped asset gallery and drag-and-drop uploader.
    - **Video:** Support for background or feature videos.
    - **Hard-coded Content:** User-provided text or HTML.
    - **POS Content:** Real-time integration with the `@sous/native-pos` domain. Users can filter by category, select specific items, and apply visual-only overrides like "Featured" or "Sold Out" styling.
- **Component Selection:** For each block, users can choose which React component (from `@sous/ui`) will be used to render the data.
- **Styling:** Support for both block-level style overrides and global theme inheritance from the Admin domain (ADR 022).

## Decision
We will implement the **Layout Manager Domain** as a specialized visual orchestration layer.

### Domain Responsibilities & Logic

1.  **Template Engine**
    - Managing the CRUD operations for JSON-based layout schemas.
    - Versioning of templates to allow rolling back design changes.

2.  **Asset Management Integration**
    - Providing a modal-based gallery to browse tenant assets.
    - Handling instant uploads to the tenant's storage bucket (Supabase/S3).

3.  **Data Source Binding**
    - The "Bridge" logic that connects a content block to a data source (e.g., POS API).
    - Handling the "Display-Only Overrides" logic where an item's status can be visually modified for a specific display without affecting the master POS record.

4.  **Renderer Mapping**
    - A registry that maps JSON block types to specific `@sous/ui` React components.

### Implementation Details
- **Editor:** Built using a robust React-based drag-and-drop library (e.g., `dnd-kit` or `react-grid-layout`).
- **Data Persistence:** Layout JSON is stored in PostgreSQL via Drizzle ORM.
- **Real-time Preview:** Utilizing the same React components used in production to ensure "What You See Is What You Get."

## Consequences
- **Positive:**
    - **Extreme Flexibility:** Allows users to create unique brand experiences without developer intervention.
    - **Real-time Updates:** Changes in the Layout Manager can be pushed instantly to all headless nodes via WebSockets (ADR 010).
    - **Reusability:** Templates can be shared across multiple locations or organizations.
- **Negative:**
    - **Complexity:** Building a reliable, performant WYSIWYG editor is a significant engineering challenge.
    - **Schema Evolution:** As we add new block types or components, we must ensure backward compatibility for existing saved templates.

## Research & Implementation Plan

### Research
- **React Grid Layout:** Evaluated as the core engine for the visual drag-and-drop editor.
- **JSON Schemas:** Researched structured data models for representing visual layouts.

### Implementation Plan
1. **Editor Core:** Build the drag-and-drop canvas and block management logic.
2. **Block Library:** Implement the initial set of content blocks (Image, Video, POS).
3. **Data Binding:** Build the interface for connecting blocks to platform data sources.
4. **Template Persistence:** Implement the JSON storage and versioning system.
