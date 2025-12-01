import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. Using mock data.')
}

export const supabase = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
)

// Storage bucket names
export const STORAGE_BUCKETS = {
  INCIDENT_MEDIA: 'incident-media',
  CAMERA_CAPTURES: 'camera-captures',
  USER_AVATARS: 'user-avatars',
} as const

// Helper function to upload incident media
export async function uploadIncidentMedia(
  incidentId: string,
  file: File
): Promise<{ url: string; path: string } | null> {
  const fileExt = file.name.split('.').pop()
  const fileName = `incidents/${incidentId}/${Date.now()}.${fileExt}`

  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKETS.INCIDENT_MEDIA)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) {
    console.error('Error uploading incident media:', error)
    return null
  }

  const { data: urlData } = supabase.storage
    .from(STORAGE_BUCKETS.INCIDENT_MEDIA)
    .getPublicUrl(data.path)

  return {
    url: urlData.publicUrl,
    path: data.path,
  }
}

// Helper function to upload camera capture
export async function uploadCameraCapture(
  cameraId: string,
  imageBlob: Blob
): Promise<{ url: string; path: string } | null> {
  const fileName = `captures/${cameraId}/${Date.now()}.jpg`

  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKETS.CAMERA_CAPTURES)
    .upload(fileName, imageBlob, {
      cacheControl: '3600',
      contentType: 'image/jpeg',
      upsert: false,
    })

  if (error) {
    console.error('Error uploading camera capture:', error)
    return null
  }

  const { data: urlData } = supabase.storage
    .from(STORAGE_BUCKETS.CAMERA_CAPTURES)
    .getPublicUrl(data.path)

  return {
    url: urlData.publicUrl,
    path: data.path,
  }
}

// Helper function to upload user avatar
export async function uploadUserAvatar(
  userId: string,
  file: File
): Promise<string | null> {
  const fileExt = file.name.split('.').pop()
  const fileName = `${userId}/avatar.${fileExt}`

  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKETS.USER_AVATARS)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: true,
    })

  if (error) {
    console.error('Error uploading avatar:', error)
    return null
  }

  const { data: urlData } = supabase.storage
    .from(STORAGE_BUCKETS.USER_AVATARS)
    .getPublicUrl(data.path)

  return urlData.publicUrl
}

// Helper to get signed URL for private files
export async function getSignedUrl(
  bucket: string,
  path: string,
  expiresIn: number = 3600
): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn)

  if (error) {
    console.error('Error getting signed URL:', error)
    return null
  }

  return data.signedUrl
}

// Helper to delete file from storage
export async function deleteFile(bucket: string, path: string): Promise<boolean> {
  const { error } = await supabase.storage.from(bucket).remove([path])

  if (error) {
    console.error('Error deleting file:', error)
    return false
  }

  return true
}

export default supabase
