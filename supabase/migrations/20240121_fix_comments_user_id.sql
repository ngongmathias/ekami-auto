-- Fix blog_comments to accept Clerk user IDs (strings) instead of UUIDs

-- Drop the foreign key constraint
ALTER TABLE blog_comments DROP CONSTRAINT IF EXISTS blog_comments_user_id_fkey;

-- Change user_id from UUID to VARCHAR to accept Clerk IDs
ALTER TABLE blog_comments ALTER COLUMN user_id TYPE VARCHAR(255);

-- Update RLS policies to work with string user IDs
DROP POLICY IF EXISTS "Authenticated users can insert comments" ON blog_comments;
DROP POLICY IF EXISTS "Users can update own comments" ON blog_comments;
DROP POLICY IF EXISTS "Users can delete own comments" ON blog_comments;

-- Recreate policies with string comparison
CREATE POLICY "Authenticated users can insert comments"
  ON blog_comments FOR INSERT
  TO authenticated
  WITH CHECK (user_id IS NOT NULL);

CREATE POLICY "Users can update own comments"
  ON blog_comments FOR UPDATE
  TO authenticated
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub')
  WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can delete own comments"
  ON blog_comments FOR DELETE
  TO authenticated
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Also fix comment_likes table
ALTER TABLE comment_likes DROP CONSTRAINT IF EXISTS comment_likes_user_id_fkey;
ALTER TABLE comment_likes ALTER COLUMN user_id TYPE VARCHAR(255);

DROP POLICY IF EXISTS "Authenticated users can like comments" ON comment_likes;
DROP POLICY IF EXISTS "Users can unlike comments" ON comment_likes;

CREATE POLICY "Authenticated users can like comments"
  ON comment_likes FOR INSERT
  TO authenticated
  WITH CHECK (user_id IS NOT NULL);

CREATE POLICY "Users can unlike comments"
  ON comment_likes FOR DELETE
  TO authenticated
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');
