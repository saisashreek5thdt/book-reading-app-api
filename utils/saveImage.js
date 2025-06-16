// utils/saveImage.js
export async function saveImage(file) {
  if (!file || !file.size) return null;

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const base64 = buffer.toString('base64');
  const mimeType = file.type || 'image/jpeg'; // Fallback type

  return `data:${mimeType};base64,${base64}`;
}