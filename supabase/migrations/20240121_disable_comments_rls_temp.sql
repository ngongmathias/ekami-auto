-- Temporarily disable RLS and create permissive policies for testing
-- This will help us debug the authentication issue

-- Disable RLS temporarily (we'll re-enable with proper policies)
ALTER TABLE blog_comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE comment_likes DISABLE ROW LEVEL SECURITY;

-- Or if you want to keep RLS enabled, use these super permissive policies:
-- DROP ALL existing policies first
DROP POLICY IF EXISTS "Anyone can view approved comments" ON blog_comments;
DROP POLICY IF EXISTS "Authenticated users can insert comments" ON blog_comments;
DROP POLICY IF EXISTS "Users can update own comments" ON blog_comments;
DROP POLICY IF EXISTS "Users can delete own comments" ON blog_comments;

DROP POLICY IF EXISTS "Anyone can view comment likes" ON comment_likes;
DROP POLICY IF EXISTS "Authenticated users can like comments" ON comment_likes;
DROP POLICY IF EXISTS "Users can unlike comments" ON comment_likes;

-- Re-enable RLS
ALTER TABLE blog_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;

-- Create super permissive policies for testing
CREATE POLICY "Allow all operations on comments"
  ON blog_comments
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on likes"
  ON comment_likes
  FOR ALL
  USING (true)
  WITH CHECK (true);
