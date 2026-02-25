-- Fix active_sessions table to support ON CONFLICT
-- Run this in Supabase SQL Editor

-- Add unique constraint if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'unique_active_session'
    ) THEN
        ALTER TABLE active_sessions 
        ADD CONSTRAINT unique_active_session 
        UNIQUE (user_email, restaurant_id);
    END IF;
END $$;

-- Verify constraint exists
SELECT 
    conname AS constraint_name,
    contype AS constraint_type
FROM pg_constraint
WHERE conrelid = 'active_sessions'::regclass
  AND conname = 'unique_active_session';

