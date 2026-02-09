-- Initial database setup
-- This script runs when the Postgres container is first created.

-- Add any necessary extensions here
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- The tables themselves are created by Drizzle via `db:push` or `db:migrate`.
-- We should NOT attempt to ALTER tables that don't exist yet.
-- RLS enablement should move to Drizzle or a migration that runs AFTER table creation.

-- However, if we need to create the 'organizations' table early for some reason (rare with ORMs), we would do it here.
-- For now, we will leave this empty of schema modifications to prevent the startup crash.
-- The application code or migrations should handle RLS enablement.