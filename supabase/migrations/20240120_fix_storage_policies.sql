-- Fix storage policies to work without Supabase Auth

-- Drop old policies
DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes" ON storage.objects;
DROP POLICY IF EXISTS "Allow all uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow all updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow all deletes" ON storage.objects;

-- Create new permissive policies
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'cars');

CREATE POLICY "Public upload access"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'cars');

CREATE POLICY "Public update access"
ON storage.objects FOR UPDATE
USING (bucket_id = 'cars');

CREATE POLICY "Public delete access"
ON storage.objects FOR DELETE
USING (bucket_id = 'cars');
