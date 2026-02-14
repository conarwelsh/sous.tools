# Spec 013: Shared Data Ingestion & OCR Components

**Status:** Proposed
**Date:** 2026-02-09
**Consumers:** Recipe Manager (011), Invoice Manager (012)

## Objective

Define the shared infrastructure for ingesting unstructured physical or digital documents (Recipes, Invoices) and converting them into structured platform data. This spec abstracts the complexity of OCR, AI processing, and user verification into reusable features.

## 1. Document Scanner Component (`<DocumentIngestor />`)

A universal dropzone and camera interface for capturing source documents.

### Features

- **Multi-Source Support:**
  - **Camera (Mobile/Tablet):** Accesses the device camera for direct capture. Supports multi-page scanning (capturing multiple images for one logical document).
  - **Upload (Web):** Drag-and-drop support for PDF, JPG, PNG, WEBP.
  - **Drive Integration:** Picker for Google Drive files (if authenticated).
- **Preprocessing:**
  - **Edge Detection:** (Native/Mobile) Auto-crops the document background.
  - **Optimization:** Converts images to Grayscale and resize/compress on the client (using `sharp` or Canvas) before upload to save bandwidth and fit LLM context windows.
- **Feedback:** Progress bars for upload and "Processing..." states during the AI extraction phase.

## 2. Smart Mapper Component (`<EntityMapper />`)

The core UI for associating unstructured text (OCR results) with structured platform entities (Ingredients).

### Features

- **Fuzzy Matching:**
  - Takes an input string (e.g., "SYSCO RED TOM 5X6" or "1 cup chopped toms") and suggests existing `CatalogItems` or `Ingredients` based on string similarity.
- **Confidence Scoring:**
  - **High Confidence (>90%):** Auto-selects the match visually (green highlight).
  - **Low Confidence:** Shows a "Best Guess" with a distinct UI (yellow/red) requiring explicit user confirmation.
- **Learning Mode:**
  - When a user manually corrects a match (e.g., mapping "B07X..." to "Kosher Salt"), the system saves this `ExternalAlias` to the database. Future scans of "B07X..." will auto-match to "Kosher Salt".
- **Creation Flow:**
  - If no match exists, provides a quick-create inline form to add a new Ingredient/Item to the Catalog without leaving the review flow.

## 3. Ingestion Review Interface (`<IngestionReviewer />`)

A split-screen or side-by-side interface for verifying AI extraction results against the original document.

### Layout

- **Left Panel (Source):**
  - Zoomable/Pannable view of the original scanned image/PDF.
  - Highlights the region currently being edited (if coordinate data is available from OCR).
- **Right Panel (Form):**
  - A dynamic form populated with the extracted data.
  - Usage of `<EntityMapper />` for line items.
  - Global fields (Date, Vendor/Author, Totals) at the top.
- **Validation Logic:**
  - **Math Check:** For invoices/recipes, ensures line items sum up to the extracted Total. Warns user if there is a discrepancy.

## Data Model (Shared)

```typescript
type ScannedItemCandidate = {
  originalText: string;
  detectedQuantity: number;
  detectedUnit: string;
  confidence: number;
  suggestedMatchId?: string; // ID of Ingredient/CatalogItem
};

type IngestionSession = {
  id: string;
  sourceImages: string[];
  status: "PROCESSING" | "REVIEW" | "COMPLETED";
  extractedData: any;
};
```
