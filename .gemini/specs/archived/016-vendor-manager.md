# Spec 016: Vendor Manager

**Status:** Proposed
**Date:** 2026-02-09
**References:** Spec 014 (Order Manager), Spec 012 (Invoice Manager), Spec 015 (Virtual Inventory)

## Objective

Centralize the management of third-party suppliers, their operational constraints (schedules/minimums), and their product identifiers (Barcodes/SKUs). This domain ensures the Order Manager (Spec 014) can make intelligent procurement suggestions and the Virtual Inventory (Spec 015) can be audited via barcode scanning.

## Core Features

### 1. Vendor Profiles

- **Contact Information:** Primary representative, phone, email, emergency contact.
- **Account Details:** Customer ID, payment terms, preferred ordering method (Email, Portal, SMS).
- **Service Scoping:** Assign vendors to specific **Locations** or the entire **Organization**.

### 2. Operational Logic

- **Delivery Schedules:**
  - Day-of-week selector (e.g., "Delivers Monday, Wednesday, Friday").
  - **Impact:** The Order Manager uses this to flag "Next Order Due" dates and warn if an item is needed before the next possible delivery.
- **Order Minimums:**
  - Configurable threshold (e.g., "$500 minimum" or "200 lbs minimum").
  - **Impact:** Order Manager shows a "Minimum Progress Bar" when building an order for this vendor.

### 3. Product & Barcode Mapping

The "Rosetta Stone" for vendor items.

- **Item Registry:** A list of items provided by this vendor.
- **Mapping:** Links Vendor SKU/Name (from Invoices) to platform Ingredients.
- **Barcode Management:**
  - Ability to store/scan **UPC/GTIN** or **Vendor-Specific Barcodes**.
  - **Usage in Stocktake:** During a Physical Count (Spec 015), users can scan a barcode to immediately identify the ingredient and increment its count.
  - **Usage in Ingestion:** Scanning a barcode on a delivered case can automatically "Check In" the item against a PO.

### 4. Performance Analytics

- **Reconciliation Grade:** Percentage of orders that arrived without discrepancies (Shortages/Overcharges).
- **Price Volatility:** Tracking how often this vendor changes prices compared to the market average.
- **Fulfillment Speed:** Average time from PO creation to Invoice finalization.

## User Interfaces

### 1. Vendor Directory

- Card-based view of all suppliers with "Quick Status" (Online/Offline, Next Delivery).
- "Order Now" shortcut that deep-links to the Order Manager filtered for that vendor.

### 2. Item Mapping Tool

- A table view for managing the relationship between Vendor SKUs and internal Ingredients.
- Searchable by Barcode, SKU, or Name.

### 3. Wastage & Quality Reports

- View incidents specifically tied to a vendor (e.g., "Arrived spoiled", "Damaged in transit").
- Integrated with the **Wastage Log** (Spec 015).

## Data Model

```typescript
type Vendor = {
  id: string;
  name: string;
  contact: ContactInfo;
  deliveryDays: number[]; // 0-6 (Sun-Sat)
  orderMinimum: {
    amount: number;
    type: "CURRENCY" | "WEIGHT";
  };
  performanceScore: number;
};

type VendorItem = {
  id: string;
  vendorId: string;
  ingredientId: string;
  vendorSku: string;
  barcode?: string;
  lastPrice: number;
  packSize: string; // e.g., "50lb Bag", "Case 6/10"
};
```

## Integration Points

- **Order Manager:** Uses schedules and minimums to guide the procurement workflow.
- **Virtual Inventory:** Uses barcodes for high-speed physical audits (Stocktake).
- **Invoice Manager:** Learns mappings from vendor shortcodes to internal ingredients.
- **Watch/KDS:** Allows reporting vendor-specific wastage (e.g., "Sysco milk arrived leaking").
