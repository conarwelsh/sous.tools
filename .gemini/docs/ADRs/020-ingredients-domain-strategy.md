# ADR 020: Ingredients Domain Strategy

## Status
Proposed

## Date
2026-02-03

## Context
While the `Catalog` (ADR 005/019) handles the static definition of raw materials, we need a high-intelligence domain dedicated to the **Market Dynamics** of these materials. For a restaurant, ingredients are not just items—they are volatile assets. Survival depends on navigating price fluctuations, identifying vendor opportunities, and adjusting menus based on real-time market shifts.

**Key Requirements:**
- **Price Intelligence:** Granular tracking of price movements across all vendors.
- **Trend Analysis:** Visualizing historical price data to identify seasonal cycles and unexpected spikes/drops.
- **Profitability Alerts:** Proactive notifications when ingredients hit a "Low" threshold (opportunity for specials) or a "High" threshold (risk to margins).
- **Opportunity Engine:** System-generated suggestions linking low-cost ingredients to existing high-margin recipes (e.g., "Chicken and Bacon costs are down 15%; consider running your 'Club Sandwich' as a special").
- **Vendor "Price Wars":** Real-time comparison across all connected vendors to determine the optimal source for every item in the order guide.

## Decision
We will establish the **Ingredients Domain** as the analytical intelligence layer of the platform, sitting between `Invoices` (data source) and `Recipes` (data consumer).

### Domain Responsibilities & Logic

1.  **Market Intelligence Service**
    - Analyzing the `PriceHistory` ledger (from ADR 019) to generate volatility scores and trend vectors.
    - Implementing a "Vendor Price Comparison" matrix that normalizes vendor-specific units to platform-standard units for fair "Price War" analysis.

2.  **The "Specials" Opportunity Engine**
    - A logic layer that crosses-references ingredients with a "Low" trend status against the `Recipes` database.
    - Criteria: (Ingredient Price Delta < -10%) AND (Recipe Profit Margin > 70%) = High Priority Suggestion.

3.  **Alerting & Notification System**
    - Configurable thresholds for "Anomalous Price Movement."
    - Push notifications to `@sous/native` and `@sous/web` for immediate chef awareness.

4.  **Order Guide Optimization**
    - Generating an "Optimal Order Guide" that suggests split-ordering between vendors based on the current "Price War" winner for each specific ingredient.

### Data Relationships
- **Invoices Domain:** Feeds raw price data into the Ingredients intelligence engine.
- **Catalog Domain:** Provides the normalized ingredient definitions.
- **Recipes Domain:** Consumes intelligence to suggest profitable menu adjustments.

## Consequences
- **Positive:**
    - **Procurement Efficiency:** Drastically reduces time spent manually comparing vendor catalogs.
    - **Margin Protection:** Alerts allow chefs to swap out high-cost ingredients before they eat into profits.
    - **Proactive Management:** Transforms the software from a "System of Record" to an "Active Advisor."
- **Negative:**
    - **Unit Normalization Complexity:** Comparing "Price per Case" vs "Price per LB" across vendors with different pack sizes requires meticulous unit conversion logic.
    - **Noise Potential:** If alerts are too sensitive, chefs may ignore them (requires "Smart Alert" thresholds).

## Research & Implementation Plan

### Research
- **Financial Analytics:** Researched common price-variance models used in the hospitality industry.

### Implementation Plan
1. **Intelligence Engine:** Build the analytics service that calculates price trends and volatility scores.
2. **Price War Matrix:** Implement the vendor comparison tool with unit-normalization logic.
3. **Alerting System:** Create the notification engine for price spikes and drops.
4. **Opportunity Engine:** Implement the logic that suggests profitable specials based on current market data.
