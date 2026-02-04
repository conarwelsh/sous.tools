# ADR 026: Accounting & Financial Intelligence Domain Strategy

## Status
Proposed

## Date
2026-02-03

## Context
For a restaurant to be successful, it needs more than just operational efficiency; it needs deep financial visibility. We need a centralized domain to aggregate data from sales (POS), procurement (Invoices), and production (Recipes) to provide a comprehensive financial picture.

**Key Requirements:**
- **Sales Intelligence:** Tracking revenue, top-selling items, and volume trends (from `@sous/native-pos`).
- **Profitability Analysis:** Calculating true margins by merging sales volume with real-time recipe costing (from `@sous/api/src/recipes`).
- **COGS (Cost of Goods Sold):** Automated calculation of COGS based on inventory depletion and invoice pricing.
- **Financial Reporting:** Generating Profit & Loss (P&L) statements, labor cost analysis, and tax reporting data.
- **Procurement Strategy:** High-level summaries of "Vendor Wars" (ADR 020) to identify which vendors are providing the most value across the entire catalog.

## Decision
We will establish the **Accounting Domain** as the financial analytical core of the platform.

### Domain Responsibilities & Logic

1.  **Financial Aggregator Service**
    - Pulling data from the `POS`, `Invoices`, and `Recipes` domains to create a unified financial ledger.
    - Normalizing disparate data points (e.g., matching a POS MenuItem to a Recipe).

2.  **Performance Analytics**
    - **Top Performers:** Identifying items that are both high-volume and high-margin ("Stars").
    - **Underperformers:** Identifying "Dogs" (low volume, low margin) or "Puzzles" (high margin, low volume) to guide menu engineering.

3.  **COGS & Inventory Reconciliation**
    - Calculating the theoretical vs. actual food cost by comparing sales-based depletion against invoice-based procurement.

4.  **Vendor Performance Auditing**
    - Aggregating "Price War" data over time to grade vendors on pricing stability, fulfillment accuracy, and overall value.

### Data Relationships
- **POS Domain:** Provides the revenue and sales volume data.
- **Invoices Domain:** Provides the expenditure and procurement data.
- **Recipes Domain:** Provides the theoretical cost data for margin calculations.
- **Ingredients Domain:** Provides the market intelligence data for procurement strategy.

## Consequences
- **Positive:**
    - **Single Source of Financial Truth:** Owners no longer need to export spreadsheets from multiple systems to see their profit.
    - **Menu Engineering:** Data-driven insights allow for scientific adjustments to menus and pricing.
    - **Waste Identification:** Discrepancies between COGS and sales help identify waste or theft.
- **Negative:**
    - **Integration Complexity:** Requires perfect data integrity across POS, Invoices, and Recipes to be accurate.
    - **Processing Overhead:** Aggregating large volumes of transaction and procurement data for real-time reporting can be computationally expensive.

## Research & Implementation Plan

### Research
- **Menu Engineering:** Researched the "Stars, Dogs, Puzzles, Plowhorses" matrix for restaurant performance analysis.
- **Financial Schemas:** Analyzed common P&L structures for independent and multi-unit restaurants.

### Implementation Plan
1. **Accounting Module:** Build the NestJS module for financial aggregation and reporting.
2. **Performance Engine:** Implement the analytical logic for item-level profitability and volume analysis.
3. **COGS Calculator:** Build the logic that correlates sales depletion with procurement costs.
4. **Reporting UI:** Create the financial dashboards and P&L generation tools.
