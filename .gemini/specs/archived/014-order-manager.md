# Spec 014: Order Manager (Procurement)

**Status:** Proposed
**Date:** 2026-02-09
**References:** Spec 012 (Invoice Manager), Spec 020 (Ingredients Domain - ADR), Spec 028 (Virtual Inventory - ADR)

## Objective

Digitize the chef's "No Gotz" list (Order Guide) into a real-time, collaborative, and intelligent procurement engine. This tool streamlines the process from identifying a need ("We're out of butter") to placing a purchase order, and finally reconciling that order against the physical invoice upon delivery.

## Core Features

### 1. Vendor Management

A centralized profile management section for all Suppliers.

- **Profiles:** Name, Account Number, Sales Rep Contact (Phone/Email).
- **Ordering Constraints:**
  - **Minimum Order Value (MOV):** (e.g., "$500 minimum for free delivery"). Logic checks PO total against this value.
  - **Delivery Schedule:** Selector for delivery days (e.g., "Mon, Thu, Sat").
  - **Cutoff Times:** "Order by 4 PM for next day delivery."
- **Visual Indicators:**
  - In the Order List, vendors are flagged if the current cart is "Below Minimum" (Red) or "Met" (Green).
  - "Next Delivery" date is calculated and displayed based on the schedule.

### 2. The "No Gotz" List (Active Order Guide)

A unified, real-time list of items that need to be purchased.

- **Collaborative:** Updates from any device (Phone, Tablet, KDS, Watch) appear instantly via WebSockets.
- **Smart Grouping:** Items are automatically categorized by **Vendor**.
  - _Logic:_ defaults to the "Last Purchased Vendor" for that item.
  - _Intelligence:_ If "Vendor Wars" (ADR 020) is active, it may suggest a different vendor if the price is significantly lower, highlighting the potential savings.
- **Quick Add:**
  - _Text Search:_ Fuzzy search against the Organization's Ingredient Catalog.
  - _Voice (Watch/Mobile):_ "Add 10lbs of Butter to the list" (Parsed via LLM/Regex).
  - _Shortcuts:_ "Low Stock" alerts from Virtual Inventory (ADR 028) automatically suggest items.
- **Item State:**
  - Users can toggle specific items in the list (checkbox) to include/exclude them from the next PO without deleting them.

### 3. Purchase Order (PO) Generation

- **Workflow:**
  1. User reviews the "Sysco" group on the No Gotz list.
  2. **Constraint Check:** System warns if Total < Vendor MOV.
  3. Adjusts quantities (e.g., "5 lbs" -> "2 Cases").
  4. Clicks **"Create Order"**.
- **Action:**
  - Generates a `PurchaseOrder` entity in the database with status `OPEN`.
  - Removes the selected items from the "No Gotz" list.
  - (Future) Optionally emails the PDF order guide to the vendor rep or integrates with their EDI.

### 4. Invoice Reconciliation

This is the bridge between **Ordering** (Intent) and **Invoicing** (Reality).

- **Trigger:** When an Invoice is scanned/processed (Spec 012), the system attempts to find a matching `OPEN` Purchase Order for that Vendor within a reasonable date range.
- **The Reconciliation UI:**
  - **Match:** "Sysco Invoice #123 matches PO #456".
  - **Discrepancy Highlighting:**
    - **Short Ship:** Item was on PO but not on Invoice. -> _Action:_ Prompt user to "Add back to No Gotz list?".
    - **Substitution:** Item A on PO, Item B on Invoice. -> _Action:_ Link Item B to Item A's inventory slot?
    - **Price Change:** PO expected $50, Invoice says $65. -> _Action:_ Highlight volatility (red arrow).
    - **Unordered Item:** Item on Invoice but not on PO. -> _Action:_ Flag for review (potential mistake).
- **Finalization:** Closing the reconciliation marks the PO as `FULFILLED` and updates Inventory.

### 5. Integration Points

- **Wear OS:**
  - Complication: "Items on List".
  - Voice Action: "Add [Item] to Order".
- **KDS / POS:**
  - "86 Button" (Sold Out) on POS should optionally prompt: "Add to Order List?".
- **Inventory Domain:**
  - "Par Level" breaches automatically populate the list as "Suggested" items.

## Data Model

```typescript
type VendorProfile = {
  id: string;
  name: string;
  contactInfo: { salesRep: string; phone: string; email: string };
  constraints: {
    minOrderValue: number;
    deliveryDays: number[]; // 0-6 (Sun-Sat)
    cutoffTime: string; // "16:00"
  };
};

type OrderListItem = {
  id: string;
  ingredientId: string;
  quantity: number;
  unit: string;
  preferredVendorId: string; // The "Smart" suggestion
  addedBy: string; // User ID
  createdAt: Date;
};

type PurchaseOrder = {
  id: string;
  vendorId: string;
  status: "OPEN" | "PARTIAL" | "FULFILLED" | "CANCELLED";
  items: POItem[];
  linkedInvoiceId?: string; // Set after Spec 012 processing
  createdAt: Date;
};
```
