-- Allow all operations on cars table (since we're using Clerk for auth)

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Cars are viewable by everyone" ON cars;
DROP POLICY IF EXISTS "Admins can insert cars" ON cars;
DROP POLICY IF EXISTS "Admins can update cars" ON cars;
DROP POLICY IF EXISTS "Admins can delete cars" ON cars;

-- Create permissive policies
CREATE POLICY "Allow all to view cars"
ON cars FOR SELECT
USING (true);

CREATE POLICY "Allow all to insert cars"
ON cars FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow all to update cars"
ON cars FOR UPDATE
USING (true);

CREATE POLICY "Allow all to delete cars"
ON cars FOR DELETE
USING (true);
