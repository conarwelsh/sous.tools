# ADR 005: Platform Domains & Multi-Tenancy Strategy

## Status

Decided

## Date

2026-02-04 (Updated)

## Context

`sous.tools` is a multi-tenant SaaS platform for restaurant management. As the feature set has expanded, the initial domain boundaries (IAM, Catalog, Culinary, IoT) required refinement to handle complex cross-domain logic—specifically **Recipe Costing**, which bridges the gap between static recipe structures and fluctuating supply prices.

## Decision

### 1. Multi-Tenancy Strategy

We will use a **Row-Level Security** model (Shared Database, Shared Schema).

- Every business entity MUST have an `organizationId`.
- **Enforcement:** Drizzle middleware and PostgreSQL RLS policies will automatically inject tenancy filters.

### 2. Refined Domain Boundaries (DDD)

We will group logic into high-level domains that reflect the business lifecycle:

#### A. IAM (Identity & Access Management)

- **Entities:** `User`, `Organization`, `Location`, `Role`, `Permission`.
- **Responsibilities:** Auth, RBAC, and the physical/logical structure of the restaurant group.

#### B. Procurement (Supply Chain)

- **Entities:** `Supplier`, `SupplyItem`, `Invoice`, `UnitConversion`.
- **Responsibilities:** Managing vendor relationships, ingesting price data (via `Invoices`), and normalizing raw materials into a standard "Ingredient" definition.

#### C. Culinary (Intellectual Property)

- **Entities:** `Recipe`, `Menu`, `MenuItem`, `PrepList`.
- **Responsibilities:** The creative logic of the kitchen. Definitions of how things are made and sold.

#### D. Inventory (Operations)

- **Entities:** `StockLedger`, `WastageEntry`, `PurchaseOrder`.
- **Responsibilities:** Tracking physical stock, theoretical depletion, and operational procurement.

#### E. Intelligence (The Predictive Brain)

- **Entities:** `CostingSnapshot`, `MarginAnalysis`, `PriceTrend`.
- **Responsibilities:** **Real-time & Predictive analytics.** This domain consumes events from `Procurement` and `Culinary` to calculate recipe costs, track price volatility, and generate proactive business alerts.
- **Costing Strategy:** Instead of real-time joins, `Intelligence` maintains a cached `CostingSnapshot`. When an invoice is added or a recipe changes, the snapshot is updated asynchronously via `BullMQ`. This domain provides the data foundation for the Accounting domain.

#### F. Hardware (The Physical Edge)

- **Entities:** `Device`, `Node`, `Heartbeat`, `Telemetry`.
- **Responsibilities:** Managing BLE thermometers, Gateways, Printers, and Display nodes.

#### G. Presentation (Visuals)

- **Entities:** `Layout`, `Display`, `LabelTemplate`.
- **Responsibilities:** Digital menu screens, WYSIWYG layout management, and physical label printing.

#### H. Integrations (Connectors)

- **Entities:** `IntegrationConfig`, `ProviderToken`.
- **Responsibilities:** Syncing data with Square, Toast, Google, etc., using a Driver/Adapter pattern.

### 3. Data Relationships & Communication

- **Service Interfaces:** Domains MUST only interact via public Service methods.
- **Event-Driven:** Cross-domain updates (like Costing) should prefer Event-Driven patterns to avoid tight coupling.

## Consequences

- **Positive:**
  - **Performance:** Complex costing is offloaded to an asynchronous "Intelligence" engine.
  - **Clarity:** "Procurement" and "Presentation" provide better business context than "Catalog" or "IoT".
  - **Isolation:** Critical logic (IAM) is separated from high-churn logic (Culinary).
- **Negative:**
  - **Eventual Consistency:** Recipe costs may take a few seconds to reflect a new invoice entry.
  - **Complexity:** Requires a robust Event Bus (Redis/EventEmitter) and background worker system.
