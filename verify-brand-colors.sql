-- Query 1: Check if restaurant exists and get its ID
SELECT 
  id,
  name,
  widget_id,
  is_active,
  deleted_at
FROM restaurants
WHERE widget_id = 'restaurant-1765748778920';

-- Query 2: Check if chatbot_settings row exists for this restaurant
SELECT 
  cs.id,
  cs.restaurant_id,
  cs.brand_colors,
  cs.brand_colors::text as brand_colors_text,
  cs.system_prompt,
  cs.updated_at,
  r.widget_id,
  r.name as restaurant_name
FROM chatbot_settings cs
JOIN restaurants r ON r.id = cs.restaurant_id
WHERE r.widget_id = 'restaurant-1765748778920';

-- Query 3: Check the exact JSON structure of brand_colors
SELECT 
  cs.brand_colors->>'primary' as primary_color,
  cs.brand_colors->>'secondary' as secondary_color,
  cs.brand_colors->>'accent' as accent_color,
  cs.brand_colors as full_json,
  jsonb_typeof(cs.brand_colors) as json_type,
  jsonb_object_keys(cs.brand_colors) as json_keys
FROM chatbot_settings cs
JOIN restaurants r ON r.id = cs.restaurant_id
WHERE r.widget_id = 'restaurant-1765748778920';

-- Query 4: Check if restaurant is active and not deleted (required for widget API)
SELECT 
  id,
  name,
  widget_id,
  is_active,
  deleted_at,
  CASE 
    WHEN deleted_at IS NOT NULL THEN 'DELETED'
    WHEN is_active = false THEN 'PAUSED'
    ELSE 'ACTIVE'
  END as status
FROM restaurants
WHERE widget_id = 'restaurant-1765748778920';

