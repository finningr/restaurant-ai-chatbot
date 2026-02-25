-- Run this if you're getting "permission denied" on pending_invites
-- Run in Supabase SQL Editor

GRANT ALL ON pending_invites TO service_role;
GRANT ALL ON pending_invites TO authenticated;
GRANT ALL ON pending_invites TO anon;

ALTER TABLE pending_invites DISABLE ROW LEVEL SECURITY;
