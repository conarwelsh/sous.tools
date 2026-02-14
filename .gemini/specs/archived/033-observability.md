# Spec 033: Observability (OpenTelemetry & HyperDX)

## Overview
To improve system visibility and debugging, we will transition from basic local logging to a comprehensive observability stack based on OpenTelemetry (OTel) and HyperDX. This will provide distributed tracing, centralized logging, and metrics aggregation.

## Requirements
1.  **OpenTelemetry Integration**: Instrument the API, CLI, and Web apps with OTel SDKs.
2.  **HyperDX Exporter**: Export logs, traces, and metrics to HyperDX using the OTLP/HTTP or OTLP/gRPC protocol.
3.  **Trace Propagation**: Ensure trace context is propagated between services (e.g., from Web to API).
4.  **Semantic Conventions**: Follow OTel semantic conventions for logging and tracing (e.g., `service.name`, `deployment.environment`).
5.  **Graceful Fallback**: If HyperDX is unavailable or credentials are missing, logging should fall back to standard stdout.
6.  **Centralized Logger Upgrade**: Update `@sous/logger` to support OTel-based logging.

## Implementation Plan
1.  Install necessary OTel packages: `@opentelemetry/sdk-node`, `@opentelemetry/exporter-trace-otlp-http`, etc.
2.  Create an `observability.ts` initialization script in `@sous/logger` or a dedicated package.
3.  Update `createLogger` in `@sous/logger` to use an OTel-compatible transport.
4.  Configure apps to run the observability initialization at startup.
5.  Update `.env.example` and Infisical with HyperDX ingestion keys.
