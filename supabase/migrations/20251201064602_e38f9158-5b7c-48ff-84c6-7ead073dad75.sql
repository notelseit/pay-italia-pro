-- Move pg_net extension from public schema to extensions schema
-- This addresses security finding: Extension in Public

-- Create extensions schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS extensions;

-- Drop the extension from public and recreate in extensions schema
DROP EXTENSION IF EXISTS pg_net CASCADE;
CREATE EXTENSION IF NOT EXISTS pg_net SCHEMA extensions;