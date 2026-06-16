-- Tabel hero_slides
CREATE TABLE hero_slides (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL,
  image TEXT NOT NULL,
  cta TEXT NOT NULL,
  cta_link TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS (Row Level Security) - Opsional, biarkan public untuk read
ALTER TABLE hero_slides ENABLE ROW LEVEL SECURITY;

-- Policy untuk read (public)
CREATE POLICY "Public profiles are viewable by everyone."
  ON hero_slides FOR SELECT
  USING ( true );

-- Policy untuk admin write (asumsi admin auth dikonfigurasikan di Supabase)
-- Jika Anda belum mengonfigurasi autentikasi Admin dengan role, sementara Anda bisa membuat insert/update/delete menjadi public (tidak disarankan untuk production)
-- Policy di bawah ini mengizinkan semua orang untuk modifikasi, ganti ke role=admin saat auth siap:
CREATE POLICY "Anyone can insert slides (temporary)"
  ON hero_slides FOR INSERT
  WITH CHECK ( true );

CREATE POLICY "Anyone can update slides (temporary)"
  ON hero_slides FOR UPDATE
  USING ( true )
  WITH CHECK ( true );

CREATE POLICY "Anyone can delete slides (temporary)"
  ON hero_slides FOR DELETE
  USING ( true );

-- Insert data awal (Default KoncoKemo)
INSERT INTO hero_slides (title, subtitle, image, cta, cta_link, order_index) VALUES 
('Sahabat Setia di Setiap Langkah Kemo Anda', 'KoncoKemo hadir memberikan dukungan edukatif dan moral untuk memastikan Anda tidak pernah merasa sendirian dalam perjalanan penyembuhan.', 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=2000', 'Cek Diri Sekarang', '#cek-diri', 1),
('Edukasi Medis yang Mudah Dipahami', 'Dapatkan informasi akurat seputar kemoterapi, efek samping, dan tips perawatan diri dari tenaga profesional yang terpercaya.', 'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?auto=format&fit=crop&q=80&w=2000', 'Baca Edukasi', '#edukasi', 2),
('Cerita Inspiratif dari Para Pejuang', 'Temukan semangat dari mereka yang telah berhasil melewati masa kemoterapi dengan penuh keberanian dan harapan.', 'https://images.unsplash.com/photo-1542884748-2b87b00f330c?auto=format&fit=crop&q=80&w=2000', 'Lihat Cerita', '#cerita', 3);
