# ADR 028: Virtual Inventory & Order Management Strategy

## Status
Proposed

## Date
2026-02-03

## Context
Traditional manual inventory counts are labor-intensive and often outdated by the time they are finished. We need a "Virtual Inventory" system that tracks stock levels in real-time by correlating procurement data with production/sales data.

**Key Requirements:**
- **Inbound Tracking:** Automatic stock incrementing via `Invoices` domain processing (ADR 019).
- **Outbound Tracking:** Automatic stock decrementing based on POS sales (`@sous/native-pos`) cross-referenced with `Recipe` ingredient quantities (ADR 018).
- **Wastage Ingestion:** Recording "Incidents" (waste, spoilage, breakage) from `@sous/native-kds`, `@sous/native`, and `@sous/native-pos` to maintain accuracy.
- **Alerting:** Automated "Need to Order" notifications when virtual stock falls below defined thresholds.
- **Order Management:** A centralized view to manage procurement, prioritizing items identified by the alerting system.

## Decision
We will implement the **Inventory Domain** as a reactive "Stock Ledger" that aggregates events from across the platform.

### Domain Responsibilities & Logic

1.  **The Stock Ledger**
    - Maintaining the current `onHand` quantity for every `Ingredient` in the `Catalog`.
    - Recording every stock movement (In, Out, Waste) as a ledger entry for auditing.

2.  **Theoretical Depletion Engine**
    - A service that listens for `OrderFinalized` events from the POS.
    - It explodes the ordered items into their component ingredients (via the Recipes domain) and decrements the inventory.
    - *Formula:* `CurrentStock = (InvoicesSum) - (SalesDepletionSum) - (WasteIncidentsSum)`.

3.  **Low-Stock Alerting**
    - Each ingredient can have a `ParLevel` (minimum required stock).
    - When `onHand < ParLevel`, an alert is generated and the item is flagged in the **Order Manager**.

4.  **Order Manager (Future Implementation)**
    - A dedicated interface for creating and tracking purchase orders.
    - It prioritizes items with "Need to Order" alerts and utilizes "Vendor Wars" intelligence (ADR 020) to suggest the best supplier.

### Integration Points
- **Invoices Domain:** Sources the "In" movement.
- **Recipes/POS Domain:** Sources the "Out" (Theoretical) movement.
- **KDS/POS/Native Apps:** Source the "Waste" movement via Incident reporting.

## Consequences
- **Positive:**
    - **Real-time Visibility:** Managers know their stock levels without performing a physical count.
    - **Reduced Waste:** Early identification of slow-moving items or high-waste areas.
    - **Efficient Ordering:** The system tells the chef what to order, reducing over-purchasing.
- **Negative:**
    - **Accuracy Risk:** The "Virtual" inventory is only as accurate as the Recipes and Invoice mapping. Regular (though less frequent) "Physical Spot Checks" will still be required to calibrate the system.
    - **Yield Complexity:** Accounting for ingredient yield (e.g., a 50lb bag of onions only yields ~40lb of chopped onions) requires precise conversion factors in the Catalog.

## Research & Implementation Plan

### Research
- **Inventory Management:** Analyzed "First-In-First-Out" (FIFO) vs "Weighted Average" costing models for virtual inventory.

### Implementation Plan
1. **Stock Ledger:** Build the core event-driven ledger for tracking all ingredient movements.
2. **Depletion Engine:** Implement the logic that "explodes" POS orders into ingredient depletions.
3. **Wastage Hub:** Build the interface for recording waste and spoilage incidents.
4. **Alerting Engine:** Implement the "Need to Order" notification system based on par levels.
