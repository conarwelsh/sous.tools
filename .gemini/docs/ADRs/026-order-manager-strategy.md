# ADR 029: Order Manager Strategy

## Status

Proposed

## Date

2026-02-03

## Context

Efficient procurement in a restaurant is a collaborative, ongoing process. Chefs and staff need to build "order lists" throughout the week as they notice stock depletion. This process needs to be intelligent, automatically optimizing for cost and vendor relationships, and ultimately reconciling with actual deliveries.

**Key Requirements:**

- **Collaborative Order List:** Real-time addition of items from any device (`@sous/native`, `@sous/native-pos`, etc.) as needs are identified.
- **Intelligent Grouping:** Automatic grouping of items by Vendor based on:
  - Last purchased vendor (Historical preference).
  - Current cheapest vendor (from "Vendor Wars" data - ADR 020).
- **Vendor-Specific Lifecycle:** Ability to mark specific vendor groups as "Ordered" independently (to match different delivery schedules).
- **History & Tracking:** Moving ordered items to a "Past Orders" tab for visibility.
- **Automated Reconciliation:** When a new `Invoice` is processed (ADR 019), the system must attempt to match it to an open or recent "Order" to verify fulfillment accuracy and price consistency.

## Decision

We will implement the **Order Manager** as the centralized procurement orchestration tool, bridging the gap between identified needs (Inventory) and final expenditures (Invoices).

### Domain Responsibilities & Logic

1.  **Dynamic Order List**
    - A shared, real-time list of `RequestedItems`.
    - Logic to automatically assign a `SuggestedVendor` based on the intersection of `PriceWar` data and `PurchaseHistory`.

2.  **Vendor Grouping & Workflow**
    - Interface allows "Closing" an order for a specific vendor.
    - This generates a `PurchaseOrder` (PO) entity and moves the items to the `Ordered` status.

3.  **Invoice Reconciliation Engine**
    - A matching algorithm that triggers upon Invoice finalization.
    - It compares Invoice line items against pending or recently completed POs.
    - Discrepancies (Shortages, Price Increases, Substituted Items) are flagged for user review.

4.  **Integration**
    - **Inventory Domain:** Feeds the Order Manager with "Need to Order" alerts (ADR 028).
    - **Invoices Domain:** Feeds the reconciliation engine with finalized delivery data.
    - **Ingredients Domain:** Provides the "Vendor Wars" intelligence for cost optimization.

## Consequences

- **Positive:**
  - **Cost Savings:** Encourages ordering from the cheapest vendor without manual research.
  - **Accountability:** Automated reconciliation identifies vendor errors (short-ships or over-charges) instantly.
  - **Operational Speed:** Reduces the "Ordering" window from hours to minutes by pre-grouping identified needs.
- **Negative:**
  - **Matching Logic Complexity:** Reconciling an invoice ("1 Case XL Eggs") with an order ("12 dozen eggs") requires robust unit normalization.
  - **User Friction:** If the automatic vendor assignment is wrong, it requires easy manual override tools to avoid user frustration.

## Research & Implementation Plan

### Research

- **Procurement Workflows:** Analyzed the "Order Guide" patterns used by major broadline distributors (e.g., Sysco, US Foods).

### Implementation Plan

1. **Order List:** Build the collaborative real-time list for requesting items.
2. **Vendor Optimizer:** Implement the logic that suggests vendors based on price and history.
3. **Purchase Order Engine:** Build the workflow for finalizing and tracking vendor orders.
4. **Reconciliation Tool:** Implement the automated matching logic for comparing invoices to POs.
