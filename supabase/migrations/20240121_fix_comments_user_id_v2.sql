-- Fix blog_comments to accept Clerk user IDs (strings) instead of UUIDs
-- Version 2: Drop ALL policies first

-- Drop ALL existing policies on blog_comments
DROP POLICY IF EXISTS "Anyone can view approved comments" ON blog_comments;
DROP POLICY IF EXISTS "Authenticated users can insert comments" ON blog_comments;
DROP POLICY IF EXISTS "Users can update own comments" ON blog_comments;
DROP POLICY IF EXISTS "Users can delete own comments" ON blog_comments;

-- Drop ALL existing policies on comment_likes
DROP POLICY IF EXISTS "Anyone can view comment likes" ON comment_likes;
DROP POLICY IF EXISTS "Authenticated users can like comments" ON comment_likes;
DROP POLICY IF EXISTS "Users can unlike comments" ON comment_likes;

-- Drop the foreign key constraints
ALTER TABLE blog_comments DROP CONSTRAINT IF EXISTS blog_comments_user_id_fkey;
ALTER TABLE blog_comments DROP CONSTRAINT IF EXISTS blog_comments_approved_by_fkey;
ALTER TABLE comment_likes DROP CONSTRAINT IF EXISTS comment_likes_user_id_fkey;

-- Change user_id columns from UUID to VARCHAR to accept Clerk IDs
ALTER TABLE blog_comments ALTER COLUMN user_id TYPE VARCHAR(255);
ALTER TABLE blog_comments ALTER COLUMN approved_by TYPE VARCHAR(255);
ALTER TABLE comment_likes ALTER COLUMN user_id TYPE VARCHAR(255);

-- Recreate RLS policies for blog_comments

-- Anyone can view approved comments
CREATE POLICY "Anyone can view approved comments"
  ON blog_comments FOR SELECT
  USING (status = 'approved');

-- Authenticated users can insert comments
CREATE POLICY "Authenticated users can insert comments"
  ON blog_comments FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Users can update their own comments
CREATE POLICY "Users can update own comments"
  ON blog_comments FOR UPDATE
  TO authenticated
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub')
  WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Users can delete their own comments
CREATE POLICY "Users can delete own comments"
  ON blog_comments FOR DELETE
  TO authenticated
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Recreate RLS policies for comment_likes

-- Anyone can view likes
CREATE POLICY "Anyone can view comment likes"
  ON comment_likes FOR SELECT
  USING (true);

-- Authenticated users can like comments
CREATE POLICY "Authenticated users can like comments"
  ON comment_likes FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Users can unlike comments
CREATE POLICY "Users can unlike comments"
  ON comment_likes FOR DELETE
  TO authenticated
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');
