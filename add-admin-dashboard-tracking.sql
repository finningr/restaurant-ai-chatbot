-- Migration for Admin Dashboard Features
-- Adds tables and columns needed for admin viewing restaurant dashboards,
-- active session tracking, login analytics, and lock system

-- 1. Add lock fields to restaurants table
ALTER TABLE restaurants 
ADD COLUMN IF NOT EXISTS locked_by_admin BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS locked_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);

-- Create index for created_by (for querying demos by creator)
CREATE INDEX IF NOT EXISTS idx_restaurants_created_by ON restaurants(created_by);

-- Create index for locked_by_admin (for querying locked restaurants)
CREATE INDEX IF NOT EXISTS idx_restaurants_locked ON restaurants(locked_by_admin);

-- 2. Create active_sessions table (real-time tracking)
CREATE TABLE IF NOT EXISTS active_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email VARCHAR(255) NOT NULL,
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  session_type VARCHAR(50) NOT NULL CHECK (session_type IN ('owner', 'admin', 'sales_rep')),
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address VARCHAR(50),
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_email, restaurant_id)
);

-- Create indexes for active_sessions
CREATE INDEX IF NOT EXISTS idx_active_sessions_user_email ON active_sessions(user_email);
CREATE INDEX IF NOT EXISTS idx_active_sessions_restaurant_id ON active_sessions(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_active_sessions_last_active ON active_sessions(last_active);

-- 3. Create user_login_sessions table (analytics)
CREATE TABLE IF NOT EXISTS user_login_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email VARCHAR(255) NOT NULL,
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE SET NULL,
  login_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  logout_time TIMESTAMP WITH TIME ZONE,
  session_duration_minutes INTEGER,
  ip_address VARCHAR(50),
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for user_login_sessions
CREATE INDEX IF NOT EXISTS idx_login_sessions_user_email ON user_login_sessions(user_email);
CREATE INDEX IF NOT EXISTS idx_login_sessions_restaurant_id ON user_login_sessions(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_login_sessions_login_time ON user_login_sessions(login_time);
CREATE INDEX IF NOT EXISTS idx_login_sessions_logout_time ON user_login_sessions(logout_time);

-- 4. Add comment for documentation
COMMENT ON TABLE active_sessions IS 'Tracks currently active user sessions for real-time monitoring';
COMMENT ON TABLE user_login_sessions IS 'Historical login data for analytics and user activity tracking';
COMMENT ON COLUMN restaurants.locked_by_admin IS 'True when admin is viewing/editing this restaurant';
COMMENT ON COLUMN restaurants.locked_at IS 'Timestamp when restaurant was locked by admin';
COMMENT ON COLUMN restaurants.created_by IS 'Email of user who created this demo (sales_rep or admin)';

