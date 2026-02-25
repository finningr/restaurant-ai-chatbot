-- Row Level Security (RLS) Policies for Production
-- Run this in Supabase SQL Editor after creating tables

-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_settings ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RESTAURANTS TABLE POLICIES
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public read active restaurants" ON restaurants;
DROP POLICY IF EXISTS "Authenticated users can insert restaurants" ON restaurants;
DROP POLICY IF EXISTS "Authenticated users can update restaurants" ON restaurants;
DROP POLICY IF EXISTS "Authenticated users can delete restaurants" ON restaurants;

-- Policy 1: Public can read active restaurants (for widget)
CREATE POLICY "Public read active restaurants" 
ON restaurants
FOR SELECT
USING (is_active = true);

-- Policy 2: Authenticated users can insert restaurants
CREATE POLICY "Authenticated users can insert restaurants"
ON restaurants
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Policy 3: Authenticated users can update restaurants
CREATE POLICY "Authenticated users can update restaurants"
ON restaurants
FOR UPDATE
USING (auth.role() = 'authenticated');

-- Policy 4: Authenticated users can delete restaurants
CREATE POLICY "Authenticated users can delete restaurants"
ON restaurants
FOR DELETE
USING (auth.role() = 'authenticated');

-- ============================================
-- MENU_ITEMS TABLE POLICIES
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public read available menu items" ON menu_items;
DROP POLICY IF EXISTS "Authenticated users can manage menu items" ON menu_items;

-- Policy 1: Public can read available menu items (for widget)
CREATE POLICY "Public read available menu items"
ON menu_items
FOR SELECT
USING (available = true);

-- Policy 2: Authenticated users can manage menu items (insert, update, delete)
CREATE POLICY "Authenticated users can manage menu items"
ON menu_items
FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- ============================================
-- CHATBOT_SETTINGS TABLE POLICIES
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Authenticated users only" ON chatbot_settings;

-- Policy: Only authenticated users can access chatbot settings
CREATE POLICY "Authenticated users only"
ON chatbot_settings
FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check RLS is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
    AND tablename IN ('restaurants', 'menu_items', 'chatbot_settings');

-- Check policies are created
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
    AND tablename IN ('restaurants', 'menu_items', 'chatbot_settings')
ORDER BY tablename, policyname;

-- ============================================
-- NOTES
-- ============================================

-- IMPORTANT:
-- 1. These policies assume you're using Supabase Auth
-- 2. If you're using a different auth system, adjust the `auth.role()` checks
-- 3. For server-side admin operations, use the service role key (bypasses RLS)
-- 4. Test these policies thoroughly before production
-- 5. Consider adding more granular policies based on your needs:
--    - Restaurant owners can only edit their own restaurants
--    - Admins can edit all restaurants
--    - etc.


