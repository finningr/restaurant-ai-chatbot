-- Fix id column defaults for conversation_logs and response_metrics
-- Run this in Supabase SQL Editor

-- Fix conversation_logs id column
DO $$ 
BEGIN
    -- Check if id column exists and doesn't have a default
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'conversation_logs' 
        AND column_name = 'id'
        AND column_default IS NULL
    ) THEN
        -- Set default to gen_random_uuid()
        ALTER TABLE conversation_logs 
        ALTER COLUMN id SET DEFAULT gen_random_uuid();
    END IF;
END $$;

-- Fix response_metrics id column
DO $$ 
BEGIN
    -- Check if id column exists and doesn't have a default
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'response_metrics' 
        AND column_name = 'id'
        AND column_default IS NULL
    ) THEN
        -- Set default to gen_random_uuid()
        ALTER TABLE response_metrics 
        ALTER COLUMN id SET DEFAULT gen_random_uuid();
    END IF;
END $$;

-- Verify the defaults are set
SELECT 
    table_name,
    column_name,
    column_default
FROM information_schema.columns
WHERE table_name IN ('conversation_logs', 'response_metrics')
  AND column_name = 'id';

