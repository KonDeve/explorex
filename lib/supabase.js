import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper function to get public URL for storage files
export const getStorageUrl = (bucket, path) => {
  if (!path) return null
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data?.publicUrl || null
}

// Helper function to get profile picture URL
export const getProfilePictureUrl = (profileImageUrl) => {
  if (!profileImageUrl) return null
  // If it's already a full URL, return it
  if (profileImageUrl.startsWith('http')) return profileImageUrl
  // Otherwise, construct the storage URL
  return getStorageUrl('media', `profile/${profileImageUrl}`)
}
