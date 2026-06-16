import { supabase } from './supabase';

export interface CeritaKonco {
  id: string;
  title: string;
  patient_name: string;
  subtitle_hook: string;
  thumbnail_image: string;
  content: string;
  order_index?: number;
  created_at?: string;
}

export async function getCeritaKoncos(options?: {
  page?: number;
  limit?: number;
}): Promise<{ data: CeritaKonco[], total: number }> {
  let query = supabase
    .from('cerita_konco')
    .select('*', { count: 'exact' });

  query = query
    .order('order_index', { ascending: true })
    .order('created_at', { ascending: false });

  if (options?.page && options?.limit) {
    const from = (options.page - 1) * options.limit;
    const to = from + options.limit - 1;
    query = query.range(from, to);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error("Error fetching cerita konco:", error);
    return { data: [], total: 0 };
  }

  return { data: data as CeritaKonco[], total: count || 0 };
}

export async function getCeritaKoncoById(id: string): Promise<CeritaKonco | null> {
  const { data, error } = await supabase
    .from('cerita_konco')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error("Error fetching cerita konco by id:", error);
    return null;
  }

  return data as CeritaKonco;
}

export async function saveCeritaKonco(cerita: Omit<CeritaKonco, 'id' | 'created_at'>, id?: string) {
  if (id) {
    const { error } = await supabase
      .from('cerita_konco')
      .update({
        title: cerita.title,
        patient_name: cerita.patient_name,
        subtitle_hook: cerita.subtitle_hook,
        thumbnail_image: cerita.thumbnail_image,
        content: cerita.content,
        order_index: cerita.order_index || 0
      })
      .eq('id', id);

    if (error) throw error;
  } else {
    const { error } = await supabase
      .from('cerita_konco')
      .insert([{
        title: cerita.title,
        patient_name: cerita.patient_name,
        subtitle_hook: cerita.subtitle_hook,
        thumbnail_image: cerita.thumbnail_image,
        content: cerita.content,
        order_index: cerita.order_index || 0
      }]);

    if (error) throw error;
  }
}

export async function deleteCeritaKonco(id: string) {
  const { error } = await supabase
    .from('cerita_konco')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function updateCeritaKoncoOrder(orderedIds: string[]) {
  const updates = orderedIds.map((id, index) => 
    supabase.from('cerita_konco').update({ order_index: index }).eq('id', id)
  );
  
  await Promise.all(updates);
}
