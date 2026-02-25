-- Check RLS status for all tables
-- Run this in your Supabase SQL Editor

SELECT 
  schemaname,
  tablename,
  CASE 
    WHEN rowsecurity = true THEN 'ENABLED'
    ELSE 'DISABLED'
  END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Or more detailed version showing all relevant tables:
SELECT 
  t.tablename,
  CASE 
    WHEN c.relrowsecurity = true THEN 'ENABLED'
    ELSE 'DISABLED'
  END as rls_status
FROM pg_tables t
JOIN pg_class c ON c.relname = t.tablename
WHERE t.schemaname = 'public'
  AND t.tablename IN (
    'restaurants',
    'menu_items',
    'chatbot_settings',
    'chat_messages',
    'conversation_logs',
    'response_metrics',
    'activity_log',
    'active_sessions',
    'user_login_sessions'
  )
ORDER BY t.tablename;

