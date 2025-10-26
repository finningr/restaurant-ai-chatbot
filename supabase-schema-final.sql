-- Simplified Supabase Schema for Restaurant Chatbot
-- Run this in your Supabase SQL Editor

-- Drop existing tables if they exist (in correct order due to foreign keys)
DROP TABLE IF EXISTS chatbot_settings CASCADE;
DROP TABLE IF EXISTS menu_items CASCADE;
DROP TABLE IF EXISTS restaurants CASCADE;

-- Create the main restaurants table
CREATE TABLE restaurants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT, -- Include special services, dress code, dietary info here
  phone VARCHAR(20), -- Store as: "(303) 376-9954" or "+1-303-376-9954"
  email VARCHAR(255), -- Store as: "info@restaurant.com"
  -- Structured address fields for better chatbot responses
  address_street VARCHAR(255),    -- "123 Main St"
  address_city VARCHAR(100),       -- "Denver" 
  address_state VARCHAR(50),        -- "CO"
  address_zip VARCHAR(20),         -- "80202"
  address_country VARCHAR(100),    -- "USA"
  -- Structured hours for smart chatbot responses
  hours JSONB, -- Store as: {"monday": "9am-10pm", "tuesday": "9am-10pm", ...}
  cuisine VARCHAR(100),
  price_range VARCHAR(10),
  website_url VARCHAR(255),
  widget_id VARCHAR(50) UNIQUE NOT NULL,
  raw_menu_text TEXT, -- Store original copy/pasted menu text for debugging
  profitable_dishes JSONB, -- Store as: {"dish_ids": ["uuid1", "uuid2"], "dish_names": ["Chicken Tandoori", "Beef Curry"]}
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
  dietary_tags TEXT[], -- Array of dietary tags like ['GF', 'DF', 'V', 'VG']
  available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chatbot settings table
CREATE TABLE chatbot_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  system_prompt TEXT, -- Core AI instructions: "You are a helpful assistant for [Restaurant Name]..."
  behavior_rules JSONB, -- {"tone": "friendly", "upsellingStyle": "educational"}
  brand_colors JSONB, -- {"primary": "#4F46E5", "secondary": "#6366F1", "accent": "#818CF8"}
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_restaurants_widget_id ON restaurants(widget_id);
CREATE INDEX idx_restaurants_is_active ON restaurants(is_active);
CREATE INDEX idx_menu_items_restaurant_id ON menu_items(restaurant_id);
CREATE INDEX idx_chatbot_settings_restaurant_id ON chatbot_settings(restaurant_id);

-- Database setup complete!
-- You can now use the manual input form to add restaurant data.
