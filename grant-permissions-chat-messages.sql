-- Grant INSERT permissions on chat_messages table
-- Run this in your Supabase SQL Editor

-- Grant INSERT permission to authenticated role (for service role)
GRANT INSERT ON chat_messages TO authenticated;
GRANT INSERT ON chat_messages TO anon;
GRANT INSERT ON chat_messages TO service_role;

-- Also grant SELECT for completeness
GRANT SELECT ON chat_messages TO authenticated;
GRANT SELECT ON chat_messages TO anon;
GRANT SELECT ON chat_messages TO service_role;

-- Note: No sequence grants needed - UUID primary keys use gen_random_uuid(), not sequences

-- Verify grants
SELECT 
    grantee,
    privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
    AND table_name = 'chat_messages'
ORDER BY grantee, privilege_type;

