-- Temporarily disable RLS on chat_messages to test
-- This will allow inserts to work immediately
-- Run this in your Supabase SQL Editor

-- Disable RLS entirely for chat_messages table
ALTER TABLE chat_messages DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
    AND tablename = 'chat_messages';

-- This should show rowsecurity = false

