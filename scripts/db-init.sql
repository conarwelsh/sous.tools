-- Enable RLS on all tenant-specific tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE displays ENABLE ROW LEVEL SECURITY;
ALTER TABLE display_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE telemetry ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Create policies for Organization isolation
-- These policies assume a session variable 'app.current_org_id' is set by the API
-- Or we use the organization_id column directly if the user is bound to an org.

-- For simplicity in development, we'll create policies that check the current_setting('app.current_org_id')
-- The API will need to execute `SET LOCAL app.current_org_id = '...'` in a transaction.

DO $$ 
DECLARE 
    t text;
BEGIN
    FOR t IN 
        SELECT table_name 
        FROM information_schema.columns 
        WHERE column_name = 'organization_id' 
        AND table_schema = 'public'
    LOOP
        EXECUTE format('CREATE POLICY tenant_isolation_policy ON %I USING (organization_id = (current_setting(''app.current_org_id'', true))::uuid)', t);
    END LOOP;
END $$;

-- Organizations table special case (id is the org_id)
CREATE POLICY organization_isolation_policy ON organizations USING (id = (current_setting('app.current_org_id', true))::uuid);
