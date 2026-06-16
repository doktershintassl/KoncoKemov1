import { supabase } from './supabase';

export interface DokterContact {
  label: string;
  value: string;
}

export interface DokterPractice {
  workplace: string;
  address: string;
  contacts: DokterContact[];
}

export interface Dokter {
  id: string;
  name: string;
  specialization: string;
  provinsi?: string;
  kota?: string;
  practices: DokterPractice[];
  image_url?: string;
  is_favourite?: boolean;
  created_at?: string;
}

export async function getDokters(options?: {
  page?: number;
  limit?: number;
  searchQuery?: string;
  specialization?: string;
  kota?: string;
}): Promise<{ data: Dokter[], total: number }> {
  let query = supabase
    .from('dokters')
    .select('*', { count: 'exact' });

  if (options?.searchQuery) {
    // Requires search_text generated column in database for searching inside JSONB practices
    query = query.or(`name.ilike.%${options.searchQuery}%,specialization.ilike.%${options.searchQuery}%,provinsi.ilike.%${options.searchQuery}%,kota.ilike.%${options.searchQuery}%,search_text.ilike.%${options.searchQuery}%`);
  }

  if (options?.specialization && options.specialization !== 'Semua') {
    query = query.eq('specialization', options.specialization);
  }

  if (options?.kota && options.kota !== 'Semua') {
    query = query.eq('kota', options.kota);
  }

  query = query
    .order('is_favourite', { ascending: false })
    .order('provinsi', { ascending: true, nullsFirst: false })
    .order('kota', { ascending: true, nullsFirst: false })
    .order('practices->0->workplace', { ascending: true, nullsFirst: false })
    .order('specialization', { ascending: true })
    .order('name', { ascending: true });

  if (options?.page && options?.limit) {
    const from = (options.page - 1) * options.limit;
    const to = from + options.limit - 1;
    query = query.range(from, to);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error("Error fetching docs:", error);
    return { data: [], total: 0 };
  }

  return { data: data as Dokter[], total: count || 0 };
}

export async function getSpecializations(): Promise<string[]> {
  const { data, error } = await supabase
    .from('dokters')
    .select('specialization');

  if (error) {
    console.error("Error fetching specializations:", error);
    return [];
  }

  const specializations = Array.from(new Set(data.map(d => d.specialization))).filter(Boolean);
  return specializations.sort();
}

export async function getCities(): Promise<string[]> {
  const { data, error } = await supabase
    .from('dokters')
    .select('kota');

  if (error) {
    console.error("Error fetching cities:", error);
    return [];
  }

  const cities = Array.from(new Set(data.map(d => d.kota))).filter(Boolean);
  return cities.sort();
}

export async function getDokterById(id: string): Promise<Dokter | null> {
  const { data, error } = await supabase
    .from('dokters')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error("Error fetching doc by id:", error);
    return null;
  }

  return data as Dokter;
}

export interface PracticeMetadata {
  workplace: string;
  address: string;
  contacts: DokterContact[];
}

export async function getDokterFormMetadata(): Promise<{
  specializations: string[];
  cities: string[];
  provinces: string[];
  practices: Record<string, PracticeMetadata>;
}> {
  const { data, error } = await supabase
    .from('dokters')
    .select('specialization, kota, provinsi, practices');

  if (error) {
    console.error("Error fetching metadata:", error);
    return { specializations: [], cities: [], provinces: [], practices: {} };
  }

  const specializations = new Set<string>();
  const cities = new Set<string>();
  const provinces = new Set<string>();
  const practices: Record<string, PracticeMetadata> = {};

  data.forEach((doc) => {
    if (doc.specialization) specializations.add(doc.specialization);
    if (doc.kota) cities.add(doc.kota);
    if (doc.provinsi) provinces.add(doc.provinsi);
    if (doc.practices && Array.isArray(doc.practices)) {
      doc.practices.forEach((p: any) => {
        if (p.workplace && !practices[p.workplace]) {
          practices[p.workplace] = {
            workplace: p.workplace,
            address: p.address || "",
            contacts: p.contacts || []
          };
        }
      });
    }
  });

  return {
    specializations: Array.from(specializations).sort(),
    cities: Array.from(cities).sort(),
    provinces: Array.from(provinces).sort(),
    practices
  };
}

export async function saveDokter(dokter: Omit<Dokter, 'id' | 'created_at'>, id?: string) {
  let savedId = id;

  if (id) {
    const { error } = await supabase
      .from('dokters')
      .update({
        name: dokter.name,
        specialization: dokter.specialization,
        provinsi: dokter.provinsi,
        kota: dokter.kota,
        practices: dokter.practices,
        image_url: dokter.image_url
      })
      .eq('id', id);

    if (error) throw error;
  } else {
    const { data, error } = await supabase
      .from('dokters')
      .insert([{
        name: dokter.name,
        specialization: dokter.specialization,
        provinsi: dokter.provinsi,
        kota: dokter.kota,
        practices: dokter.practices,
        image_url: dokter.image_url
      }])
      .select('id')
      .single();

    if (error) throw error;
    if (data) {
      savedId = data.id;
    }
  }

  // Sync practices to other doctors
  if (dokter.practices && dokter.practices.length > 0 && savedId) {
    const { data: allDocs, error: fetchErr } = await supabase
      .from('dokters')
      .select('id, practices')
      .neq('id', savedId);

    if (!fetchErr && allDocs) {
      const updates = [];
      const updatedWorkplaceMap = new Map(
        dokter.practices.map(p => [p.workplace, p])
      );

      for (const doc of allDocs) {
        if (!doc.practices || !Array.isArray(doc.practices)) continue;
        
        let needsUpdate = false;
        const newPractices = doc.practices.map((p: any) => {
          if (p.workplace && updatedWorkplaceMap.has(p.workplace)) {
            const newP = updatedWorkplaceMap.get(p.workplace)!;
            const addressChanged = newP.address !== p.address;
            const contactsChanged = JSON.stringify(newP.contacts) !== JSON.stringify(p.contacts);
            
            if (addressChanged || contactsChanged) {
              needsUpdate = true;
              return { ...p, address: newP.address, contacts: newP.contacts };
            }
          }
          return p;
        });

        if (needsUpdate) {
          updates.push(
            supabase.from('dokters').update({ practices: newPractices }).eq('id', doc.id)
          );
        }
      }
      
      if (updates.length > 0) {
         await Promise.all(updates);
      }
    }
  }
}

export async function deleteDokter(id: string) {
  const { error } = await supabase
    .from('dokters')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function setDokterFavourite(id: string) {
  // Unset previous favourites
  const { data } = await supabase.from('dokters').select('id').eq('is_favourite', true);
  if (data && data.length > 0) {
    for (const doc of data) {
      if (doc.id !== id) {
        await supabase.from('dokters').update({ is_favourite: false }).eq('id', doc.id);
      }
    }
  }

  // Set new favourite
  const { error } = await supabase.from('dokters').update({ is_favourite: true }).eq('id', id);
  if (error) throw error;
}
