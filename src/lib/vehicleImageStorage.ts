import { supabase } from '@/integrations/supabase/client';

export async function uploadVehicleImage(file: File, vehicleId: string): Promise<string> {
  const timestamp = Date.now();
  const ext = file.name.split('.').pop() || 'jpg';
  const path = `${vehicleId}/${timestamp}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('vehicle-images')
    .upload(path, file, { upsert: true });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage
    .from('vehicle-images')
    .getPublicUrl(path);

  return data.publicUrl;
}

export async function deleteVehicleImage(imageUrl: string): Promise<void> {
  // Extract path from full URL
  const match = imageUrl.match(/vehicle-images\/(.+)$/);
  if (!match) return;

  const path = match[1];
  const { error } = await supabase.storage
    .from('vehicle-images')
    .remove([path]);

  if (error) console.error('Error deleting image:', error);
}
