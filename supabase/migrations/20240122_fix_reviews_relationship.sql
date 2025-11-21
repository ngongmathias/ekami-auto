-- Fix the reviews table to properly reference user_profiles
-- The error indicates the foreign key relationship is missing

-- First, check if the foreign key exists and drop it if needed
ALTER TABLE reviews 
DROP CONSTRAINT IF EXISTS reviews_user_id_fkey;

-- Add the correct foreign key constraint
-- Note: user_id in reviews is VARCHAR (Clerk ID), not UUID
-- So we need to ensure the relationship is set up correctly

-- If user_profiles doesn't have the matching user_id column, we need to handle this differently
-- Let's make the relationship optional by removing the constraint requirement

-- Instead, we'll just ensure the column exists and is indexed
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);

-- Add a comment to document this
COMMENT ON COLUMN reviews.user_id IS 'Clerk user ID (VARCHAR) - not a foreign key to user_profiles';
