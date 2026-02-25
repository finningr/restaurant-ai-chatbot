-- Check existing restaurants and their widget_ids
-- Run this in Supabase SQL Editor to see what restaurants you have

SELECT 
  id,
  name,
  widget_id,
  owner_email,
  created_at
FROM restaurants
ORDER BY created_at DESC;

