# ADR 018: Recipes Domain Strategy

## Status

Proposed

## Date

2026-02-03

## Context

The "Recipes" domain is the intellectual heart of the `sous.tools` platform. It must handle the transition from unstructured data (paper scans, PDFs, websites) to structured, cost-aware culinary data. It also needs to support advanced professional techniques like Bakers Percentages and dynamic yield scaling.

**Key Requirements:**

- **Multi-Channel Ingestion:**
  - Manual entry/editing.
  - Scanning via mobile camera or network scanners.
  - Google Drive integration (file/folder sync).
  - Web/Social sharing via platform "Share" intents.
- **Intelligent Processing:**
  - OCR and AI-driven normalization to convert unstructured text/images into structured recipe entities (Ingredients, Quantities, Steps).
- **Culinary Intelligence:**
  - **Financials:** Real-time cost calculation and profit margin analysis (integrated with Catalog Domain pricing).
  - **Bakers Percentages:** Support for percentage-based scaling where ingredients are relative to a "flour" or base weight.
  - **Dynamic Scaling:** Ability to lock an ingredient weight, total yield weight, or yield by **Container Count** (e.g., "3 Pullman pans at 1200g each").

## Decision

We will implement the **Recipes Domain** as the core of our culinary intelligence layer, utilizing advanced AI services for data ingestion.

### Key Components & Logic

1.  **AI Ingestion Pipeline**
    - **OCR:** Utilizing specialized OCR for structured data extraction.
    - **LLM Normalization:** Passing raw text to an LLM to map ingredients to our `Catalog` items and normalize units of measure.
    - **Google Drive Sync:** A background worker to periodically pull and process files from connected user folders.

2.  **The "Recipe Engine" (Math Layer)**
    - **Scaling Logic:** A robust mathematical model supporting:
      - Linear scaling (multiplier).
      - Fixed-point scaling (changing one ingredient recalculates others based on ratios).
      - **Yield-to-Containers:** A mapping of `ContainerType` (e.g., Pullman Pan) to `StandardWeight` to calculate total required yield.
    - **Bakers Percentages:** A specific mode where ingredients are stored as ratios (totaling >100%) and calculated based on the "Base" ingredient.

3.  **Costing Service**
    - A reactive service that recalculates recipe costs whenever ingredient prices in the `Catalog` change or the recipe is scaled.

4.  **Integration**
    - **Web/Mobile Intents:** Custom handlers for `navigator.share` (Web) and Native Share Intent (ADR 015) to capture external URLs for AI processing.

## Consequences

- **Positive:**
  - **Lowest Friction:** AI-powered imports make it extremely easy for chefs to digitize their libraries.
  - **Precision:** Container-based scaling removes manual math errors in production environments.
  - **Profitability:** Instant cost visibility helps management optimize menus in real-time.
- **Negative:**
  - **Computational Cost:** Heavy reliance on AI for imports can be expensive; we must optimize prompts and utilize cost-effective models.
  - **Mapping Complexity:** Automatically mapping a scanned ingredient ("1 bag flour") to a specific catalog item requires sophisticated fuzzy matching and user confirmation.

## Research & Implementation Plan

### Research

- **AI/LLM Providers:** Evaluated OpenAI and Anthropic for structured data extraction from recipes.
- **Culinary Math:** Verified logic for bakers percentages and container-based yield calculations.

### Implementation Plan

1. **Recipe Engine:** Build the core logic for scaling and bakers percentage math.
2. **AI Ingestion:** Implement the processing pipeline that uses LLMs to parse recipe scans and URLs.
3. **Google Drive Sync:** Build the integration that watches Drive folders for new recipe files.
4. **Costing Service:** Implement the reactive costing service that links recipes to catalog pricing.
