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
- **Responsibilities:** The "Raw Materials" of the restaurant.
- **Key Entities:** `Ingredient`, `Vendor`, `SupplyItem`, `Invoice`.
- **Logic:** Normalizing vendor data, managing ingredient density/conversions.

#### C. Culinary Domain (`@sous/api/src/culinary`)
- **Responsibilities:** The "Intellectual Property" of the chef.
- **Key Entities:** `Recipe`, `Menu`, `MenuItem`.
- **Logic:**
  - **Recipe Costing:** Calculates cost dynamically based on `Recipe` ingredients + `Catalog` pricing.
  - **Versioning:** Recipes must be versioned to track history.

#### D. IoT & Hardware Domain (`@sous/api/src/iot`)
- **Responsibilities:** Managing physical devices.
- **Key Entities:** `Device` (Thermometer, Gateway, Screen), `TelemetryData`.
- **Logic:**
  - **BLE Thermometers:** Ingesting temperature logs, alerting on HACCP violations.
  - **Digital Screens:** Websocket connections for real-time menu updates.

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
