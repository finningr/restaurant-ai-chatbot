-- Query to find baklava and its related details in the database
-- This searches menu_items table and joins with restaurants table

-- Option 1: Case-insensitive search for "baklava" in menu items
SELECT 
    mi.id AS menu_item_id,
    mi.name AS menu_item_name,
    mi.price,
    mi.category,
    mi.description,
    mi.dietary_tags,
    mi.available,
    mi.created_at AS menu_item_created_at,
    r.id AS restaurant_id,
    r.name AS restaurant_name,
    r.widget_id,
    r.cuisine,
    r.price_range,
    r.phone,
    r.email,
    r.address_street,
    r.address_city,
    r.address_state,
    r.address_zip,
    r.is_active,
    r.owner_email
FROM menu_items mi
JOIN restaurants r ON mi.restaurant_id = r.id
WHERE LOWER(mi.name) LIKE '%baklava%'
ORDER BY r.name, mi.name;

-- Option 2: Also search in description field
SELECT 
    mi.id AS menu_item_id,
    mi.name AS menu_item_name,
    mi.price,
    mi.category,
    mi.description,
    mi.dietary_tags,
    mi.available,
    mi.created_at AS menu_item_created_at,
    r.id AS restaurant_id,
    r.name AS restaurant_name,
    r.widget_id,
    r.cuisine,
    r.price_range,
    r.phone,
    r.email,
    r.address_street,
    r.address_city,
    r.address_state,
    r.address_zip,
    r.is_active,
    r.owner_email
FROM menu_items mi
JOIN restaurants r ON mi.restaurant_id = r.id
WHERE LOWER(mi.name) LIKE '%baklava%'
   OR LOWER(mi.description) LIKE '%baklava%'
ORDER BY r.name, mi.name;

-- Option 3: Check if baklava is marked as profitable
SELECT 
    mi.id AS menu_item_id,
    mi.name AS menu_item_name,
    mi.price,
    mi.category,
    mi.description,
    mi.dietary_tags,
    mi.available,
    CASE 
        WHEN r.profitable_dishes->>'dish_ids' LIKE '%' || mi.id::text || '%' 
             OR r.profitable_dishes->>'dish_names' LIKE '%' || mi.name || '%'
        THEN true 
        ELSE false 
    END AS is_profitable,
    r.id AS restaurant_id,
    r.name AS restaurant_name,
    r.widget_id,
    r.cuisine,
    r.profitable_dishes
FROM menu_items mi
JOIN restaurants r ON mi.restaurant_id = r.id
WHERE LOWER(mi.name) LIKE '%baklava%'
ORDER BY r.name, mi.name;

