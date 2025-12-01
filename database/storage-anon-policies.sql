-- =============================================
-- PAHAL - Anonymous User Storage Policies
-- Allow citizens to upload incident photos without login
-- =============================================

-- STEP 1: Check if bucket exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'incident-media'
  ) THEN
    RAISE EXCEPTION 'Bucket "incident-media" does not exist. Create it first in Supabase Dashboard → Storage';
  END IF;
END $$;

-- STEP 2: Drop existing anonymous policies if they exist (to allow re-running this script)
DROP POLICY IF EXISTS "Anonymous users can upload incident media" ON storage.objects;
DROP POLICY IF EXISTS "Anonymous users can view incident media" ON storage.objects;

-- STEP 3: Create policies for anonymous users
-- Allow anonymous users to upload incident media
CREATE POLICY "Anonymous users can upload incident media"
ON storage.objects FOR INSERT
TO anon
WITH CHECK (
  bucket_id = 'incident-media'
  AND (storage.foldername(name))[1] = 'incidents'
);

-- Allow anonymous users to view their uploaded incident media
-- (This is needed so they can see preview after upload)
CREATE POLICY "Anonymous users can view incident media"
ON storage.objects FOR SELECT
TO anon
USING (bucket_id = 'incident-media');

-- STEP 4: Verify policies were created
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Anonymous users can upload incident media'
  ) THEN
    RAISE NOTICE '✅ Anonymous upload policy created successfully';
  ELSE
    RAISE EXCEPTION '❌ Failed to create anonymous upload policy';
  END IF;
END $$;

-- =============================================
-- INSTRUCTIONS:
-- =============================================
-- 1. Go to Supabase Dashboard
-- 2. Navigate to SQL Editor
-- 3. Copy and paste this entire file
-- 4. Click "Run" or press Ctrl+Enter
-- 5. Check for success messages
-- 6. Test photo upload in your app
-- =============================================
