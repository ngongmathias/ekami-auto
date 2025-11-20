-- ============================================
-- EKAMI AUTO - ADMIN SETUP SCRIPT
-- ============================================
-- Run this entire script in Supabase SQL Editor
-- This will set up all admin permissions in one go!
-- ============================================

-- Your admin emails
-- kerryngong@ekamiauto.com
-- mathiasngongngai@gmail.com

-- ============================================
-- 1. CARS TABLE - Admin Policies
-- ============================================

-- Allow admins to view all cars
CREATE POLICY "Admins can view all cars"
ON cars FOR SELECT
TO authenticated
USING (
  auth.jwt() ->> 'email' IN ('kerryngong@ekamiauto.com', 'mathiasngongngai@gmail.com')
);

-- Allow admins to insert cars
CREATE POLICY "Admins can insert cars"
ON cars FOR INSERT
TO authenticated
WITH CHECK (
  auth.jwt() ->> 'email' IN ('kerryngong@ekamiauto.com', 'mathiasngongngai@gmail.com')
);

-- Allow admins to update cars
CREATE POLICY "Admins can update cars"
ON cars FOR UPDATE
TO authenticated
USING (
  auth.jwt() ->> 'email' IN ('kerryngong@ekamiauto.com', 'mathiasngongngai@gmail.com')
);

-- Allow admins to delete cars
CREATE POLICY "Admins can delete cars"
ON cars FOR DELETE
TO authenticated
USING (
  auth.jwt() ->> 'email' IN ('kerryngong@ekamiauto.com', 'mathiasngongngai@gmail.com')
);

-- ============================================
-- 2. BOOKINGS TABLE - Admin Policies
-- ============================================

-- Allow admins to view all bookings
CREATE POLICY "Admins can view all bookings"
ON bookings FOR SELECT
TO authenticated
USING (
  auth.jwt() ->> 'email' IN ('kerryngong@ekamiauto.com', 'mathiasngongngai@gmail.com')
);

-- Allow admins to update bookings
CREATE POLICY "Admins can update bookings"
ON bookings FOR UPDATE
TO authenticated
USING (
  auth.jwt() ->> 'email' IN ('kerryngong@ekamiauto.com', 'mathiasngongngai@gmail.com')
);

-- Allow admins to delete bookings
CREATE POLICY "Admins can delete bookings"
ON bookings FOR DELETE
TO authenticated
USING (
  auth.jwt() ->> 'email' IN ('kerryngong@ekamiauto.com', 'mathiasngongngai@gmail.com')
);

-- ============================================
-- 3. BLOG_POSTS TABLE - Admin Policies
-- ============================================

-- Allow admins to view all blog posts
CREATE POLICY "Admins can view all blog posts"
ON blog_posts FOR SELECT
TO authenticated
USING (
  auth.jwt() ->> 'email' IN ('kerryngong@ekamiauto.com', 'mathiasngongngai@gmail.com')
);

-- Allow admins to insert blog posts
CREATE POLICY "Admins can insert blog posts"
ON blog_posts FOR INSERT
TO authenticated
WITH CHECK (
  auth.jwt() ->> 'email' IN ('kerryngong@ekamiauto.com', 'mathiasngongngai@gmail.com')
);

-- Allow admins to update blog posts
CREATE POLICY "Admins can update blog posts"
ON blog_posts FOR UPDATE
TO authenticated
USING (
  auth.jwt() ->> 'email' IN ('kerryngong@ekamiauto.com', 'mathiasngongngai@gmail.com')
);

-- Allow admins to delete blog posts
CREATE POLICY "Admins can delete blog posts"
ON blog_posts FOR DELETE
TO authenticated
USING (
  auth.jwt() ->> 'email' IN ('kerryngong@ekamiauto.com', 'mathiasngongngai@gmail.com')
);

-- ============================================
-- 4. USER_PROFILES TABLE - Admin Policies
-- ============================================

-- Allow admins to view all user profiles
CREATE POLICY "Admins can view all user profiles"
ON user_profiles FOR SELECT
TO authenticated
USING (
  auth.jwt() ->> 'email' IN ('kerryngong@ekamiauto.com', 'mathiasngongngai@gmail.com')
);

-- ============================================
-- 5. STORAGE - Car Images Bucket Policies
-- ============================================

-- Allow admins to upload car images
CREATE POLICY "Admins can upload car images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'car-images' AND
  auth.jwt() ->> 'email' IN ('kerryngong@ekamiauto.com', 'mathiasngongngai@gmail.com')
);

-- Allow public to view car images
CREATE POLICY "Anyone can view car images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'car-images');

-- ============================================
-- 6. ADMIN STATS FUNCTION
-- ============================================

-- Function to get admin dashboard stats
CREATE OR REPLACE FUNCTION get_admin_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_cars', (SELECT COUNT(*) FROM cars),
    'available_cars', (SELECT COUNT(*) FROM cars WHERE available_for_rent = TRUE),
    'total_bookings', (SELECT COUNT(*) FROM bookings),
    'active_bookings', (SELECT COUNT(*) FROM bookings WHERE status = 'active'),
    'total_revenue', (SELECT COALESCE(SUM(total_amount), 0) FROM bookings WHERE payment_status = 'paid'),
    'total_customers', (SELECT COUNT(DISTINCT user_id) FROM bookings),
    'pending_payments', (SELECT COUNT(*) FROM bookings WHERE payment_status = 'pending')
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_admin_stats() TO authenticated;

-- ============================================
-- DONE! ✅
-- ============================================
-- All admin permissions have been set up!
-- You can now use the admin dashboard.
-- ============================================
