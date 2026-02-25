-- Disable RLS on all tables (everything uses service role via API routes)
-- Run this in your Supabase SQL Editor

-- Disable RLS on all tables since everything goes through backend API routes using service role
ALTER TABLE restaurants DISABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE response_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log DISABLE ROW LEVEL SECURITY;
ALTER TABLE active_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_login_sessions DISABLE ROW LEVEL SECURITY;

-- Step 3: Verify the changes
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

