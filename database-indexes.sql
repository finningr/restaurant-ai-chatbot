-- Database Indexes for Production Performance
-- Run this in Supabase SQL Editor after creating tables

-- ============================================
-- RESTAURANTS TABLE INDEXES
-- ============================================

-- Index on widget_id (most common lookup for widget endpoint)
CREATE INDEX IF NOT EXISTS idx_restaurants_widget_id 
ON restaurants(widget_id);

-- Index on is_active (for filtering active restaurants)
CREATE INDEX IF NOT EXISTS idx_restaurants_is_active 
ON restaurants(is_active) 
WHERE is_active = true;

-- Composite index for common query pattern
CREATE INDEX IF NOT EXISTS idx_restaurants_widget_active 
ON restaurants(widget_id, is_active) 
WHERE is_active = true;

-- ============================================
-- MENU_ITEMS TABLE INDEXES
-- ============================================

-- Index on restaurant_id (foreign key, used in JOINs)
CREATE INDEX IF NOT EXISTS idx_menu_items_restaurant_id 
ON menu_items(restaurant_id);

-- Index on available (for filtering available items)
CREATE INDEX IF NOT EXISTS idx_menu_items_available 
ON menu_items(available) 
WHERE available = true;

-- Index on category (for category-based queries)
CREATE INDEX IF NOT EXISTS idx_menu_items_category 
ON menu_items(category);

-- Composite index for common query: restaurant + available + category
CREATE INDEX IF NOT EXISTS idx_menu_items_restaurant_available_category 
ON menu_items(restaurant_id, available, category) 
WHERE available = true;

-- Index on name (for search/filtering by name)
CREATE INDEX IF NOT EXISTS idx_menu_items_name 
ON menu_items(name);

-- ============================================
-- CHATBOT_SETTINGS TABLE INDEXES
-- ============================================

-- Index on restaurant_id (foreign key)
CREATE INDEX IF NOT EXISTS idx_chatbot_settings_restaurant_id 
ON chatbot_settings(restaurant_id);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check all indexes were created
SELECT 
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
    AND tablename IN ('restaurants', 'menu_items', 'chatbot_settings')
ORDER BY tablename, indexname;

-- Test query performance (should use indexes)
EXPLAIN ANALYZE
SELECT * FROM restaurants 
WHERE widget_id = 'test-widget-id' AND is_active = true;

EXPLAIN ANALYZE
SELECT * FROM menu_items 
WHERE restaurant_id = '00000000-0000-0000-0000-000000000000' 
    AND available = true;


