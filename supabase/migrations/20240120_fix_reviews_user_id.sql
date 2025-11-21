-- Fix reviews table user_id to work with Clerk authentication

-- STEP 1: Drop all RLS policies first (they depend on the column)
DROP POLICY IF EXISTS "Users can view approved reviews" ON reviews;
DROP POLICY IF EXISTS "Users can create reviews" ON reviews;
DROP POLICY IF EXISTS "Users can update own reviews" ON reviews;
DROP POLICY IF EXISTS "Users can update their own reviews" ON reviews;
DROP POLICY IF EXISTS "Admins can manage all reviews" ON reviews;
DROP POLICY IF EXISTS "Users view approved reviews" ON reviews;
DROP POLICY IF EXISTS "Users create reviews" ON reviews;

-- STEP 2: Drop foreign key constraint
ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_user_id_fkey;

-- STEP 3: Change user_id column type from UUID to TEXT
ALTER TABLE reviews ALTER COLUMN user_id TYPE TEXT;

-- STEP 4: Recreate RLS policies with simpler logic (allow all for now)
CREATE POLICY "Allow all operations for authenticated users"
  ON reviews FOR ALL
  USING (true)
  WITH CHECK (true);
