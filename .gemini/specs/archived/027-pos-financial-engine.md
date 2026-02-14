# Spec 027: POS Financial Engine

**Status:** Proposed
**Date:** 2026-02-13
**Consumers:** @sous/api, @sous/client-sdk, @sous/native

## Objective

Implement a robust financial backend for the Point of Sale (POS) system, ensuring data integrity, idempotency for payment processing, and support for offline synchronization.

## 1. Data Schema (Drizzle)

### `pos_ledgers`

- `id`: uuid (PK)
- `organizationId`: uuid (FK)
- `locationId`: uuid (FK)
- `openedAt`: timestamp
- `closedAt`: timestamp (null if open)
- `startingCash`: integer (cents)
- `actualCash`: integer (cents)
- `expectedCash`: integer (cents)
- `status`: enum ('OPEN', 'CLOSED', 'RECONCILING')

### `financial_transactions`

- `id`: uuid (PK)
- `organizationId`: uuid (FK)
- `orderId`: uuid (FK to `pos_orders`)
- `ledgerId`: uuid (FK to `pos_ledgers`)
- `amount`: integer (cents)
- `type`: enum ('SALE', 'REFUND', 'PAYOUT', 'CASH_IN', 'CASH_OUT')
- `method`: enum ('CASH', 'CARD', 'EXTERNAL')
- `externalReference`: varchar (e.g. Stripe ID)
- `createdAt`: timestamp

## 2. Idempotency Guard

### Objective

Prevent double-charging users or double-counting orders when clients (especially mobile/offline ones) retry requests.

### Implementation

- **Header**: `X-Idempotency-Key` (UUID).
- **Storage**: Redis.
- **Logic**:
  1. Check if key exists in Redis.
  2. If exists, return cached response (or "In Progress" status).
  3. If not, proceed with request and store result in Redis with a 24h TTL.

## 3. Offline Sync foundations

### Store and Forward

- `@sous/client-sdk` will include a `QueueStore` using IndexedDB (web) or SQLite (native).
- Failed requests due to connectivity are queued.
- A background worker attempts to "drain" the queue when online.
- All queued requests MUST include an idempotency key.

## Implementation Plan

1.  **Schema**: Update `pos.schema.ts` with new tables.
2.  **Guards**: Create `IdempotencyGuard` in `apps/api/src/domains/core/guards/`.
3.  **Service**: Update `PosService` to handle ledger management and transactions.
4.  **SDK**: Add `OfflineInterceptor` to the HTTP client.
