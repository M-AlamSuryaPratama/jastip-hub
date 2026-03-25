
-- Create package_photos storage bucket with public access
INSERT INTO storage.buckets (id, name, public)
VALUES ('package_photos', 'package_photos', true);

-- Allow anyone to read files
CREATE POLICY "Public read access" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'package_photos');

-- Allow anyone to upload files  
CREATE POLICY "Public upload access" ON storage.objects
FOR INSERT TO public
WITH CHECK (bucket_id = 'package_photos');

-- Allow anyone to delete files
CREATE POLICY "Public delete access" ON storage.objects
FOR DELETE TO public
USING (bucket_id = 'package_photos');
