-- Simple Supabase Schema for Restaurant Chatbot
-- Run this in your Supabase SQL Editor

-- Create the main restaurants table
CREATE TABLE restaurants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
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
  raw_menu_text TEXT, -- Store original copy/pasted menu text
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
  system_prompt TEXT,
  behavior_rules JSONB,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Database setup complete!
-- You can now use the manual input form to add restaurant data.
