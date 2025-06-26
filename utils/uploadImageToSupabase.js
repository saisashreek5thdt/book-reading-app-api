// utils/uploadImageToSupabase.js
import { supabase } from '@/lib/supabaseClient'

const BUCKET_NAME = 'book-images' // your bucket name

export async function uploadImage(file, folder = 'covers') {
  if (!file || !file.size) return null

  const filePath = `${folder}/${Date.now()}-${file.name}`

  // Upload file to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file)

  if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`)

  // ✅ Generate public URL (no expiration!)
  const publicUrl = `https://${supabase.options.auth.url
    .replace('https://', '')
    .replace('/auth/v1', '')}/storage/v1/object/public/${BUCKET_NAME}/${filePath}`

  return publicUrl
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