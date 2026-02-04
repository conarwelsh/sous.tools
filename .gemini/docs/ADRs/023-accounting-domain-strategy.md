# ADR 023: Accounting & Financial Strategy (Historical & Statutory)

## Status
Proposed

## Date
2026-02-04 (Updated)

## Context
While the **Intelligence Domain** handles real-time volatility and predictive costing, the platform requires a dedicated domain for "Source of Truth" historical reporting and statutory compliance (Taxes, P&L, COGS).

## Decision
The **Accounting Domain** will serve as the historical financial core, consuming data from finalized operational events and Intelligence snapshots.

### Domain Responsibilities & Logic

1.  **Historical Ledger Service**
    - Aggregating data from `POS` (Sales), `Procurement` (Finalized Invoices), and `Intelligence` (Costing Snapshots) to build an immutable historical record.
    - **Data Dependency:** This domain *consumes* snapshots from the Intelligence domain rather than recalculating them to ensure reporting consistency.

2.  **Statutory Reporting**
    - **P&L Generation:** Automated Profit & Loss statements based on calendar periods.
    - **Tax Intelligence:** Tracking VAT/Sales Tax based on location-specific rules defined in the Admin domain.

3.  **COGS Reconciliation**
    - Finalizing the Cost of Goods Sold by comparing historical procurement totals against sales depletion.

4.  **Vendor Auditing**
    - Grading vendor fulfillment accuracy and pricing stability over long-term historical windows.

## Consequences
- **Positive:** Clear separation between "What's happening now" (Intelligence) and "What happened then" (Accounting); ensures reporting never changes even if recipe math is updated later.
- **Negative:** Dependent on the stability of the Intelligence domain's snapshot exports.