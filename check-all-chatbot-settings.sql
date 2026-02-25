-- Check ALL chatbot_settings rows to see if there are duplicates or wrong data
SELECT 
  cs.id,
  cs.restaurant_id,
  r.widget_id,
  r.name as restaurant_name,
  cs.brand_colors,
  cs.brand_colors::text as brand_colors_text,
  cs.updated_at
FROM chatbot_settings cs
JOIN restaurants r ON r.id = cs.restaurant_id
ORDER BY cs.updated_at DESC;

-- Specifically check for The Bucksnort Saloon
SELECT 
  cs.id,
  cs.restaurant_id,
  r.widget_id,
  r.name as restaurant_name,
  cs.brand_colors,
  cs.brand_colors::text as brand_colors_text,
  cs.updated_at
FROM chatbot_settings cs
JOIN restaurants r ON r.id = cs.restaurant_id
WHERE r.widget_id = 'restaurant-1765748778920'
   OR r.name = 'The Bucksnort Saloon';

