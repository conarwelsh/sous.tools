# Spec 012: Invoice Manager

**Status:** Proposed
**Date:** 2026-02-09
**References:** Spec 013 (Shared Ingestion), ADR 019 (Invoices Domain), ADR 028 (Media Strategy)

## Objective

Create a streamlined interface for ingesting, verifying, and managing vendor invoices. This tool bridges the gap between physical paper trails and digital inventory tracking, utilizing AI to normalize vendor "chaos" (shortcodes, arbitrary units) into platform order.

## Core Features

### 1. Invoice List Dashboard

- **View:** A data table showing recent invoices.
- **Columns:** Date, Vendor, Invoice #, Total Cost, Status (Processing, Review Needed, Finalized).
- **Filters:** Date Range, Vendor, Status, Price Range.
- **Status Indicators:**
  - _Processing:_ animated spinner (AI is working).
  - _Review:_ Orange badge (User needs to verify mappings).
  - _Finalized:_ Green badge (Data committed to ledger).

### 2. Ingestion Workflow

Uses the **Shared Ingestion Components** (Spec 013).

1.  **Capture:** User scans paper invoice via `<DocumentIngestor />`.
2.  **Extraction:** Backend processes image.
    - _Extracts:_ Invoice ID, Date, Vendor Name, Total Amount.
    - _Extracts:_ Line Items (Description, Quantity, Unit, Unit Price, Total Price).
3.  **Deduplication Guard:**
    - Before showing the review screen, the system checks `(VendorID + InvoiceID)`.
    - If a match is found, warns the user: _"This invoice appears to be a duplicate of [Link to Invoice]."_

### 3. Verification & Mapping (The "Review" State)

Uses the `<IngestionReviewer />` (Spec 013) with specific Invoice logic:

- **Header Validation:**
  - User confirms the Invoice Date (critical for Price History logic).
  - User confirms Vendor (links to `Procurement` domain).
- **Line Item Mapping (`<EntityMapper />`):**
  - **Input:** Vendor Shortcode/Description (e.g., "55012 AVOCADO 48CT").
  - **Target:** Platform Ingredient (e.g., "Avocado, Hass").
  - **Unit Conversion:**
    - Detects "Case" vs "Each".
    - _UI:_ "Vendor says 1 CS. We count this by: [Piece]. How many Pieces in 1 CS? [48]".
    - _Memory:_ System saves "Vendor 55012 = 48 Pieces of Avocado" for future scans.
- **Shortage Handling:**
  - A checkbox per line item: "Not Delivered".
  - If checked, the item cost is removed from the Inventory update but tracked as a "Shortage" event for vendor grading.
- **Math Guard:**
  - `Sum(Line Items) - Shortages` must equal `Invoice Total`.
  - If not, UI shows a red warning: _"Line items sum to $450.00 but Invoice Total is $455.00. Check for tax or delivery fees."_

### 4. Retention Policy & Data Persistence

- **Message:** A persistent notice in the upload area: _"Invoice images are retained for 30 days for verification, then securely deleted. Extracted data is permanent."_
- **Persistence:**
  - On "Finalize":
    1. Update `Inventory` levels (add quantities).
    2. Update `PriceHistory` for each ingredient (date, price).
    3. Update `Catalog` current prices.
    4. Save the "Mapping Logic" (Shortcodes/Conversions) for the Vendor.

## UX / Quick Actions

- **App Shortcut:** Long-press App Icon -> "Scan Invoice" (deep links to `<DocumentIngestor />`).
- **Browser Share:** Share PDF from email app -> Sous Tools -> Invoice Ingest.

## Data Model Extensions

```typescript
type Invoice = {
  id: string;
  vendorId: string;
  externalInvoiceId: string; // The number on the paper
  date: Date;
  totalAmount: number;
  status: "DRAFT" | "FINALIZED";
  lineItems: InvoiceLineItem[];
  imageUrl?: string; // Ephemeral URL
};

type VendorMapping = {
  vendorId: string;
  externalCode: string; // "55012"
  externalDescription: string; // "AVOCADO 48CT"
  ingredientId: string;
  conversionFactor: number; // 48
  conversionUnit: string; // "Piece"
};
```
