-- Delete all test data from Supabase database
-- Run these commands in your Supabase SQL Editor

-- Delete in correct order due to foreign key constraints
DELETE FROM chatbot_settings;
DELETE FROM menu_items;
DELETE FROM restaurants;

-- Verify tables are empty
SELECT 'restaurants' as table_name, COUNT(*) as count FROM restaurants
UNION ALL
SELECT 'menu_items' as table_name, COUNT(*) as count FROM menu_items
UNION ALL
SELECT 'chatbot_settings' as table_name, COUNT(*) as count FROM chatbot_settings;
