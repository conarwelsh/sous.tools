# ADR 034: Real-time Data Throttling & Edge Batching

## Status
Proposed

## Date
2026-02-04

## Context
Operating on the **Free Tier** of Upstash Redis (10k requests/day) and Vercel/Render, we cannot afford a WebSocket event for every minor telemetry update (e.g., a thermometer fluctuation every second).

## Decision
We will implement an **Edge-First Batching** strategy for all real-time telemetry.

### 1. Batching Logic (Native Bridge)
- The **Native Bridge** (ADR 011) will buffer telemetry data (temperature, heartbeat, CPU) locally.
- **Rules:** 
  - **Regular Data:** Pushed in batches every 60 seconds.
  - **Alert Data:** (e.g., HACCP violation) Pushed **IMMEDIATELY**, bypassing the buffer.

### 2. Throttling (API Gateway)
- The `@sous/api` will implement **In-Memory Debouncing** for high-churn entities (like "Live Pricing" trends) to ensure the database isn't hammered by redundant updates.

### 3. Efficiency
- We will use **MessagePack** or similar binary serialization for WebSocket payloads to reduce bandwidth and stay within free-tier egress limits.

## Consequences
- **Positive:** Significant reduction in Redis/API costs; guaranteed availability of free-tier resources for critical alerts.
- **Negative:** Non-critical dashboards may have up to 60s of "stale" telemetry data.
