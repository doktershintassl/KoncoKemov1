import { supabase } from './supabase';

export interface Edukasi {
  id: string;
  title: string;
  subtitle: string;
  media_url: string;
  media_type: 'image' | 'video';
  content: string;
  order_index?: number;
  is_pinned?: boolean;
  topic?: string;
  kontributor?: string;
  publish_datetime?: string;
  created_at?: string;
}

export async function getEdukasis(options?: {
  page?: number;
  limit?: number;
  searchQuery?: string;
  type?: string;
  topic?: string;
  clientSide?: boolean;
  startDate?: string;
  endDate?: string;
  ignorePinned?: boolean;
}): Promise<{ data: Edukasi[], total: number }> {
  let query = supabase
    .from('edukasi')
    .select('*', { count: 'exact' });

  if (options?.searchQuery) {
    query = query.or(`title.ilike.%${options.searchQuery}%,subtitle.ilike.%${options.searchQuery}%,content.ilike.%${options.searchQuery}%`);
  }

  if (options?.type && options.type !== 'Semua') {
    const typeValue = options.type.toLowerCase() === 'artikel' ? 'image' : 'video';
    query = query.eq('media_type', typeValue);
  }

  if (options?.topic && options.topic !== 'Semua') {
    query = query.eq('topic', options.topic);
  }

  if (options?.startDate) {
    query = query.gte('publish_datetime', options.startDate);
  }

  if (options?.endDate) {
    // Menambahkan 1 hari untuk membuat rentang endDate inklusif
    query = query.lte('publish_datetime', `${options.endDate}T23:59:59.999Z`);
  }

  if (options?.clientSide) {
    const now = new Date().toISOString();
    query = query.lte('publish_datetime', now);
  }

  if (options?.ignorePinned) {
    query = query.order('publish_datetime', { ascending: false, nullsFirst: false });
  } else {
    query = query
      .order('is_pinned', { ascending: false })
      .order('publish_datetime', { ascending: false, nullsFirst: false });
  }

  query = query.order('created_at', { ascending: false });

  if (options?.page && options?.limit) {
    const from = (options.page - 1) * options.limit;
    const to = from + options.limit - 1;
    query = query.range(from, to);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error("Error fetching edukasi:", error);
    return { data: [], total: 0 };
  }

  return { data: data as Edukasi[], total: count || 0 };
}

export async function getTopics(): Promise<string[]> {
  const { data, error } = await supabase
    .from('edukasi')
    .select('topic');

  if (error) {
    console.error("Error fetching topics:", error);
    return [];
  }

  const topics = Array.from(new Set(data.filter(d => d.topic).map(d => d.topic as string)));
  return topics.sort();
}

export async function getEdukasiById(id: string): Promise<Edukasi | null> {
  const { data, error } = await supabase
    .from('edukasi')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error("Error fetching edukasi by id:", error);
    return null;
  }

  return data as Edukasi;
}

export async function saveEdukasi(edukasi: Omit<Edukasi, 'id' | 'created_at'>, id?: string) {
  const dataToSave = {
    title: edukasi.title,
    subtitle: edukasi.subtitle,
    media_url: edukasi.media_url,
    media_type: edukasi.media_type,
    content: edukasi.content,
    order_index: edukasi.order_index || 0,
    topic: edukasi.topic || null,
    kontributor: edukasi.kontributor || null,
    publish_datetime: edukasi.publish_datetime || new Date().toISOString(),
    // Tidak simpan is_pinned via default save untuk menghindari overwrite saat editor biasa
  };

  if (id) {
    const { error } = await supabase
      .from('edukasi')
      .update(dataToSave)
      .eq('id', id);

    if (error) throw error;
  } else {
    const { error } = await supabase
      .from('edukasi')
      .insert([{
        ...dataToSave,
        is_pinned: false
      }]);

    if (error) throw error;
  }
}

export async function togglePinEdukasi(id: string, currentlyPinned: boolean) {
  // If we are pinning it, check if there are 3 already
  if (!currentlyPinned) {
    const { count } = await supabase
      .from('edukasi')
      .select('id', { count: 'exact' })
      .eq('is_pinned', true);
      
    if (count !== null && count >= 3) {
      throw new Error("Maksimal hanya 3 edukasi yang bisa dipinned. Hapus pin lainnya dulu.");
    }
  }

  const { error } = await supabase
    .from('edukasi')
    .update({ is_pinned: !currentlyPinned })
    .eq('id', id);

  if (error) throw error;
}

export async function deleteEdukasi(id: string) {
  const { error } = await supabase
    .from('edukasi')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function updateEdukasiOrder(orderedIds: string[]) {
  const updates = orderedIds.map((id, index) => 
    supabase.from('edukasi').update({ order_index: index }).eq('id', id)
  );
  
  await Promise.all(updates);
}
