-- Verify and fix RLS on conversation_logs and response_metrics
-- Run this in your Supabase SQL Editor

-- Check current RLS status
SELECT 
  schemaname,
  tablename,
  CASE 
    WHEN rowsecurity = true THEN 'ENABLED'
    ELSE 'DISABLED'
  END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('conversation_logs', 'response_metrics', 'chat_messages', 'active_sessions')
ORDER BY tablename;

-- Force disable RLS on conversation_logs
ALTER TABLE conversation_logs DISABLE ROW LEVEL SECURITY;

-- Force disable RLS on response_metrics  
ALTER TABLE response_metrics DISABLE ROW LEVEL SECURITY;

-- Drop any remaining policies (just to be sure)
DROP POLICY IF EXISTS "Service role can insert conversation_logs" ON conversation_logs;
DROP POLICY IF EXISTS "Service role can read conversation_logs" ON conversation_logs;
DROP POLICY IF EXISTS "Service role can insert response_metrics" ON response_metrics;
DROP POLICY IF EXISTS "Service role can read response_metrics" ON response_metrics;

-- Verify RLS is disabled
SELECT 
  t.tablename,
  CASE 
    WHEN c.relrowsecurity = true THEN 'ENABLED'
    ELSE 'DISABLED'
  END as rls_status
FROM pg_tables t
JOIN pg_class c ON c.relname = t.tablename
WHERE t.schemaname = 'public'
  AND t.tablename IN ('conversation_logs', 'response_metrics')
ORDER BY t.tablename;

