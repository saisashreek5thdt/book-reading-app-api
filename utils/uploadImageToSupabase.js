// utils/uploadImageToSupabase.js
import { supabase } from '@/lib/supabaseClient'

const BUCKET_NAME = 'book-images' // your private bucket name

export async function uploadImage(file, folder = 'covers') {
  if (!file || !file.size) return null

  const filePath = `${folder}/${Date.now()}-${file.name}`

  // Upload file to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file)

  if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`)

  // Generate signed URL (valid for 24 hours)
  const { data, error: signedUrlError } = await supabase.storage
    .from(BUCKET_NAME)
    .createSignedUrl(filePath, 60 * 60 * 24) // 24-hour expiry

  if (signedUrlError) throw new Error(`Failed to create signed URL: ${signedUrlError.message}`)

  return data.signedUrl
}

export async function uploadImages(files, folder = 'pages') {
  const urls = []
  for (const file of files) {
    if (file && file.size > 0) {
      const url = await uploadImage(file, folder)
      urls.push(url)
    }
  }
  return urls
}