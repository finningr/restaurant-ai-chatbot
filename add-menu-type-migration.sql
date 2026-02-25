-- Migration: Add menu_type column to menu_items table
-- Run this in your Supabase SQL Editor

-- Step 1: Add menu_type column to menu_items table
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS menu_type VARCHAR(50);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_menu_items_menu_type ON menu_items(menu_type);

-- Step 2: Update existing menu items to have 'All Day' as default menu type
-- (optional - only if you want to set a default for existing items)
UPDATE menu_items SET menu_type = 'All Day' WHERE menu_type IS NULL OR menu_type = '';




