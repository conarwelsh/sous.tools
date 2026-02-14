# Sous OS v0.1.0 - Release Candidate 1

**Status:** Feature Complete
**Date:** February 13, 2026
**Codename:** "Mise en Place"

---

## 🚀 Executive Summary

Sous OS v0.1.0 represents the complete foundational architecture of the "Operating System for the Physical World." This release successfully pivots the platform from a fragmented desktop application to a unified, web-first ecosystem capable of running on any device, with specialized capabilities for offline-first edge nodes.

We have achieved **100% implementation** of all critical architectural specifications, including the standardized renaming of POS entities, the establishment of a secure OAuth2 provider, and the rollout of a robust, AI-powered ingestion engine.

---

## 💎 Core Architecture (Completed)

### 1. The "Web-First" Pivot (ADR 041)

- **Unified Shell:** A single `@sous/web` codebase now powers the Web Dashboard, Mobile App (Capacitor), and Kiosks.
- **Role-Based Routing:** The application dynamically morphs its UI based on the user's role (Admin, Chef, Kiosk) and device context.
- **Polymorphic UI:** Components from `@sous/ui` adapt their density and interaction models for Touch vs. Mouse.

### 2. Edge-First Connectivity (Spec 009 & 036)

- **Zero-Config Pairing:** Hardware nodes broadcast `_sous-api._tcp` via mDNS.
- **Local Fallback:** The Client SDK automatically switches to `http://sous-edge.local` if the cloud is unreachable.
- **Secure Handshake:** 6-digit pairing codes exchange long-lived `HardwareJWTs` for persistent, headless authentication.

### 3. Domain-Driven Design (Mandate 14)

The API is no longer a monolith but a federation of strict domains:

- **Culinary:** Recipes, Scaling, Costing.
- **Procurement:** Suppliers, Invoices, Orders.
- **Inventory:** Real-time stock ledger with par-level alerts.
- **POS:** Financial ledger and product mapping.
- **Integrations:** OAuth2 connection manager for Square & Google.

---

## ✨ Key Features

### 🍳 Culinary Intelligence

- **AI Recipe Ingestion:** Paste a Google Drive link, and Gemini 1.5 Flash extracts yield, ingredients, and steps automatically.
- **Dynamic Costing:** Real-time recipe pricing based on FIFO inventory data.
- **Smart Scaling:** One-click yield adjustment that recalculates all ingredient quantities.

### 🛒 Procurement & Inventory

- **AI Invoice Processing:** Upload an invoice text/PDF, and our engine extracts line items to update stock levels.
- **Low Stock Alerts:** Automated emails trigger when inventory hits `parLevel`.
- **Vendor Management:** Centralized directory of suppliers with delivery schedules.

### 💳 Point of Sale & Payments

- **Unified Product Catalog:** "Items" are now "Products" globally (ADR 051).
- **Square Integration:** Bi-directional sync of Catalog and Sales data.
- **Financial Ledger:** Immutable record of all cash/card movements with daily reconciliation.

### 🛡️ Security & Identity

- **OAuth2 Provider:** Sous acts as an Identity Provider (IdP) for 3rd party apps.
- **RBAC & Scopes:** Granular permissions (`inventory:view`, `recipe:create`) enforced at the Guard level.
- **Audit Trails:** All sensitive actions are logged.

---

## 🛠️ Developer Experience

- **Standardized Tooling:** `sous db reset`, `sous dev`, `sous quality forge`.
- **E2E Testing:** Critical flows (Auth, Pairing) covered by Playwright.
- **Strict Typing:** No `any` types in core logic; full Zod validation for config.

---

## 📊 System Stats

| Metric                  | Count              |
| :---------------------- | :----------------- |
| **Domains**             | 14                 |
| **Database Tables**     | 32                 |
| **API Endpoints**       | 45+                |
| **UI Components**       | 60+                |
| **Integration Drivers** | 2 (Square, Google) |

---

## 🔮 Next Steps (Phase 2)

With the foundation solid, we move to **Physical Expansion**:

1. **Hardware Manufacturing:** Finalizing the RPi case design.
2. **KDS V2:** Real-time kitchen ticket routing.
3. **Advanced Analytics:** Predictive ordering based on sales history.
