-- Migration to add dietary_tags column to menu_items table
-- Run this in your Supabase SQL Editor

-- Add dietary_tags column to menu_items table
ALTER TABLE menu_items 
ADD COLUMN dietary_tags TEXT[] DEFAULT '{}';

-- Update existing menu items to have empty dietary_tags array
UPDATE menu_items 
SET dietary_tags = '{}' 
WHERE dietary_tags IS NULL;

-- Add a comment to document the column
COMMENT ON COLUMN menu_items.dietary_tags IS 'Array of dietary tags like GF, DF, V, VG, etc.';
