-- Tabel cerita_konco
CREATE TABLE cerita_konco (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle_hook TEXT NOT NULL,
  thumbnail_image TEXT NOT NULL,
  content TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS (Row Level Security)
ALTER TABLE cerita_konco ENABLE ROW LEVEL SECURITY;

-- Policy untuk read (public)
CREATE POLICY "Public profiles are viewable by everyone."
  ON cerita_konco FOR SELECT
  USING ( true );

-- Policy untuk write (sementara public seperti hero slides)
CREATE POLICY "Anyone can insert cerita (temporary)"
  ON cerita_konco FOR INSERT
  WITH CHECK ( true );

CREATE POLICY "Anyone can update cerita (temporary)"
  ON cerita_konco FOR UPDATE
  USING ( true )
  WITH CHECK ( true );

CREATE POLICY "Anyone can delete cerita (temporary)"
  ON cerita_konco FOR DELETE
  USING ( true );

-- Insert data awal
INSERT INTO cerita_konco (title, subtitle_hook, thumbnail_image, content, order_index) VALUES 
('Kekuatan dalam Kelembutan', 'Kisah inspiratif Ibu Siti yang menemukan kembali semangat hidupnya melalui melukis selama menjalani sesi kemoterapi selama 6 bulan terakhir.', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=1000', '# Perjalanan Melukis Harapan

Setiap kanvas menceritakan perjuangan yang tidak bisa diucapkan dengan kata-kata. Sejak didiagnosis 6 bulan lalu, melukis menjadi ruang paling aman.

![Painting](https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=1000)

Melukis mengajarkan satu hal: meski warna hidup terkadang gelap, kita selalu punya pilihan untuk mencampurnya dengan warna cerah di kuas kita sendiri. Selama sesi kemoterapi, alih-alih meratapi rasa sakit, menggambar sketsa kecil membuat jam demi jam terasa lebih bermakna.', 1),
('Harmoni Nada di Ruang Perawatan', 'Toni mengubah rasa cemasnya menjadi melodi indah dengan gitar kesayangannya, memberikan inspirasi bagi sesama pasien pejuang kanker.', 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=1000', '# Melodi Kesembuhan

Gitar adalah teman paling setia. Di saat tubuh terasa tak berdaya menghadapi pengobatan, memetik senar adalah terapi jiwaku.

Hari demi hari berlalu di bangsal rumah sakit. Awalnya terasa sunyi dan menakutkan, namun musik menyatukan kami. Aku mulai memainkan gitar di ruang santai, dan melihat senyum merekah dari sesama pasien. Musik adalah bahasa universal untuk berjuang bersama.', 2);

