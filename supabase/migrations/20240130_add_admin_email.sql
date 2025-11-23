-- Add kerryngong@gmail.com to all admin RLS policies
-- This migration updates all policies that check for admin emails

-- Note: This is a helper script to document the new admin email
-- The actual RLS policies will need to be updated individually in Supabase dashboard
-- or by recreating the policies

-- Admin emails that should have access:
-- 1. kerryngong@ekamiauto.com
-- 2. kerryngong@gmail.com (NEW)
-- 3. mathiasngongngai@gmail.com

-- For reference, here are the tables with admin-only policies:
-- - cars (insert, update, delete)
-- - bookings (all operations)
-- - service_requests (view all, manage)
-- - mechanics (all operations)
-- - service_packages (all operations)
-- - blog_posts (create, update, delete)
-- - blog_comments (moderate)
-- - maintenance_blocks (all operations)
-- - car_history (insert, update, delete)
-- - ownership_history (all operations)
-- - inspection_reports (all operations)
-- - loyalty_members (view all, manage)
-- - loyalty_transactions (view all, manage)
-- - loyalty_rewards (manage)
-- - loyalty_redemptions (manage)
-- - chat_conversations (view all)
-- - chat_messages (view all)

-- To apply this change, you need to:
-- 1. Go to Supabase Dashboard > SQL Editor
-- 2. For each table with admin policies, run:

-- Example for cars table:
/*
DROP POLICY IF EXISTS "Admins can insert cars" ON cars;
CREATE POLICY "Admins can insert cars"
  ON cars FOR INSERT
  WITH CHECK (
    (current_setting('request.jwt.claims', true)::json->>'email') IN 
    ('kerryngong@ekamiauto.com', 'kerryngong@gmail.com', 'mathiasngongngai@gmail.com')
  );

DROP POLICY IF EXISTS "Admins can update cars" ON cars;
CREATE POLICY "Admins can update cars"
  ON cars FOR UPDATE
  USING (
    (current_setting('request.jwt.claims', true)::json->>'email') IN 
    ('kerryngong@ekamiauto.com', 'kerryngong@gmail.com', 'mathiasngongngai@gmail.com')
  );

DROP POLICY IF EXISTS "Admins can delete cars" ON cars;
CREATE POLICY "Admins can delete cars"
  ON cars FOR DELETE
  USING (
    (current_setting('request.jwt.claims', true)::json->>'email') IN 
    ('kerryngong@ekamiauto.com', 'kerryngong@gmail.com', 'mathiasngongngai@gmail.com')
  );
*/

-- Repeat similar pattern for all other tables listed above

-- IMPORTANT: The frontend AdminDashboard.tsx has already been updated
-- This migration is just for documentation and reference
-- The actual policy updates need to be done in Supabase dashboard

COMMENT ON SCHEMA public IS 'Admin email kerryngong@gmail.com added to access list';
