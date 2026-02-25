-- Drop all RLS policies from tables, then disable RLS
-- Run this in your Supabase SQL Editor

-- Drop all policies from restaurants
DROP POLICY IF EXISTS "Public can read active restaurants" ON restaurants;
DROP POLICY IF EXISTS "Allow all operations on restaurants" ON restaurants;
DROP POLICY IF EXISTS "Service role can insert restaurants" ON restaurants;
DROP POLICY IF EXISTS "Service role can read restaurants" ON restaurants;
DROP POLICY IF EXISTS "Service role can update restaurants" ON restaurants;
DROP POLICY IF EXISTS "Service role can delete restaurants" ON restaurants;

-- Drop all policies from menu_items
DROP POLICY IF EXISTS "Public can read menu items for active restaurants" ON menu_items;
DROP POLICY IF EXISTS "Allow all operations on menu_items" ON menu_items;
DROP POLICY IF EXISTS "Service role can insert menu_items" ON menu_items;
DROP POLICY IF EXISTS "Service role can read menu_items" ON menu_items;
DROP POLICY IF EXISTS "Service role can update menu_items" ON menu_items;
DROP POLICY IF EXISTS "Service role can delete menu_items" ON menu_items;

-- Drop all policies from chatbot_settings
DROP POLICY IF EXISTS "Public can read chatbot settings for active restaurants" ON chatbot_settings;
DROP POLICY IF EXISTS "Allow all operations on chatbot_settings" ON chatbot_settings;
DROP POLICY IF EXISTS "Service role can insert chatbot_settings" ON chatbot_settings;
DROP POLICY IF EXISTS "Service role can read chatbot_settings" ON chatbot_settings;
DROP POLICY IF EXISTS "Service role can update chatbot_settings" ON chatbot_settings;
DROP POLICY IF EXISTS "Service role can delete chatbot_settings" ON chatbot_settings;

-- Drop all policies from conversation_logs
DROP POLICY IF EXISTS "Service role can insert conversation_logs" ON conversation_logs;
DROP POLICY IF EXISTS "Service role can read conversation_logs" ON conversation_logs;

-- Drop all policies from response_metrics
DROP POLICY IF EXISTS "Service role can insert response_metrics" ON response_metrics;
DROP POLICY IF EXISTS "Service role can read response_metrics" ON response_metrics;

-- Drop all policies from activity_log
DROP POLICY IF EXISTS "Service role can insert activity_log" ON activity_log;
DROP POLICY IF EXISTS "Service role can read activity_log" ON activity_log;

-- Drop all policies from active_sessions
DROP POLICY IF EXISTS "Service role can insert active_sessions" ON active_sessions;
DROP POLICY IF EXISTS "Service role can read active_sessions" ON active_sessions;

-- Drop all policies from user_login_sessions
DROP POLICY IF EXISTS "Service role can insert user_login_sessions" ON user_login_sessions;
DROP POLICY IF EXISTS "Service role can read user_login_sessions" ON user_login_sessions;

-- Drop all policies from chat_messages (for consistency)
DROP POLICY IF EXISTS "Allow all inserts on chat_messages" ON chat_messages;
DROP POLICY IF EXISTS "Allow all selects on chat_messages" ON chat_messages;
DROP POLICY IF EXISTS "Service role can insert chat_messages" ON chat_messages;
DROP POLICY IF EXISTS "Service role can read chat_messages" ON chat_messages;

-- Now disable RLS on all tables
ALTER TABLE restaurants DISABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE response_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log DISABLE ROW LEVEL SECURITY;
ALTER TABLE active_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_login_sessions DISABLE ROW LEVEL SECURITY;

-- Check for any remaining policies
SELECT 
  schemaname,
  tablename,
  policyname
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

