-- Add app_users table for Supabase-backed user storage (replaces users.json for Vercel)
-- Run in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS app_users (
  id TEXT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('restaurant', 'sales_rep', 'admin')),
  has_chatbot BOOLEAN DEFAULT false,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'deleted')),
  restaurant_name VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_app_users_email ON app_users(email);
CREATE INDEX IF NOT EXISTS idx_app_users_status ON app_users(status);

GRANT ALL ON app_users TO service_role;
GRANT ALL ON app_users TO authenticated;
GRANT ALL ON app_users TO anon;
ALTER TABLE app_users DISABLE ROW LEVEL SECURITY;

-- Seed default admin (password: admin123) - run only if table is empty
INSERT INTO app_users (id, email, password, name, role, has_chatbot, status)
SELECT 'admin-1', 'admin@restaurantai.com', '$2b$10$86Xnxz92VaM.xhPixjpVauODKsBlp.EpLlI.yA4kV02yNpHz3Dvpe', 'Admin User', 'admin', true, 'active'
WHERE NOT EXISTS (SELECT 1 FROM app_users LIMIT 1);
