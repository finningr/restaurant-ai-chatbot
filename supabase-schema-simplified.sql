-- Simplified Supabase Schema for Restaurant Chatbot
-- Run this in your Supabase SQL Editor

-- Create the main restaurants table
CREATE TABLE restaurants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  phone VARCHAR(50),
  email VARCHAR(255),
  address TEXT,
  hours TEXT,
  cuisine VARCHAR(100),
  price_range VARCHAR(10),
  website_url VARCHAR(255),
  widget_id VARCHAR(50) UNIQUE NOT NULL,
  raw_menu_text TEXT, -- Store original copy/pasted menu text
  profitable_dishes TEXT,
  upselling_style VARCHAR(50),
  dietary_restrictions TEXT[],
  dietary_restrictions_other TEXT,
  special_services TEXT[],
  special_services_other TEXT,
  payment_methods TEXT[],
  payment_methods_other TEXT,
  dress_code TEXT,
  brand_colors JSONB, -- Store primary, secondary, accent colors
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create menu items table
CREATE TABLE menu_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10,2),
  category VARCHAR(100),
  description TEXT,
  available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chatbot settings table
CREATE TABLE chatbot_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  system_prompt TEXT,
  behavior_rules JSONB,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample data
INSERT INTO restaurants (
  name, description, phone, address, hours, cuisine, price_range, 
  website_url, widget_id, upselling_style, dietary_restrictions,
  special_services, payment_methods, dress_code, brand_colors
) VALUES (
  'Vintage Himalayan Restaurant',
  'Authentic Himalayan cuisine featuring traditional dishes from Nepal, Tibet, and Bhutan. We offer a warm, family-friendly atmosphere with fresh ingredients and traditional cooking methods.',
  '(303) 376-9954',
  '123 Main Street, Denver, CO 80202',
  'Monday-Sunday: 11:00 AM - 10:00 PM',
  'Himalayan',
  '$$',
  'https://www.vintagehimalayan.com',
  'vintage-himalayan-001',
  'educational',
  ARRAY['Vegetarian', 'Gluten-free', 'Dairy-free'],
  ARRAY['Takeout', 'Delivery', 'Catering', 'Private events'],
  ARRAY['Cash', 'Credit cards', 'Debit cards', 'Mobile Payments'],
  'Casual',
  '{"primary": "#402E18", "secondary": "#97580B", "accent": "#8C2D18"}'
);

-- Insert sample menu items
INSERT INTO menu_items (restaurant_id, name, price, category, description) 
SELECT id, 'Chicken Tandoori', 15.99, 'Main Course', 'Tender chicken marinated in yogurt and spices, cooked in clay oven'
FROM restaurants WHERE widget_id = 'vintage-himalayan-001';

INSERT INTO menu_items (restaurant_id, name, price, category, description) 
SELECT id, 'Paneer Tikka Kebab', 13.99, 'Main Course', 'Cottage cheese cubes marinated in spices and grilled'
FROM restaurants WHERE widget_id = 'vintage-himalayan-001';

INSERT INTO menu_items (restaurant_id, name, price, category, description) 
SELECT id, 'Dal Tadka', 11.99, 'Main Course', 'Yellow lentils tempered with garlic, cumin, and red chili'
FROM restaurants WHERE widget_id = 'vintage-himalayan-001';

INSERT INTO menu_items (restaurant_id, name, price, category, description) 
SELECT id, 'Tomato Garlic Soup', 6.99, 'Soup', 'Velvety tomato soup infused with roasted garlic'
FROM restaurants WHERE widget_id = 'vintage-himalayan-001';

INSERT INTO menu_items (restaurant_id, name, price, category, description) 
SELECT id, 'Vegetable Samosa', 4.99, 'Appetizer', 'Crispy golden pastries filled with spiced potatoes & peas'
FROM restaurants WHERE widget_id = 'vintage-himalayan-001';

INSERT INTO menu_items (restaurant_id, name, price, category, description) 
SELECT id, 'Mango Lassi', 4.99, 'Beverage', 'Refreshing yogurt drink with sweet mango'
FROM restaurants WHERE widget_id = 'vintage-himalayan-001';

-- Enable Row Level Security (RLS)
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allow all operations for now - customize as needed)
CREATE POLICY "Allow all operations on restaurants" ON restaurants FOR ALL USING (true);
CREATE POLICY "Allow all operations on menu_items" ON menu_items FOR ALL USING (true);
CREATE POLICY "Allow all operations on chatbot_settings" ON chatbot_settings FOR ALL USING (true);

-- Create indexes for better performance
CREATE INDEX idx_restaurants_widget_id ON restaurants(widget_id);
CREATE INDEX idx_menu_items_restaurant_id ON menu_items(restaurant_id);
CREATE INDEX idx_chatbot_settings_restaurant_id ON chatbot_settings(restaurant_id);
