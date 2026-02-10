# ADR 035: Development Infrastructure & Containerization Strategy

## Status

Proposed

## Date

2026-02-04

## Context

To ensure "Dev-Prod Parity" while staying within free-tier limits, we need a robust local environment that replicates our cloud services (Supabase, Upstash, Resend) without incurring costs or relying on internet connectivity for core infrastructure.

## Decision

We will utilize **Docker Compose** to orchestrate a suite of "Local Cloud" services.

### 1. Core Infrastructure Images

- **`postgres:16-alpine`**: Primary database. We will include a initialization script to set up the `organization_id` columns and RLS baseline.
- **`redis:7-alpine`**: Used for BullMQ, caching, and local session denial lists.
- **`maildev/maildev`**: Acts as a local SMTP server and web interface. This allows us to test the HTML emails from ADR 010 without using Resend credits.

### 2. Storage & Cloud Simulation

- **`minio/minio`**: An S3-compatible storage server. This will mock Supabase Storage for local development. The `@sous/config` will point to Minio when `NODE_ENV=development`.
- **`infisical/infisical`**: (Optional) While we use the cloud Infisical, we can run a local instance if we need to work entirely offline.

### 3. Build & Testing Hardware

- **`my-github-runner`**: A custom Dockerfile (based on Ubuntu) containing the Android SDK, Android SDK, and QEMU. This will act as the local runner for native app compilation (ADR 007) and hardware-in-the-loop testing (ADR 033).
- **`ubuntu-sandbox`**: A clean `ubuntu:22.04` image used exclusively for testing `sous env install`.
  - **Persistence:** This container is configured to be **ephemeral**; all state is wiped upon restart to ensure the "Zero to Dev" installation script is verified on a truly fresh OS every time.

### 4. Networking (Local Subdomains)

- **`traefik:v3`**: A reverse proxy to manage internal routing.
  - `web.sous.localhost` -> `@sous/web`
  - `api.sous.localhost` -> `@sous/api`
  - `docs.sous.localhost` -> `@sous/docs`
  - `mail.sous.localhost` -> MailDev UI

## Consequences

- **Positive:** 100% offline development capability; zero cost for testing high-volume tasks (like sending thousands of test emails); consistent environment for all developers.
- **Negative:** Requires significant system resources (RAM/CPU) to run the full stack locally.
