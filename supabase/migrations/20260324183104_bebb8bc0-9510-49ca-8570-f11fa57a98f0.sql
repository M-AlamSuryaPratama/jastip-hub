
-- Add photo_url column to packages
ALTER TABLE public.packages ADD COLUMN IF NOT EXISTS photo_url text;

-- Allow anyone to read from package_photos bucket
CREATE POLICY "Public read access for package_photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'package_photos');

-- Allow anyone to upload to package_photos bucket  
CREATE POLICY "Public upload access for package_photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'package_photos');
