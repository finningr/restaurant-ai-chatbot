-- Force disable RLS on conversation_logs and response_metrics
-- Run this in Supabase SQL Editor

-- Step 1: Drop ALL policies first (if any exist)
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public' AND tablename IN ('conversation_logs', 'response_metrics')) LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON ' || quote_ident(r.tablename);
    END LOOP;
END $$;

-- Step 2: Disable RLS
ALTER TABLE conversation_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE response_metrics DISABLE ROW LEVEL SECURITY;

-- Step 3: Verify RLS is disabled
SELECT 
    tablename,
    CASE 
        WHEN relrowsecurity THEN 'ENABLED' 
        ELSE 'DISABLED' 
    END as rls_status
FROM pg_tables t
JOIN pg_class c ON c.relname = t.tablename
WHERE t.schemaname = 'public' 
  AND t.tablename IN ('conversation_logs', 'response_metrics');

-- Step 4: Verify no policies exist
SELECT tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('conversation_logs', 'response_metrics');

