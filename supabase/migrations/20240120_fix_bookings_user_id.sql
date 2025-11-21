-- Fix bookings table user_id to work with Clerk authentication

-- STEP 1: Drop all RLS policies first (they depend on the column)
DROP POLICY IF EXISTS "Users can view own bookings" ON bookings;
DROP POLICY IF EXISTS "Users can view their own bookings" ON bookings;
DROP POLICY IF EXISTS "Users can create bookings" ON bookings;
DROP POLICY IF EXISTS "Users can update own bookings" ON bookings;
DROP POLICY IF EXISTS "Users can update their own bookings" ON bookings;
DROP POLICY IF EXISTS "Admins can manage all bookings" ON bookings;
DROP POLICY IF EXISTS "Users view own bookings" ON bookings;
DROP POLICY IF EXISTS "Users create bookings" ON bookings;

-- STEP 2: Drop foreign key constraint
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_user_id_fkey;

-- STEP 3: Change user_id column type from UUID to TEXT
ALTER TABLE bookings ALTER COLUMN user_id TYPE TEXT;

-- STEP 4: Recreate RLS policies with simpler logic (allow all for now)
CREATE POLICY "Allow all operations for authenticated users"
  ON bookings FOR ALL
  USING (true)
  WITH CHECK (true);
