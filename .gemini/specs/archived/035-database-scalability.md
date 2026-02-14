# Spec 035: Database Scalability (Reader/Writer Separation)

## Overview

As the Sous platform scales, a single database instance may become a bottleneck. To improve performance and reliability, we will support splitting database traffic between a "Writer" (Primary) and one or more "Readers" (Replicas).

## Requirements

1.  **Dual Pool Architecture**: `DatabaseService` should maintain two separate Drizzle instances: one for writing and one for reading.
2.  **Configuration Driven**: The service must use `config.db.url` for the writer and `config.db.readerUrl` for the reader. If `readerUrl` is not provided, it should default to the writer URL.
3.  **Scoped Access**:
    - `db.query`, `db.select`: Use the Reader instance.
    - `db.insert`, `db.update`, `db.delete`, `db.transaction`: Use the Writer instance.
4.  **Transaction Consistency**: All operations within a transaction MUST use the Writer instance to ensure Read-After-Write consistency.
5.  **Health Monitoring**: Both pools should be monitored for connectivity independently.

## Implementation Plan

1.  Update `DatabaseService` to include `readonlyDb` and `writerDb` properties.
2.  Refactor `onModuleInit` to initialize both pools.
3.  Implement proxy logic or helper methods to easily access the correct instance.
4.  Update existing services to use the appropriate instance for their operations.
