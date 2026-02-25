-- Update brand colors to nice gray palette
-- Primary: #374151 (dark gray for headers/main elements)
-- Secondary: #6B7280 (medium gray for secondary elements)  
-- Accent: #9CA3AF (lighter gray for accents/highlights)

UPDATE chatbot_settings
SET brand_colors = '{
  "primary": "#374151",
  "secondary": "#6B7280",
  "accent": "#9CA3AF"
}'::jsonb,
updated_at = NOW()
WHERE restaurant_id = (
  SELECT id FROM restaurants WHERE widget_id = 'restaurant-1765748778920'
)
RETURNING 
  restaurant_id,
  brand_colors,
  updated_at;

-- Verify the update
SELECT 
  cs.restaurant_id,
  r.widget_id,
  r.name,
  cs.brand_colors,
  cs.brand_colors->>'primary' as primary_color,
  cs.brand_colors->>'secondary' as secondary_color,
  cs.brand_colors->>'accent' as accent_color,
  cs.updated_at
FROM chatbot_settings cs
JOIN restaurants r ON r.id = cs.restaurant_id
WHERE r.widget_id = 'restaurant-1765748778920';

