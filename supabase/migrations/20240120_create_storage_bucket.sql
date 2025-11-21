-- Create storage bucket for car images

-- Create the bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('cars', 'cars', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies to allow all operations (since we're using Clerk for auth)
CREATE POLICY "Allow public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'cars');

CREATE POLICY "Allow all uploads"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'cars');

CREATE POLICY "Allow all updates"
ON storage.objects FOR UPDATE
USING (bucket_id = 'cars');

CREATE POLICY "Allow all deletes"
ON storage.objects FOR DELETE
USING (bucket_id = 'cars');
