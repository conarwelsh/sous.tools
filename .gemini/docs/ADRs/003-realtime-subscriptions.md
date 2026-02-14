# ADR 003: Real-time GraphQL Subscriptions for KDS and POS

## Status
Proposed

## Context
The Kitchen Display System (KDS) and Point of Sale (POS) require real-time updates for order status changes and new orders. Previously, the system relied on HTTP polling, which was inefficient and introduced latency.

## Decision
We will implement real-time updates using GraphQL Subscriptions powered by `graphql-subscriptions` and `PubSub`.

- **Transport**: WebSockets (via `@nestjs/websockets` and `subscriptions-transport-ws` / `graphql-ws`).
- **Engine**: In-memory `PubSub` for development; Redis-backed PubSub for production scalability.
- **Events**: `orderUpdated` will be the primary event stream.

## Consequences
- **Positive**: Instant UI updates, reduced server load from polling, improved user experience for kitchen staff.
- **Negative**: Increased complexity in the API gateway and client-side Apollo configuration.
- **Requirement**: Clients must maintain a persistent WebSocket connection.
