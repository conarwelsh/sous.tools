# Spec 011: Recipe Manager

**Status:** Proposed
**Date:** 2026-02-09
**References:** Spec 013 (Shared Ingestion), ADR 018 (Recipes Domain)

## Objective

Create a comprehensive interface for managing the culinary intellectual property of the organization. This tool handles the lifecycle of a recipe from ideation (Scanning/Import) to production (Cook Mode), integration with the POS (Sales Data), and nutritional compliance.

## Core Features

### 1. Recipe List & Discovery
- **Search & Filter:**
  - Text search (Name, Ingredients).
  - Filters: Category (Appetizer, Main), Tags (Vegan, Gluten-Free), Dietary Restrictions.
- **Views:** Grid (Card with image) or List (Compact).

### 2. Ingestion & Creation
Uses the **Shared Ingestion Components** (Spec 013).
- **Methods:** Manual Entry, Scan via Camera (`<DocumentIngestor />`), Google Drive Import (Folder/File), Web Share Target.
- **Processing:** OCR/AI extracts Title, Yield, Ingredients, and Steps.
- **Mapping:** Uses `<EntityMapper />` to link text ingredients ("1 cup sugar") to Catalog items ("Sugar, Granulated") for costing.

### 3. The Recipe Editor
- **Header:** Image, Name, Description, Category, Tags.
- **Yield Logic:**
  - **Standard Mode:** Fixed quantity (e.g., "Yields 2 Gallons").
  - **Bakers Mode:**
    - Ingredients defined by %.
    - "Base Ingredient" selector (usually Flour).
    - **Scaling Lock:** User can lock "Total Yield", "Ingredient Weight", or "Container Count".
    - *Container Logic:* "Make [3] of [Pullman Pan (1200g)]" = Auto-scales recipe to 3600g total.
- **Ingredients List:**
  - Reorderable list.
  - Links to POS Menu Items (for price/sales data syncing).
  - **Wastage Factor:** Input field for specific yield loss per ingredient (e.g., "Onions: 100g (Yield 85%)" accounts for skins/ends).
- **Steps:** Rich text editor for instructions. Support for embedded timers (e.g., "Bake for {20 mins}").

### 4. POS Integration
- **Association:** Link a Recipe to a POS Menu Item.
- **Data Sync:**
  - Pull: Sales Price, Total Sales (from POS).
  - Push: Update POS availability or cost basis based on recipe changes.
- **Nutritional Facts:**
  - Auto-generated based on linked Ingredients.
  - **Print Action:** "Print Label" button sends data to a network label printer (via Hardware Domain).

### 5. Cook Mode (Presentation View)
A specialized "Player" view for the kitchen.
- **Wake Lock:** Prevents screen sleep.
- **Full Screen:** Maximizes content visibility.
- **Ingredient Checklist:**
  - Interactive checkboxes to mark items as "Added".
  - Greys out completed items.
- **Interactive Steps:**
  - **Smart Highlighting:** References to ingredients in the text (e.g., "Add the *sugar*") highlight the corresponding ingredient in the list.
  - **Timers:** Clicking a time ("20 mins") starts a countdown.
    - *Sync:* Syncs to Paired Wear OS device (Chef's Watch).
- **Notes:**
  - "Cook Log" for adding session-specific notes ("Oven ran hot today").
  - Aggregated view of past notes in the Recipe Manager.

## UX / Quick Actions
- **App Shortcut:** Long-press App Icon -> "Scan Recipe" (deep links to `<DocumentIngestor />`).
- **Share Intent:** "Share to Sous Tools" from Browser/Social apps triggers ingestion.

## Data Model

```typescript
type Recipe = {
  id: string;
  name: string;
  isBakersPercentage: boolean;
  yieldAmount: number;
  yieldUnit: string; // "g", "portions"
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
  linkedPosItemId?: string;
  notes: CookNote[];
};

type RecipeIngredient = {
  catalogItemId: string;
  quantity: number; // or Percentage if isBakersPercentage
  unit: string;
  isLocked?: boolean; // For scaling calculations
  wastageFactor?: number; // 0-1 (e.g. 0.1 = 10% waste)
};
```
