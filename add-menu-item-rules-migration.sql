-- Migration to add menu_item_rules JSONB field to restaurants table
-- This replaces the text-based menu_notes with structured category-based rules
-- Run this in your Supabase SQL Editor

ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS menu_item_rules JSONB;

-- Example structure:
-- {
--   "category_rules": {
--     "Burgers": {
--       "default_sides": ["potato chips", "baked beans", "potato salad"],
--       "substitutions": [
--         {"name": "baked potato", "price": 3},
--         {"name": "Mac N Cheese", "price": 3}
--       ]
--     },
--     "Sandwiches": {
--       "default_sides": ["potato chips", "baked beans", "potato salad"],
--       "substitutions": [
--         {"name": "baked potato", "price": 3},
--         {"name": "Mac N Cheese", "price": 3}
--       ]
--     }
--   }
-- }

-- Create index for JSONB queries
CREATE INDEX IF NOT EXISTS idx_restaurants_menu_item_rules ON restaurants USING GIN (menu_item_rules);

