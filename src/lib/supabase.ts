import { createClient } from '@supabase/supabase-js';

// Konfigurasi Supabase ini disiapkan untuk masa mendatang.
// Tambahkan VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY di Secrets manager/Environment.

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

// Instance client Supabase (belum digunakan secara aktif, tetapi siap pakai)
export const supabase = createClient(supabaseUrl, supabaseKey);
