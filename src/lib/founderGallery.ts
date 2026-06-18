import { supabase } from './supabase';

export interface FounderGalleryImage {
  id: string;
  image_url: string;
  description?: string;
  order_index?: number;
}

export async function getFounderGallery(): Promise<FounderGalleryImage[]> {
  const { data, error } = await supabase
    .from('founder_gallery')
    .select('*')
    .order('order_index', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) {
    console.error("Error fetching founder gallery:", error);
    return [];
  }

  if (data && data.length > 0) {
    return data.map(item => ({
      id: item.id,
      image_url: item.image_url,
      description: item.description,
      order_index: item.order_index
    }));
  }

  return [];
}

export async function saveFounderGalleryImage(image: Omit<FounderGalleryImage, 'id'>, id?: string) {
  if (id) {
    const { error } = await supabase
      .from('founder_gallery')
      .update({
        image_url: image.image_url,
        description: image.description,
        order_index: image.order_index || 0
      })
      .eq('id', id);

    if (error) throw error;
  } else {
    const { error } = await supabase
      .from('founder_gallery')
      .insert([{
        image_url: image.image_url,
        description: image.description,
        order_index: image.order_index || 0
      }]);

    if (error) throw error;
  }
  
  window.dispatchEvent(new Event('founder-gallery-updated'));
}

export async function deleteFounderGalleryImage(id: string) {
  const { error } = await supabase
    .from('founder_gallery')
    .delete()
    .eq('id', id);

  if (error) throw error;
  window.dispatchEvent(new Event('founder-gallery-updated'));
}

export async function updateFounderGalleryOrder(orderedIds: string[]) {
  const updates = orderedIds.map((id, index) => 
    supabase.from('founder_gallery').update({ order_index: index }).eq('id', id)
  );
  
  await Promise.all(updates);
  window.dispatchEvent(new Event('founder-gallery-updated'));
}
