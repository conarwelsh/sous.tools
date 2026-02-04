# ADR 025: Labels Domain Strategy

## Status
Proposed

## Date
2026-02-03

## Context
Restaurants and commercial kitchens require specialized labeling for food safety (prep dates/expiration), inventory management (barcodes), and retail (grab-and-go). These labels need to be highly customizable and printable on-demand to various specialized thermal label printers.

**Key Requirements:**
- **Visual Design:** Leveraging the `LayoutManager` (ADR 023) to design label templates using a drag-and-drop interface.
- **Dynamic Data:** Binding label fields to platform data (e.g., Recipe names, Ingredient shelf-life, POS item prices).
- **Printer Orchestration:** Selecting and targeting specific label printers discovered by the `Hardware Domain` (ADR 017).
- **Print Job Management:** Sending formatted print commands (e.g., ZPL, TSPL, or ESC/POS) to printers via the `@sous/native-bridge` (ADR 011) on host nodes.

## Decision
We will implement the **Labels Domain** as the specialized engine for physical output orchestration.

### Domain Responsibilities & Logic

1.  **Label Template Management**
    - Utilizing the `LayoutManager` to create and store label-specific JSON templates.
    - Managing metadata such as label dimensions (e.g., 2"x1", 4"x6") and orientation.

2.  **Dynamic Rendering**
    - A server-side or client-side engine that hydrates label templates with real-time data (e.g., calculating an expiration date based on a recipe's "Prep Date" + "Shelf Life").
    - Generating barcodes (QR, UPC, Code128) based on platform IDs.

3.  **Hardware Targeting**
    - Interfacing with the `Hardware Domain` to identify printers with "Label" capabilities.
    - Routing print requests to the specific `HardwareNode` that hosts the printer.

4.  **Print Command Generation**
    - Converting the visual JSON layout into the specific control language required by the printer (handled primarily by the `@sous/native-bridge` in Rust for performance and reliability).

### Data Relationships
- **Layout Manager:** Provides the design canvas and template storage.
- **Hardware Domain:** Provides the list of active, reachable printers.
- **Recipes/Catalog Domain:** Provides the data (names, dates) to be printed on labels.

## Consequences
- **Positive:**
    - **Uniform Experience:** Label design uses the same tools as digital menu design.
    - **Compliance:** Automated date calculation reduces the risk of food safety violations caused by manual labeling errors.
    - **Hardware Flexibility:** Support for various printer brands through a unified bridge abstraction.
- **Negative:**
    - **Printer Protocol Complexity:** Supporting multiple label printer languages (ZPL vs TSPL) requires significant abstraction in the Rust bridge.
    - **Alignment Calibration:** Physical printing requires precise coordinate mapping to ensure text doesn't bleed off the edges of small labels.

## Research & Implementation Plan

### Research
- **ZPL/TSPL Protocols:** Researched the specialized languages used by thermal label printers.
- **Barcode Libraries:** Identified high-performance barcode generation tools for both JS and Rust.

### Implementation Plan
1. **Label Designer:** Extend the `LayoutManager` with label-specific constraints and dimensions.
2. **Dynamic Hydrator:** Build the logic that merges platform data into label templates.
3. **Print Driver:** Implement the ZPL/TSPL command generator in the `native-bridge`.
4. **Job Queue:** Build the print job management system for reliable delivery.
