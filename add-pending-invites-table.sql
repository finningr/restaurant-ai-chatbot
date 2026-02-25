-- Add pending_invites table for invite-based user creation
-- Run in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS pending_invites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  token VARCHAR(64) UNIQUE NOT NULL,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('restaurant', 'sales_rep')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by VARCHAR(255) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_pending_invites_token ON pending_invites(token);
CREATE INDEX IF NOT EXISTS idx_pending_invites_email ON pending_invites(email);

-- Fix permission denied: grant access to roles that need it
GRANT ALL ON pending_invites TO service_role;
GRANT ALL ON pending_invites TO authenticated;
GRANT ALL ON pending_invites TO anon;

-- Disable RLS so table is accessible (only backend uses this table)
ALTER TABLE pending_invites DISABLE ROW LEVEL SECURITY;
