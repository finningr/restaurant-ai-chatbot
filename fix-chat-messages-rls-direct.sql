-- DIRECT FIX: Disable RLS for inserts on chat_messages table
-- This allows the API to insert messages without RLS blocking
-- Run this in your Supabase SQL Editor

-- First, drop all existing policies
DROP POLICY IF EXISTS "Users can view their own restaurant messages" ON chat_messages;
DROP POLICY IF EXISTS "Service role can insert chat messages" ON chat_messages;
DROP POLICY IF EXISTS "Allow service role inserts" ON chat_messages;
DROP POLICY IF EXISTS "Allow all inserts" ON chat_messages;

-- Create a permissive policy that allows ALL inserts
-- This will work regardless of whether service role is configured
CREATE POLICY "Allow all inserts on chat_messages"
ON chat_messages
FOR INSERT
TO public
WITH CHECK (true);

-- Also allow all selects for now (you can restrict this later)
CREATE POLICY "Allow all selects on chat_messages"
ON chat_messages
FOR SELECT
TO public
USING (true);

-- Verify the policies were created
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd,
    roles,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
    AND tablename = 'chat_messages'
ORDER BY policyname;

-- If the above doesn't work, you can temporarily disable RLS entirely:
-- ALTER TABLE chat_messages DISABLE ROW LEVEL SECURITY;
-- (But this is less secure, so only use if policies don't work)

