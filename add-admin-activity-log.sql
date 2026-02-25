-- Admin Activity Log Tracking
-- Run this in your Supabase SQL Editor

-- Activity log for all admin, sales rep, and owner actions
CREATE TABLE IF NOT EXISTS activity_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email VARCHAR(255) NOT NULL,
  user_role VARCHAR(50) NOT NULL, -- 'admin', 'sales_rep', 'restaurant'
  action_type VARCHAR(100) NOT NULL, -- 'create_demo', 'edit_restaurant', 'edit_menu', 'lock_restaurant', 'pause_restaurant', etc.
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE SET NULL,
  restaurant_name VARCHAR(255),
  details JSONB, -- Store additional context like what fields were changed
  ip_address VARCHAR(45),
  user_agent TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_activity_log_user ON activity_log(user_email);
CREATE INDEX IF NOT EXISTS idx_activity_log_restaurant ON activity_log(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_timestamp ON activity_log(timestamp);
CREATE INDEX IF NOT EXISTS idx_activity_log_action ON activity_log(action_type);
CREATE INDEX IF NOT EXISTS idx_activity_log_role ON activity_log(user_role);

