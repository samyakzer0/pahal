-- =============================================
-- PAHAL - Storage Bucket Configuration
-- Supabase Storage Setup
-- =============================================

-- =============================================
-- STORAGE BUCKETS
-- =============================================

-- Create buckets via Supabase Dashboard or API
-- These are the bucket configurations:

/*
Bucket: incident-media
  - Public: false (authenticated access only)
  - File size limit: 10MB
  - Allowed MIME types: image/jpeg, image/png, image/webp, video/mp4, video/webm
  
Bucket: camera-captures  
  - Public: false
  - File size limit: 5MB
  - Allowed MIME types: image/jpeg, image/png, image/webp
  
Bucket: user-avatars
  - Public: true (for profile pictures)
  - File size limit: 2MB
  - Allowed MIME types: image/jpeg, image/png, image/webp
*/

-- =============================================
-- STORAGE POLICIES (SQL for Supabase)
-- =============================================

-- Incident Media Bucket Policies
-- --------------------------------

-- Allow authenticated users to view incident media
CREATE POLICY "Authenticated users can view incident media"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'incident-media');

-- Allow authenticated users to upload incident media
CREATE POLICY "Authenticated users can upload incident media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'incident-media'
  AND (storage.foldername(name))[1] = 'incidents'
);

-- Allow admins to delete incident media
CREATE POLICY "Admins can delete incident media"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'incident-media'
  AND EXISTS (
    SELECT 1 FROM public.users
    WHERE auth_id = auth.uid()
    AND role IN ('admin', 'super_admin')
  )
);


-- Camera Captures Bucket Policies
-- --------------------------------

-- Allow authenticated users to view camera captures
CREATE POLICY "Authenticated users can view camera captures"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'camera-captures');

-- Allow system to upload camera captures
CREATE POLICY "System can upload camera captures"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'camera-captures'
  AND (storage.foldername(name))[1] = 'captures'
);

-- Allow admins to manage camera captures
CREATE POLICY "Admins can manage camera captures"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'camera-captures'
  AND EXISTS (
    SELECT 1 FROM public.users
    WHERE auth_id = auth.uid()
    AND role IN ('admin', 'super_admin')
  )
);


-- User Avatars Bucket Policies
-- --------------------------------

-- Anyone can view user avatars (public bucket)
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'user-avatars');

-- Users can upload their own avatar
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'user-avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can update their own avatar
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'user-avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can delete their own avatar
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'user-avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- =============================================
-- STORAGE HELPER FUNCTIONS
-- =============================================

-- Function to get signed URL for incident media
CREATE OR REPLACE FUNCTION get_incident_media_url(p_file_path TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN storage.get_signed_url('incident-media', p_file_path, 3600);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate unique file name
CREATE OR REPLACE FUNCTION generate_storage_filename(
  p_prefix TEXT,
  p_extension TEXT
)
RETURNS TEXT AS $$
BEGIN
  RETURN p_prefix || '/' || uuid_generate_v4()::TEXT || '.' || p_extension;
END;
$$ LANGUAGE plpgsql;
