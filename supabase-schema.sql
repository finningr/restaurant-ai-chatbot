-- Complete Supabase Database Schema for Multi-Restaurant Chatbot System
-- Run this in your Supabase SQL Editor

-- Enable Row Level Security
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_settings ENABLE ROW LEVEL SECURITY;

-- Main restaurants table with ALL fields from manual input
CREATE TABLE restaurants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Basic Information
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  phone VARCHAR(50),
  email VARCHAR(255),
  address TEXT,
  
  -- Hours & Schedule
  hours TEXT,
  kitchen_hours VARCHAR(255),
  happy_hour VARCHAR(255),
  busy_times TEXT[], -- Array of busy times
  busy_times_other VARCHAR(255),
  
  -- Menu & Food
  cuisine VARCHAR(100),
  price_range VARCHAR(10), -- $, $$, $$$, $$$$
  menu_items TEXT NOT NULL, -- Raw menu text
  profitable_dishes TEXT,
  upselling_style VARCHAR(50), -- subtle, direct, educational, combination
  specials TEXT, -- Daily/weekly food specials
  
  -- Dietary & Services
  dietary_restrictions TEXT[], -- Array of dietary options
  dietary_restrictions_other VARCHAR(255),
  special_services TEXT[], -- Array of services
  special_services_other VARCHAR(255),
  payment_methods TEXT[], -- Array of payment methods
  payment_methods_other VARCHAR(255),
  
  -- Brand & Personality
  target_customers TEXT,
  unique_features TEXT,
  brand_personality TEXT,
  
  -- Additional Information
  common_questions TEXT,
  challenges TEXT,
  additional_info TEXT,
  special_features TEXT,
  
  -- Reviews & Events
  reviews TEXT,
  events TEXT,
  
  -- Service Details
  catering_details TEXT,
  dietary_options TEXT,
  parking_info TEXT,
  accessibility TEXT,
  dress_code TEXT,
  reservations TEXT,
  delivery_info TEXT,
  private_events TEXT,
  
  -- Technical
  website_url VARCHAR(255),
  widget_id VARCHAR(50) UNIQUE NOT NULL,
  brand_colors JSONB, -- {primary, secondary, accent}
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Menu items table (parsed from raw menu text)
CREATE TABLE menu_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10,2),
  category VARCHAR(100),
  description TEXT,
  ingredients TEXT,
  allergens JSONB,
  dietary_tags JSONB,
  available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chatbot behavior settings
CREATE TABLE chatbot_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  system_prompt TEXT,
  behavior_rules JSONB,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_restaurants_widget_id ON restaurants(widget_id);
CREATE INDEX idx_restaurants_name ON restaurants(name);
CREATE INDEX idx_restaurants_is_active ON restaurants(is_active);
CREATE INDEX idx_menu_items_restaurant_id ON menu_items(restaurant_id);
CREATE INDEX idx_chatbot_settings_restaurant_id ON chatbot_settings(restaurant_id);

-- Row Level Security Policies
CREATE POLICY "Public can read active restaurants" ON restaurants
  FOR SELECT USING (is_active = true);

CREATE POLICY "Public can read menu items for active restaurants" ON menu_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM restaurants 
      WHERE restaurants.id = menu_items.restaurant_id 
      AND restaurants.is_active = true
    )
  );

CREATE POLICY "Public can read chatbot settings for active restaurants" ON chatbot_settings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM restaurants 
      WHERE restaurants.id = chatbot_settings.restaurant_id 
      AND restaurants.is_active = true
    )
  );

-- Insert a sample restaurant for testing
INSERT INTO restaurants (
  name, 
  description, 
  phone, 
  address, 
  hours, 
  cuisine, 
  price_range, 
  menu_items, 
  profitable_dishes, 
  upselling_style, 
  dietary_restrictions, 
  special_services, 
  payment_methods, 
  common_questions, 
  target_customers, 
  unique_features, 
  website_url, 
  widget_id, 
  brand_colors
) VALUES (
  'Vintage Himalayan Restaurant',
  'Authentic Himalayan cuisine featuring traditional dishes from Nepal, Tibet, and Bhutan. We offer a warm, family-friendly atmosphere with fresh ingredients and traditional cooking methods.',
  '(303) 376-9954',
  '123 Main Street, Denver, CO 80202',
  'Monday-Sunday: 11:00 AM - 10:00 PM',
  'Himalayan',
  '$$',
  'Chicken Tandoori - $15.99
Paneer Tikka Kebab - $13.99
Dal Tadka - $11.99
Tomato Garlic Soup - $6.99
Vegetable Samosa - $4.99
Mango Lassi - $4.99',
  'Chicken Tandoori, Paneer Tikka Kebab, Dal Tadka',
  'educational',
  ARRAY['Vegetarian', 'Gluten-free', 'Dairy-free'],
  ARRAY['Takeout', 'Delivery', 'Catering', 'Private events'],
  ARRAY['Cash', 'Credit cards', 'Debit cards', 'Mobile Payments'],
  'What are your most popular dishes? Do you have vegetarian options? What is your spice level?',
  'Families, couples, food enthusiasts, and anyone looking for authentic Himalayan cuisine',
  'Traditional clay oven cooking, authentic spices imported from the Himalayas, family recipes passed down through generations',
  'https://www.vintagehimalayan.com',
  'vintage-himalayan-001',
  '{"primary": "#402E18", "secondary": "#97580B", "accent": "#8C2D18"}'
);

-- Insert sample chatbot settings
INSERT INTO chatbot_settings (restaurant_id, system_prompt, behavior_rules)
SELECT 
  r.id,
  'You are a helpful assistant for Vintage Himalayan Restaurant. Help customers with menu questions, reservations, and restaurant information.',
  '{"recommendationStyle": "conversational", "antiRepetition": true, "includePhoneNumber": true}'::jsonb
FROM restaurants r 
WHERE r.widget_id = 'vintage-himalayan-001';
