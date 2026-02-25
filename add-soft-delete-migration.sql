-- Migration: Add soft delete support for restaurants
-- Run this in your Supabase SQL Editor

-- Step 1: Add deleted_at column to restaurants table
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- Create index for faster queries on deleted_at
CREATE INDEX IF NOT EXISTS idx_restaurants_deleted_at ON restaurants(deleted_at);

-- Step 2: Update widget API queries to exclude deleted restaurants
-- (This will be handled in the API code, but good to have the column ready)



