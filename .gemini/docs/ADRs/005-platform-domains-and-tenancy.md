# ADR 005: Platform Domains & Multi-Tenancy Strategy

## Status
Proposed

## Date
2026-02-03

## Context
`sous.tools` is a multi-tenant SaaS platform for restaurant management. It must support organizations with single or multiple locations.
The feature set is broad, covering:
- **Inventory & Supply:** Ingredients, Vendors, Invoices.
- **Culinary:** Recipe management, Costing, Prep.
- **Presentation:** Menu management, Digital Menu Screens.
- **Hardware:** BLE Thermometer management.

We need a high-level architectural plan to organize these disparate concerns while ensuring strict data isolation between tenants.

## Decision

### 1. Multi-Tenancy Strategy
We will use a **Row-Level Security** model (Shared Database, Shared Schema).
- **Organization (Tenant):** The top-level entity. Represents a restaurant group.
- **Location:** A child of Organization. Represents a physical store.
- **Implementation:**
  - Every business entity (Ingredient, Recipe, Device) MUST have an `organizationId`.
  - Most entities will also have a `locationId` (nullable if the resource is shared across the org, e.g., a standardized global recipe).
  - **Enforcement:** Global database filters or Repository wrappers in `@sous/api` to automatically inject `where organizationId = user.organizationId` on all queries.

### 2. Domain Boundaries (DDD)
Following ADR 004, we will group logic into the following high-level Domains:

#### A. Core / Identity Domain (`@sous/api/src/iam`)
- **Responsibilities:** Authentication, User Management, Role-Based Access Control (RBAC), Organization & Location structure.
- **Key Entities:** `User`, `Organization`, `Location`, `Role`.

#### B. Catalog Domain (`@sous/api/src/catalog`)
- **Responsibilities:** The "Raw Materials" and inventory definitions.
- **Key Entities:** `Ingredient`, `SupplyItem`, `UnitConversion`.
- **Logic:** Managing global normalization of ingredients and density conversions.

#### F. Ingredients Domain (`@sous/api/src/ingredients`)
- **Responsibilities:** Market intelligence and price optimization.
- **Key Entities:** `PriceTrend`, `MarketAlert`, `PriceWarMatrix`.
- **Logic:**
  - **Trend Analysis:** Calculating volatility and seasonal price vectors.
  - **Opportunity Engine:** Suggesting specials based on low-cost ingredients.
  - **Procurement Optimization:** Comparing vendor prices to find the best source.

#### G. SuperAdmin Domain (`@sous/api/src/superadmin`)
- **Responsibilities:** Platform-level administration and oversight.
- **Key Entities:** `PlatformMetric`, `AuditLog`, `SystemConfig`.
- **Logic:**
  - **Tenant Management:** Global control over organizations and locations.
  - **Oversight Dashboard:** Monitoring platform-wide growth and performance.
  - **Platform Support:** High-privilege tools for tenant assistance.

#### H. Admin Domain (`@sous/api/src/admin`)
- **Responsibilities:** Tenant-level business administration.
- **Key Entities:** `OrganizationMetric`, `StaffMember`, `LocationPreference`.
- **Logic:**
  - **Location Management:** Scoped control over organization locations.
  - **Business Dashboard:** Monitoring organization-wide performance and cost.
  - **Staff Management:** Role assignment and onboarding for organization users.

#### I. Layout Manager Domain (`@sous/api/src/layout`)
- **Responsibilities:** Visual orchestration and template management.
- **Key Entities:** `LayoutTemplate`, `ContentBlock`, `Asset`.
- **Logic:**
  - **WYSIWYG Editor:** Drag-and-drop interface for designing displays.
  - **Data Binding:** Connecting blocks to POS, Media, or static content.
  - **Component Mapping:** Linking data blocks to specific UI components.

#### J. Displays Domain (`@sous/api/src/displays`)
- **Responsibilities:** Content routing and display orchestration.
- **Key Entities:** `Display`, `HardwareAssignment`.
- **Logic:**
  - **Assignment Logic:** Mapping layouts to Web URLs or Hardware Ports.
  - **Real-time Sync:** Pushing content updates to active displays.
  - **Health Monitoring:** Tracking the "Live" status of digital signage.

#### K. Labels Domain (`@sous/api/src/labels`)
- **Responsibilities:** Physical label design and print orchestration.
- **Key Entities:** `LabelTemplate`, `PrintJob`.
- **Logic:**
  - **Data Hydration:** Merging template layouts with real-time recipe/item data.
  - **Print Routing:** Dispatching jobs to specialized hardware.

#### L. Accounting Domain (`@sous/api/src/accounting`)
- **Responsibilities:** Financial intelligence and business reporting.
- **Key Entities:** `LedgerEntry`, `FinancialReport`, `ProfitMetric`.
- **Logic:**
  - **Performance Analysis:** Identifying top profitable and top sold items.
  - **COGS Calculation:** Aggregating sales and invoice data for cost analysis.
  - **Vendor Auditing:** High-level value assessment across procurement sources.

#### M. Integrations Domain (`@sous/api/src/integrations`)
- **Responsibilities:** Bridging with third-party ecosystems.
- **Key Entities:** `IntegrationConfig`, `ProviderToken`.
- **Logic:**
  - **Driver Factory:** Dynamically resolving adapters for Square, Toast, Google, etc.
  - **OAuth Management:** Handling secure token exchange and refresh.
  - **Sync Workers:** Background tasks for automated data ingestion.

#### N. Inventory Domain (`@sous/api/src/inventory`)
- **Responsibilities:** Real-time stock tracking and procurement orchestration.
- **Key Entities:** `StockLedger`, `WastageEntry`, `PurchaseOrder`, `RequestedItem`.
- **Logic:**
  - **Theoretical Depletion:** Decrementing stock based on sales and recipes.
  - **Order Manager:** Collaborative, vendor-optimized procurement lists.
  - **Reconciliation:** Matching incoming invoices to pending purchase orders.

#### E. Invoices Domain (`@sous/api/src/invoices`)
- **Responsibilities:** Supply-side ingestion and cost auditing.
- **Key Entities:** `Invoice`, `Vendor`, `PriceHistory`.
- **Logic:**
  - **AI Extraction:** Automating line-item entry from scans and PDFs.
  - **Price Tracking:** Maintaining the historical ledger of ingredient costs per vendor.

#### C. Recipes Domain (`@sous/api/src/recipes`)
- **Responsibilities:** The "Intellectual Property" and logic of the chef.
- **Key Entities:** `Recipe`, `IngredientLink`, `ScalingRule`, `ContainerType`.
- **Logic:**
  - **AI Ingestion:** OCR and LLM processing of scans, Google Drive, and social shares.
  - **Advanced Scaling:** Bakers Percentages and Container-based yield math.
  - **Dynamic Costing:** Real-time margin calculation based on `Catalog` data.

#### D. IoT & Hardware Domain (`@sous/api/src/hardware`)
- **Responsibilities:** Managing the lifecycle and configuration of all physical devices.
- **Key Entities:** `Device` (Node, Peripheral), `Heartbeat`, `PairingCode`.
- **Logic:**
  - **Remote Management:** Issuing commands via WebSockets.
  - **Telemetry:** Ingesting and aggregating hardware health data.
  - **Topology:** Mapping peripherals to host nodes and locations.

### 3. Data Relationships
- **Cross-Domain Dependencies:**
  - `Culinary` depends on `Catalog` for costing (Recipe uses Ingredients).
  - `IoT` depends on `Core` for device authorization (Device belongs to Location).
- **Communication:**
  - Domains should communicate via defined Service Interfaces (public methods) within the Monolith (NestJS Modules).
  - Future decoupling (microservices) is possible if we respect these boundaries now.

## Consequences
- **Positive:**
  - Scalable structure that separates physical hardware concerns from pure culinary logic.
  - Row-level tenancy is cost-effective and simpler to manage than databases-per-tenant.
- **Negative:**
  - **Complex Costing:** Calculating recipe costs requires joining data across the `Culinary` and `Catalog` domains, which must be handled carefully to avoid performance bottlenecks.
  - **Strict Discipline:** Developers must remember to check `organizationId` on *every* operation if not perfectly abstracted.

## Research & Implementation Plan

### Research
- **PostgreSQL RLS:** Row-Level Security allows the database itself to enforce tenancy boundaries. This is our "Safety Net."
- **NestJS Interceptors:** Used to extract `organizationId` from JWTs and inject it into the request/service context.

### Implementation Plan
1. **Schema Design:** Add `organization_id` (UUID) to every tenant-specific table.
2. **Drizzle Middleware:** Implement a Drizzle middleware that automatically appends `where(eq(table.organizationId, ctx.orgId))` to every query.
3. **Tenant Context:** Build a `TenantContextService` that uses `AsyncLocalStorage` (shared with ADR 003) to store and retrieve the active `organizationId`.
4. **Migration Strategy:** Ensure all future migrations include the necessary `CREATE POLICY` statements for RLS.
