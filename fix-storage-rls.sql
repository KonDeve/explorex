-- COMPLETE FIX FOR STORAGE RLS ISSUES
-- Run this entire script in your Supabase SQL Editor

-- Step 1: Check current RLS status
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'storage' AND tablename = 'objects';

-- Step 2: Drop ALL existing policies on storage.objects
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON storage.objects';
    END LOOP;
END $$;

-- Step 3: Disable RLS completely (simplest solution)
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- Alternative Step 3 (if you want to keep RLS enabled for security):
-- Comment out the line above and uncomment these lines below:

/*
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read files from media bucket
CREATE POLICY "Public Access to media bucket"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'media');

-- Allow authenticated users to upload to media bucket
CREATE POLICY "Authenticated users can upload to media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'media');

-- Allow authenticated users to update files in media bucket
CREATE POLICY "Authenticated users can update media files"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'media');

-- Allow authenticated users to delete files in media bucket
CREATE POLICY "Authenticated users can delete media files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'media');
*/

-- Verify the changes
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'storage' AND tablename = 'objects';

-- Check remaining policies (should be empty if RLS is disabled)
SELECT * FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects';
