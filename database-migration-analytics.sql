-- Migration: Add analytics support for restaurant dashboards
-- Run this in your Supabase SQL Editor

-- Step 1: Add owner_email to restaurants table to link restaurants to users
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS owner_email VARCHAR(255);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_restaurants_owner_email ON restaurants(owner_email);

-- Step 2: Create chat_messages table to store all conversations
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  widget_id VARCHAR(50) NOT NULL,
  session_id VARCHAR(255), -- Browser session ID for conversation tracking
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
  message TEXT NOT NULL,
  menu_items_mentioned TEXT[], -- Array of menu item names mentioned in conversation
  response_time_ms INTEGER, -- Track response time in milliseconds
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_widget_id ON chat_messages(widget_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_restaurant_id ON chat_messages(restaurant_id);

-- Step 3: Update existing restaurants (optional - you can do this manually)
-- UPDATE restaurants SET owner_email = 'admin@restaurantai.com' WHERE owner_email IS NULL;

-- Enable Row Level Security (if not already enabled)
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see messages for their own restaurants
CREATE POLICY "Users can view their own restaurant messages"
ON chat_messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM restaurants
    WHERE restaurants.id = chat_messages.restaurant_id
    AND restaurants.owner_email = current_setting('app.user_email', true)
  )
);

-- Note: The RLS policy above uses a custom setting. For now, we'll handle access control
-- in the API layer. You can refine RLS policies later if needed.

