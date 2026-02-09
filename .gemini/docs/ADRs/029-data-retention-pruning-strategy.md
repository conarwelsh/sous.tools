# ADR 029: Data Retention & Pruning Strategy

## Status

Proposed

## Date

2026-02-04

## Context

Free-tier database providers (Supabase/Upstash) enforce strict limits on row counts and storage volume. Unbounded growth of telemetry logs or ephemeral data will eventually crash the platform.

## Decision

We will implement a **Mandatory Pruning Engine** within the `@sous/api` (Intelligence Domain).

### 1. Retention Policies

- **Telemetry Logs:** Automatically pruned after 7 days.
- **Background Jobs:** BullMQ job history pruned after 48 hours.
- **Historical Reports:** Aggregated into "Intelligence Snapshots" (ADR 005) and raw line-item data pruned after 90 days.

### 2. Implementation

- **Cron Jobs:** Utilizing NestJS `@Scheduled` tasks to run daily cleanup queries.
- **Index Optimization:** Ensuring all "Date-stamped" tables have indexes to allow for high-performance `DELETE` operations without table locks.

## Consequences

- **Positive:** Ensures platform stability within free-tier limits; maintains high query performance.
- **Negative:** Users lose access to granular raw historical data beyond the retention window.
