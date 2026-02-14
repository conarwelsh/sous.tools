# @sous/api

The centralized backend for the Sous platform. Built with **NestJS**, **GraphQL**, and **Drizzle ORM**.

## Responsibilities

- **Unified API**: Single entry point for Web, Native, and Hardware nodes.
- **Real-time Engine**: GraphQL Subscriptions via Redis/PubSub.
- **Background Processing**: BullMQ for email processing and data ingestion.
- **Polymorphic Drivers**: Universal interfaces for POS (Square, Sous) and Payments (Stripe, CardConnect).
- **Identity Management**: JWT-based authentication with organization-level isolation.

## Tech Stack

- **Framework**: NestJS 11
- **API Style**: GraphQL (Code-first) + REST (for specific webhooks)
- **Database**: PostgreSQL 16 + Drizzle ORM
- **Cache/PubSub**: Redis
- **Task Queue**: BullMQ
- **Language**: TypeScript (ESM)

## Installation & Setup

1.  **Infra**: Ensure Docker is running.
    ```bash
    pnpm db:up
    ```

2.  **Migration**:
    ```bash
    pnpm db:push
    ```

3.  **Development**:
    ```bash
    pnpm dev
    ```

## Functionality List

- [x] **Multi-Tenant Architecture**: Strict organization-level data isolation via Drizzle middleware.
- [x] **GraphQL Subscriptions**: Real-time order and hardware event propagation.
- [x] **Driver Factory**: Polymorphic support for multiple POS and Payment providers.
- [x] **Centralized Logging**: Integration with `@sous/logger` for unified observability.
- [x] **Automated Documentation**: Scalar API reference available at `/docs`.

## Domain Organization

Following Mandate #14, the API uses a Strategic Umbrella structure:
- `src/domains/iam`: Identity & Access Management.
- `src/domains/pos`: Point of Sale and KDS logic.
- `src/domains/culinary`: Catalog, Products, and Recipes.
- `src/domains/procurement`: Invoices, Suppliers, and Orders.
- `src/domains/billing`: Subscriptions and Payments.

## Documentation

- [Database Schema](./src/domains/core/database/schema.ts)
- [API Reference](http://localhost:4000/docs)
- [ADRs](../../.gemini/docs/ADRs/)
