-- Disable RLS on conversation_logs and response_metrics tables
-- Run this in your Supabase SQL Editor
-- These tables are for internal analytics/AI factory, so we disable RLS like chat_messages

-- Disable RLS on conversation_logs (same as chat_messages)
ALTER TABLE conversation_logs DISABLE ROW LEVEL SECURITY;

-- Disable RLS on response_metrics (same as chat_messages)
ALTER TABLE response_metrics DISABLE ROW LEVEL SECURITY;

-- Note: Since we're using supabaseAdmin (service role), RLS would be bypassed anyway,
-- but disabling it entirely matches the setup for chat_messages and ensures no issues

