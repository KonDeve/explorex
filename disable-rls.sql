-- Quick Fix: Disable RLS on Storage Objects
-- Run this in your Supabase SQL Editor

-- Disable RLS on storage.objects table
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- Drop any existing policies (optional, in case they conflict)
DROP POLICY IF EXISTS "Allow authenticated uploads to profile" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates to profile" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes to profile" ON storage.objects;
DROP POLICY IF EXISTS "Public read access to profile images" ON storage.objects;

-- That's it! Now try uploading again.
