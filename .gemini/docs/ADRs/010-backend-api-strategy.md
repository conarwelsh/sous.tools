# ADR 010: Backend API Architecture & Communication Strategy

## Status
Proposed

## Date
2026-02-03

## Context
The `@sous/api` (NestJS) serves as the core intelligence of the platform. It must support:
- **Multiple Protocols:** REST (for standard integration), GraphQL (for complex frontend data requirements), and WebSockets (for real-time updates).
- **Background Processing:** Long-running tasks like recipe costing or IoT telemetry processing must not block the main thread.
- **Communication:** A unified `client-sdk` that supports request-response and real-time streams.
- **Outbound Communication:** Rich HTML emails sent from `@sous.tools`.
- **Branding:** Documentation (Swagger/GraphiQL) must reflect the `sous.tools` brand.
- **Constraints:** Must operate within **Free Tier** limits.

## Decision

### 1. API Architecture
We will implement a hybrid API approach within a **Domain-Driven Design (DDD)** structure.
- **REST:** Built using `@nestjs/swagger`. 
  - **Documentation:** We will use **Scalar** (via `nestjs-scalar`) for a modern, branded UI.
- **GraphQL:** Built using `@nestjs/graphql` with the Apollo driver.
  - **Sub-decisions:** Code-first approach. Subscriptions will be enabled via WebSockets.
  - **Documentation:** **GraphiQL** will be the IDE, themed with `@sous/ui` colors.

### 2. Real-Time & Message Queuing
- **WebSockets:** `@nestjs/websockets` using Socket.io for robust cross-platform support (Web & Mobile).
- **Queue Engine:** **BullMQ** with **Upstash Redis** (Free Tier).
  - **Usage:** Email sending, report generation, and complex calculation tasks.
  - **Isolation:** Workers will be defined within their respective Domain modules.

### 3. Generated Client SDK
The `@sous/client-sdk` will be the exclusive way for `@sous/web` and `@sous/cli` to interact with the API.
- **HTTP:** Auto-generated from the OpenAPI (REST) and GraphQL schemas (using `graphql-codegen`).
- **Real-Time:** The SDK will include a `RealtimeClient` that wraps the WebSocket connection, allowing typed emissions and subscriptions.

### 4. Email Strategy
- **Service:** **Resend** (Free Tier: 3,000 emails/month).
- **Configuration:** Managed via `@sous/config`.
- **Domain:** Verified with DKIM/SPF to send from `*@sous.tools`.
- **Templating:** **React Email** (for building responsive HTML emails using React components).

### 5. Branding Mandate (Documentation)
- **Scalar/GraphiQL:** Custom CSS will be injected into these documentation endpoints to apply the `sous.tools` logo and brand colors (Success/Warning/Primary depending on environment).

## Implementation Details

#### Subscription Workflow
1. Client subscribes via GraphQL Subscription or WebSocket `emit`.
2. `BullMQ` finishes a background job.
3. `api` publishes an event to the local `EventEmitter2` or a Redis Pub/Sub.
4. WebSocket/Subscription Gateway pushes data to the specific `organizationId` or `locationId` room.

## Consequences
- **Positive:**
  - **Developer Experience:** Auto-documented, type-safe SDKs for all protocols.
  - **Performance:** Offloading heavy logic to background queues keeps the API responsive.
  - **Professionalism:** Branded docs and "from @sous.tools" emails enhance platform trust.
- **Negative:**
  - **Bundle Size:** Supporting REST, GQL, and WS in a single SDK can increase the package size for the frontend.
  - **Complexity:** Maintaining schema parity between REST and GQL requires discipline in NestJS decorators.
