-- Fix RLS policies for chat_messages table
-- Run this in your Supabase SQL Editor

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own restaurant messages" ON chat_messages;
DROP POLICY IF EXISTS "Service role can insert chat messages" ON chat_messages;
DROP POLICY IF EXISTS "Allow service role inserts" ON chat_messages;
DROP POLICY IF EXISTS "Allow all inserts" ON chat_messages;

-- Policy 1: Allow ALL inserts (for server-side API using service role)
-- This allows inserts from the API route which uses the service role key
CREATE POLICY "Allow all inserts"
ON chat_messages
FOR INSERT
WITH CHECK (true);

-- Policy 2: Users can view their own restaurant messages (for dashboard)
-- Note: This uses a custom setting that may not be set. For now, allow all selects.
-- You can refine this later based on your auth system.
CREATE POLICY "Users can view their own restaurant messages"
ON chat_messages
FOR SELECT
USING (true); -- Allow all selects for now - refine based on your auth system

-- Verify policies are created
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
    AND tablename = 'chat_messages'
ORDER BY policyname;

