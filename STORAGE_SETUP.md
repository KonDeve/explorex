# Supabase Storage Setup for Profile Images

## Required Storage Bucket

To enable profile image uploads, you need to create a storage bucket in your Supabase project.

### Steps to Create the Storage Bucket:

1. **Go to your Supabase Dashboard**
   - Navigate to: https://supabase.com/dashboard/project/YOUR_PROJECT_ID

2. **Access Storage Section**
   - Click on "Storage" in the left sidebar

3. **Create New Bucket**
   - Click "New bucket"
   - Bucket name: `media`
   - Public bucket: **Yes** (check this box)
   - Click "Create bucket"

4. **Set Bucket Policies**
   - Click on the `media` bucket
   - Go to "Policies" tab
   - Add the following policies:

### Policy 1: Allow authenticated users to upload (INSERT)
```sql
CREATE POLICY "Allow authenticated users to upload profile images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'media' AND 
  (storage.foldername(name))[1] = 'profile'
);
```

### Policy 2: Allow users to update their own images (UPDATE)
```sql
CREATE POLICY "Allow users to update own profile images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'media' AND 
  (storage.foldername(name))[1] = 'profile'
);
```

### Policy 3: Allow users to delete their own images (DELETE)
```sql
CREATE POLICY "Allow users to delete own profile images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'media' AND 
  (storage.foldername(name))[1] = 'profile'
);
```

### Policy 4: Allow public read access (SELECT)
```sql
CREATE POLICY "Public profile images are accessible"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'media' AND (storage.foldername(name))[1] = 'profile');
```

## Folder Structure

The application will automatically create the following folder structure:
```
media/
  └── profile/
      ├── user-id-1-timestamp.jpg
      ├── user-id-2-timestamp.png
      └── ...
```

## File Upload Specifications

- **Allowed formats**: JPEG, JPG, PNG, WebP
- **Maximum file size**: 5MB
- **File naming convention**: `{user-id}-{timestamp}.{extension}`
- **Old files**: Automatically deleted when user uploads a new profile image

## Testing the Setup

1. Log in to your application
2. Go to your profile page (Dashboard → Profile)
3. Click the camera icon on your profile picture
4. Select an image file
5. The image should upload automatically and appear immediately

If you see any errors, check:
- The `media` bucket exists and is public
- The storage policies are correctly set
- Your Supabase environment variables are correct in `.env.local`

## Troubleshooting

### Error: "Bucket not found"
- Make sure the bucket name is exactly `media` (lowercase)
- Check that the bucket is created in your Supabase project

### Error: "Permission denied"
- Verify that the storage policies are correctly set
- Make sure the bucket is set to "Public"

### Error: "File too large"
- The maximum file size is 5MB
- Try uploading a smaller image

### Images not displaying
- Check that the bucket is set to "Public"
- Verify the public access policy (SELECT) is enabled
- Check browser console for CORS errors
