-- Query to find restaurants that serve Mac N Cheese
-- Run this in your Supabase SQL Editor

SELECT 
  r.id,
  r.name AS restaurant_name,
  r.widget_id,
  mi.id AS menu_item_id,
  mi.name AS menu_item_name,
  mi.price,
  mi.category,
  mi.description,
  mi.menu_type,
  mi.created_at AS menu_item_created_at
FROM restaurants r
JOIN menu_items mi ON mi.restaurant_id = r.id
WHERE LOWER(mi.name) LIKE '%mac%cheese%' 
   OR LOWER(mi.name) LIKE '%mac n cheese%'
   OR LOWER(mi.name) LIKE '%mac and cheese%'
ORDER BY r.name, mi.name;

