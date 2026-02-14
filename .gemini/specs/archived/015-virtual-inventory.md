# Spec 015: Virtual Inventory & Stock Ledger

**Status:** Proposed
**Date:** 2026-02-09
**References:** Spec 011 (Recipes), Spec 012 (Invoices), Spec 014 (Order Manager)

## Objective

Create a "Virtual Inventory" system that provides a real-time, theoretical calculation of current stock levels. By correlating "Inflow" (Procurement/Invoices) with "Outflow" (Sales/Recipes) and "Leakage" (Waste), the system maintains a running ledger of every ingredient. This data powers low-stock alerts, automated ordering suggestions, and profitability analysis.

## Core Logic: The Stock Ledger

The heart of this domain is the `StockLedger`, an event-driven calculator.

### 1. The Equation

`Current Stock = (Last Physical Count) + (Invoices Since Count) - (Theoretical Depletion via Sales) - (Reported Waste)`

### 2. Unit Normalization

All calculations MUST occur in the **Base Unit** defined in the Catalog for that ingredient.

- _Example:_
  - Invoice: "1 Case of Tomatoes (25 lbs)" -> Converter -> `11,340 grams` (Inflow).
  - Recipe: "Tomato Slice (30g)" \* 10 Sold -> `300 grams` (Outflow).
  - Ledger Impact: `+11,040 grams`.

### 3. Wastage Logic

- **Recipe Wastage:** Defined in Recipe Manager (Spec 011). If a recipe uses 100g of Onion but has a 10% wastage factor, the ledger deducts 110g per sale.
- **Incident Wastage:** Spills, drops, or spoilage reported via apps.

### 4. Event Triggers

- **`InvoiceFinalized`:** Increases stock. Sourced from Invoices Domain.
- **`POSOrderFinalized`:** Decreases stock. Sourced from POS/Integrations. Requires "Exploding" menu items into ingredients via Recipe logic.
- **`WasteReported`:** Decreases stock. Sourced from KDS/POS manual entry.
- **`StockAudit` (Physical Count):** Resets stock to a hard number. The difference between _Virtual_ and _Physical_ is recorded as **Variance** (Cost of Goods Lost).

## User Interfaces

### 1. Inventory Manager Page

The central dashboard for managing stock.

#### Features

- **Global Inventory Table:**
  - Columns: Ingredient Name, Category, Last Purchased Price, Vendor, **Virtual Stock Level**, Par Level, Status.
  - **Visuals:** Stock levels represented as progress bars relative to "Par Level".
    - Green: > Par
    - Yellow: Approaching Par (Warning)
    - Red: Below Par (Critical)
- **Filters:** By Category, Vendor, or Status (e.g., "Show Low Stock Only").
- **Quick Actions:**
  - "Add to Order List": Pushes item to Order Manager.
  - "Adjust Stock": Manual correction (Waste/Spill/Audit).
  - "View History": Opens the Ledger Log for that item.

### 2. Wastage Reporting (Incident Hub)

A specialized modal/view available on **POS**, **KDS**, and **Manager Tools**.

- **Quick Entry:** Select Ingredient -> Enter Qty -> Select Reason (Spilled, Spoiled, Burned, Returned).
- **Voice Command (Wear OS / Mobile):**
  - _"Tell Sous I spilled a gallon of mayo."_
  - System parses "Mayo" -> `Mayonnaise`, "Gallon" -> `3.78L`.
  - Creates a `WasteReported` event automatically.

### 3. Physical Count Mode (Audit)

A specialized mobile-first view for performing actual inventory counts.

- **Barcode Scanning:**
  - Users can scan UPC/EAN codes on boxes/cans.
  - System looks up the `Ingredient` associated with that barcode (established during Invoice Ingestion).
  - _Feedback:_ Beeps on success, prompts to map new barcodes if unknown.
- **Workflow:**
  1. User selects "Start Count" (Full Inventory or Specific Category/Location).
  2. UI shows list of items expected in that location.
  3. User enters actual counts (e.g., "2.5 Cases", "4 bottles").
  4. System calculates totals and compares to Virtual Stock.
  5. User submits Audit -> Ledger is "Trued Up".

### 4. Ubiquitous Data Hooks

Inventory data must be injected into other domains:

- **Recipe Manager:** When viewing a recipe, if an ingredient is Critical/Red, show a warning: _"Low Stock: Butter (Only 200g remaining)"_.
- **Order Manager:** Automatically populate the "Suggestions" tab with items below Par.
- **Ingredient Detail:** Show the "Burn Rate" (Average depletion per day) to help set accurate Par levels.

## Configuration

- **Par Level:** The minimum amount required on hand before re-ordering.
- **Reorder Quantity:** The standard amount to buy (e.g., "1 Case").
- **Storage Locations:** Mapping ingredients to physical locations (Walk-in, Dry Storage, Line) to organize the Physical Count workflow.

## Technical Considerations

- **Performance:** Exploding POS sales into ingredients can be heavy. This should be an asynchronous job (BullMQ) that processes sales batches (e.g., every 15 mins or immediately on `OrderFinalized` webhook) to update the ledger without blocking the UI.
- **Negative Stock:** The system must allow negative stock (indicating a missed invoice or recipe error) but flag it aggressively as a data anomaly.
