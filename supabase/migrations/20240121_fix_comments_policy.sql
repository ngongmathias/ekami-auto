-- Fix the insert policy for blog_comments to allow authenticated users to insert
-- Simplified version - just allow authenticated users to insert any comment

-- Drop the restrictive insert policy
DROP POLICY IF EXISTS "Authenticated users can insert comments" ON blog_comments;

-- Create a simple permissive insert policy
-- Any authenticated user can insert a comment
CREATE POLICY "Authenticated users can insert comments"
  ON blog_comments FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Also update the comment_likes insert policy
DROP POLICY IF EXISTS "Authenticated users can like comments" ON comment_likes;

CREATE POLICY "Authenticated users can like comments"
  ON comment_likes FOR INSERT
  TO authenticated
  WITH CHECK (true);
