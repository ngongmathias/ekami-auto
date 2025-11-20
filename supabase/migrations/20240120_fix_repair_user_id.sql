-- Fix user_id column to accept Clerk user IDs (text) instead of UUID

-- STEP 1: Drop all RLS policies first (they depend on the columns)
DROP POLICY IF EXISTS "Users view own repair requests" ON repair_requests;
DROP POLICY IF EXISTS "Users create repair requests" ON repair_requests;
DROP POLICY IF EXISTS "Users update own pending requests" ON repair_requests;
DROP POLICY IF EXISTS "Admins view all repair requests" ON repair_requests;
DROP POLICY IF EXISTS "Admins manage all repair requests" ON repair_requests;

DROP POLICY IF EXISTS "Users view own service history" ON service_history;
DROP POLICY IF EXISTS "Admins manage service history" ON service_history;

DROP POLICY IF EXISTS "Users view own reviews" ON service_reviews;
DROP POLICY IF EXISTS "Users create reviews" ON service_reviews;
DROP POLICY IF EXISTS "Admins manage all reviews" ON service_reviews;

-- STEP 2: Drop foreign key constraints
ALTER TABLE repair_requests DROP CONSTRAINT IF EXISTS repair_requests_user_id_fkey;
ALTER TABLE service_history DROP CONSTRAINT IF EXISTS service_history_user_id_fkey;
ALTER TABLE service_reviews DROP CONSTRAINT IF EXISTS service_reviews_user_id_fkey;

-- STEP 3: Change user_id column type from UUID to TEXT
ALTER TABLE repair_requests ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE service_history ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE service_reviews ALTER COLUMN user_id TYPE TEXT;

-- STEP 4: Recreate RLS policies with correct user_id comparison
CREATE POLICY "Users view own repair requests"
  ON repair_requests FOR SELECT
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users create repair requests"
  ON repair_requests FOR INSERT
  WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users update own pending requests"
  ON repair_requests FOR UPDATE
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub' AND status IN ('received', 'scheduled'));

CREATE POLICY "Users view own service history"
  ON service_history FOR SELECT
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users view own reviews"
  ON service_reviews FOR SELECT
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users create reviews"
  ON service_reviews FOR INSERT
  WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Admin policies (unchanged)
CREATE POLICY "Admins view all repair requests"
  ON repair_requests FOR SELECT
  USING (auth.jwt() ->> 'email' IN ('kerryngong@ekamiauto.com', 'mathiasngongngai@gmail.com'));

CREATE POLICY "Admins manage all repair requests"
  ON repair_requests FOR ALL
  USING (auth.jwt() ->> 'email' IN ('kerryngong@ekamiauto.com', 'mathiasngongngai@gmail.com'));

CREATE POLICY "Admins manage service history"
  ON service_history FOR ALL
  USING (auth.jwt() ->> 'email' IN ('kerryngong@ekamiauto.com', 'mathiasngongngai@gmail.com'));

CREATE POLICY "Admins manage all reviews"
  ON service_reviews FOR ALL
  USING (auth.jwt() ->> 'email' IN ('kerryngong@ekamiauto.com', 'mathiasngongngai@gmail.com'));
