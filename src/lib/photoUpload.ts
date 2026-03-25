import { supabase } from '@/integrations/supabase/client';

/**
 * Upload a base64 photo to Supabase Storage and return the public URL.
 * Falls back to returning the base64 string if upload fails.
 */
export async function uploadPhoto(base64: string): Promise<string> {
  const blob = base64ToBlob(base64);
  const fileName = `${Date.now()}-${crypto.randomUUID()}.jpg`;

  const { error } = await supabase.storage
    .from('package_photos')
    .upload(fileName, blob, { contentType: 'image/jpeg', upsert: false });

  if (error) throw error;

  const { data } = supabase.storage.from('package_photos').getPublicUrl(fileName);
  return data.publicUrl;
}

function base64ToBlob(base64: string): Blob {
  const parts = base64.split(',');
  const mime = parts[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
  const raw = atob(parts[1]);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return new Blob([arr], { type: mime });
}
