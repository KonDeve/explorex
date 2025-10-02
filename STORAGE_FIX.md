# Quick Fix for Storage Upload Issue

## Problem
You're getting a "new row violates row-level security policy" error when uploading profile images.

## Solution

### Option 1: Disable RLS on Storage (Simplest - Public Access)

Run this SQL in your Supabase SQL Editor:

```sql
-- Disable RLS on storage.objects (allows all uploads)
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;
```

### Option 2: Keep RLS but Add Proper Policies (Recommended)

If you want to keep RLS enabled for security, run these commands in your Supabase SQL Editor:

```sql
-- Enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to upload to media/profile
CREATE POLICY "Allow authenticated uploads to profile"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'media' AND (storage.foldername(name))[1] = 'profile');

-- Allow authenticated users to update their files
CREATE POLICY "Allow authenticated updates to profile"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'media' AND (storage.foldername(name))[1] = 'profile');

-- Allow authenticated users to delete their files
CREATE POLICY "Allow authenticated deletes to profile"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'media' AND (storage.foldername(name))[1] = 'profile');

-- Allow public read access
CREATE POLICY "Public read access to profile images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'media' AND (storage.foldername(name))[1] = 'profile');
```

### Option 3: Using Supabase Dashboard (Easiest)

1. Go to your Supabase Dashboard
2. Click **Storage** in the left sidebar
3. Click on the **media** bucket
4. Click **Policies** tab
5. Click **New Policy**
6. Select **Full customization**
7. Add these policies:

#### Policy 1: Allow INSERT
- **Policy name**: Allow authenticated uploads
- **Allowed operation**: INSERT
- **Target roles**: authenticated
- **USING expression**: (leave blank)
- **WITH CHECK expression**: 
  ```sql
  bucket_id = 'media' AND (storage.foldername(name))[1] = 'profile'
  ```

#### Policy 2: Allow SELECT (Read)
- **Policy name**: Public read access
- **Allowed operation**: SELECT
- **Target roles**: public
- **USING expression**: 
  ```sql
  bucket_id = 'media' AND (storage.foldername(name))[1] = 'profile'
  ```

#### Policy 3: Allow UPDATE
- **Policy name**: Allow authenticated updates
- **Allowed operation**: UPDATE
- **Target roles**: authenticated
- **USING expression**: 
  ```sql
  bucket_id = 'media' AND (storage.foldername(name))[1] = 'profile'
  ```

#### Policy 4: Allow DELETE
- **Policy name**: Allow authenticated deletes
- **Allowed operation**: DELETE
- **Target roles**: authenticated
- **USING expression**: 
  ```sql
  bucket_id = 'media' AND (storage.foldername(name))[1] = 'profile'
  ```

## Verify Bucket Settings

Make sure your **media** bucket has these settings:
- ✅ **Public**: Enabled (checkbox checked)
- ✅ **File size limit**: At least 5MB
- ✅ **Allowed MIME types**: Leave empty or add: `image/jpeg,image/jpg,image/png,image/webp`

## Test After Setup

1. Clear your browser cache or open an incognito window
2. Log in to your application
3. Go to Profile page
4. Try uploading an image

The upload should now work! If you still get errors:
- Check the browser console for the exact error message
- Make sure you're logged in (the error might be authentication-related)
- Verify the bucket name is exactly `media` (lowercase)
