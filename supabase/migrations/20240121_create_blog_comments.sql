-- Create blog_comments table
CREATE TABLE IF NOT EXISTS blog_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Comment content
  content TEXT NOT NULL,
  
  -- Relationships
  post_id UUID NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES blog_comments(id) ON DELETE CASCADE, -- For nested replies
  
  -- User info (cached for display)
  user_name VARCHAR(200),
  user_email VARCHAR(200),
  
  -- Moderation
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'spam'
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  
  -- Engagement
  likes INTEGER DEFAULT 0,
  
  -- Flags
  is_edited BOOLEAN DEFAULT false,
  is_pinned BOOLEAN DEFAULT false
);

-- Create indexes for better performance
CREATE INDEX idx_blog_comments_post_id ON blog_comments(post_id);
CREATE INDEX idx_blog_comments_user_id ON blog_comments(user_id);
CREATE INDEX idx_blog_comments_parent_id ON blog_comments(parent_id);
CREATE INDEX idx_blog_comments_status ON blog_comments(status);
CREATE INDEX idx_blog_comments_created_at ON blog_comments(created_at DESC);

-- Create comment_likes table for tracking who liked what
CREATE TABLE IF NOT EXISTS comment_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  comment_id UUID NOT NULL REFERENCES blog_comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  UNIQUE(comment_id, user_id)
);

CREATE INDEX idx_comment_likes_comment_id ON comment_likes(comment_id);
CREATE INDEX idx_comment_likes_user_id ON comment_likes(user_id);

-- Enable RLS
ALTER TABLE blog_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for blog_comments

-- Anyone can view approved comments
CREATE POLICY "Anyone can view approved comments"
  ON blog_comments FOR SELECT
  USING (status = 'approved');

-- Authenticated users can insert comments (will be pending)
CREATE POLICY "Authenticated users can insert comments"
  ON blog_comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own comments (only content and is_edited flag)
CREATE POLICY "Users can update own comments"
  ON blog_comments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own comments
CREATE POLICY "Users can delete own comments"
  ON blog_comments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for comment_likes

-- Anyone can view likes
CREATE POLICY "Anyone can view comment likes"
  ON comment_likes FOR SELECT
  USING (true);

-- Authenticated users can like comments
CREATE POLICY "Authenticated users can like comments"
  ON comment_likes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can unlike comments
CREATE POLICY "Users can unlike comments"
  ON comment_likes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to update comment likes count
CREATE OR REPLACE FUNCTION update_comment_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE blog_comments
    SET likes = likes + 1
    WHERE id = NEW.comment_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE blog_comments
    SET likes = likes - 1
    WHERE id = OLD.comment_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update likes count
CREATE TRIGGER update_comment_likes_count_trigger
AFTER INSERT OR DELETE ON comment_likes
FOR EACH ROW
EXECUTE FUNCTION update_comment_likes_count();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_blog_comments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
CREATE TRIGGER update_blog_comments_updated_at_trigger
BEFORE UPDATE ON blog_comments
FOR EACH ROW
EXECUTE FUNCTION update_blog_comments_updated_at();
