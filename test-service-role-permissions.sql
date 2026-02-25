-- Test service role permissions
-- Run this in Supabase SQL Editor to verify permissions

-- Grant explicit permissions to service_role (just to be sure)
GRANT ALL ON conversation_logs TO service_role;
GRANT ALL ON response_metrics TO service_role;
GRANT ALL ON active_sessions TO service_role;
GRANT ALL ON user_login_sessions TO service_role;
GRANT ALL ON activity_log TO service_role;

-- Verify grants
SELECT 
  grantee, 
  table_name, 
  privilege_type
FROM information_schema.role_table_grants
WHERE table_name IN ('conversation_logs', 'response_metrics', 'active_sessions', 'user_login_sessions', 'activity_log')
  AND grantee = 'service_role'
ORDER BY table_name, privilege_type;

