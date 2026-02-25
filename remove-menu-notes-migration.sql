-- Migration to remove menu_notes column from restaurants table
-- Run this in your Supabase SQL Editor

-- Drop the menu_notes column
ALTER TABLE restaurants DROP COLUMN IF EXISTS menu_notes;

