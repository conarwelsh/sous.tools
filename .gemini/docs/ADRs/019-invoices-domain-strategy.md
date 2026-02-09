# ADR 019: Invoices Domain Strategy

## Status

Proposed

## Date

2026-02-03

## Context

Accurate financial tracking and recipe costing depend on up-to-date pricing for "Raw Materials". Manually entering invoices from various vendors is error-prone and time-consuming. We need a domain that automates the ingestion of these documents and maintains a granular history of ingredient costs.

**Key Requirements:**

- **Automated Ingestion:**
  - Scanning via mobile camera or network scanners.
  - Support for digital PDF uploads.
- **Intelligent Extraction:**
  - OCR and AI to extract line items, quantities, prices, taxes, and vendor details from unstructured documents.
- **Catalog Synchronization:**
  - Automatically updating the `Catalog` with new ingredients or supply items.
  - Updating the "Current Price" for existing ingredients.
- **Historical Analysis:**
  - Tracking the full price history of every ingredient.
  - Linking prices to specific vendors to enable price comparison and trend analysis.

## Decision

We will establish the **Invoices Domain** as the primary engine for supply-side data ingestion and cost auditing.

### Key Components & Logic

1.  **Ingestion & Processing Pipeline**
    - **OCR/AI Engine:** Similar to the Recipes Domain (ADR 018), this will use specialized models to parse varied invoice formats (handwritten receipts, formal PDFs).
    - **Mapping Logic:** A "Learning" mapper that associates vendor-specific item names (e.g., "SYSCO RED TOM 5X6") with the platform's normalized ingredients (e.g., "Tomato, Red").

2.  **Price Tracking Service**
    - **Price History Ledger:** Every processed invoice creates entries in a `PriceHistory` table, recording `price`, `quantity`, `unit`, `vendorId`, and `date`.
    - **Current Price Update:** Upon successful processing, the "Current Price" for the corresponding `Ingredient` in the Catalog is updated, triggering a downstream cost recalculation for all related Recipes (ADR 018).

3.  **Vendor Management**
    - Managing vendor profiles, contact information, and account details.
    - Tracking vendor-specific SKU/Item codes.

### Data Relationships

- **Invoices** create/update **Ingredients** (Catalog Domain).
- **Price History** is consumed by the **Recipes Domain** for costing and reporting.

## Consequences

- **Positive:**
  - **Real-time Costing:** Recipe costs are always accurate based on the very last purchase.
  - **Auditing:** Easy access to historical documents for tax or discrepancy purposes.
  - **Vendor Accountability:** Ability to identify price gouging or discrepancies between vendors.
- **Negative:**
  - **Mapping Complexity:** Initial setup requires the user to "teach" the system how to map vendor items to ingredients.
  - **Data Integrity:** Errors in AI extraction (e.g., misreading a decimal point) could lead to massive errors in recipe costing if not verified by a human.

## Research & Implementation Plan

### Research

- **OCR Technologies:** Researched specialized invoice-parsing AI (e.g., Mindee or custom LLM prompts) for high-accuracy line-item extraction.

### Implementation Plan

1. **Invoice Processor:** Build the AI pipeline that extracts data from invoice scans and PDFs.
2. **Mapping Interface:** Create the UI for users to "teach" the system how to map vendor items to ingredients.
3. **Price Ledger:** Implement the historical price tracking and vendor management system.
4. **Catalog Integration:** Build the logic that automatically updates ingredient "Current Price" upon invoice finalization.
