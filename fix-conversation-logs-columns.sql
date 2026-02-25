-- Fix missing columns in conversation_logs and response_metrics
-- Run this in your Supabase SQL Editor

-- Add missing columns to conversation_logs if they don't exist
DO $$ 
BEGIN
  -- Add ip_address if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'conversation_logs' AND column_name = 'ip_address'
  ) THEN
    ALTER TABLE conversation_logs ADD COLUMN ip_address VARCHAR(45);
  END IF;

  -- Add user_agent if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'conversation_logs' AND column_name = 'user_agent'
  ) THEN
    ALTER TABLE conversation_logs ADD COLUMN user_agent TEXT;
  END IF;
END $$;

-- Add missing columns to response_metrics if they don't exist
DO $$ 
BEGIN
  -- Add session_id if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'response_metrics' AND column_name = 'session_id'
  ) THEN
    ALTER TABLE response_metrics ADD COLUMN session_id VARCHAR(255);
  END IF;
END $$;

-- Verify columns exist
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name IN ('conversation_logs', 'response_metrics')
  AND column_name IN ('ip_address', 'user_agent', 'session_id')
ORDER BY table_name, column_name;

