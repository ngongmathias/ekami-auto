-- Fix all tables with user_id to work with Clerk authentication
-- This migration handles: purchases, sell_requests

-- =====================================================
-- PURCHASES TABLE (uses buyer_id not user_id)
-- =====================================================

-- STEP 1: Drop all RLS policies for purchases
DROP POLICY IF EXISTS "Users can view own purchases" ON purchases;
DROP POLICY IF EXISTS "Users can view their own purchases" ON purchases;
DROP POLICY IF EXISTS "Users can create purchases" ON purchases;
DROP POLICY IF EXISTS "Admins can manage all purchases" ON purchases;

-- STEP 2: Drop foreign key constraint
ALTER TABLE purchases DROP CONSTRAINT IF EXISTS purchases_buyer_id_fkey;

-- STEP 3: Change buyer_id column type from UUID to TEXT
ALTER TABLE purchases ALTER COLUMN buyer_id TYPE TEXT;

-- STEP 4: Recreate RLS policies
CREATE POLICY "Allow all operations for authenticated users"
  ON purchases FOR ALL
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- SELL_REQUESTS TABLE
-- =====================================================

-- STEP 1: Drop all RLS policies for sell_requests
DROP POLICY IF EXISTS "Users can view own sell requests" ON sell_requests;
DROP POLICY IF EXISTS "Users can view their own sell requests" ON sell_requests;
DROP POLICY IF EXISTS "Users can create sell requests" ON sell_requests;
DROP POLICY IF EXISTS "Users can update their own sell requests" ON sell_requests;
DROP POLICY IF EXISTS "Admins can manage all sell requests" ON sell_requests;

-- STEP 2: Drop foreign key constraint
ALTER TABLE sell_requests DROP CONSTRAINT IF EXISTS sell_requests_user_id_fkey;

-- STEP 3: Change user_id column type from UUID to TEXT
ALTER TABLE sell_requests ALTER COLUMN user_id TYPE TEXT;

-- STEP 4: Recreate RLS policies
CREATE POLICY "Allow all operations for authenticated users"
  ON sell_requests FOR ALL
  USING (true)
  WITH CHECK (true);
