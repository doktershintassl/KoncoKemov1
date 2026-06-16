-- Tabel edukasi
CREATE TABLE edukasi (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL,
  media_url TEXT NOT NULL, -- Bisa Image URL atau Youtube URL
  media_type TEXT DEFAULT 'image', -- 'image' or 'video'
  content TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT false,
  topic TEXT,
  kontributor TEXT,
  publish_datetime TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS (Row Level Security)
ALTER TABLE edukasi ENABLE ROW LEVEL SECURITY;

-- Policy untuk read (public)
CREATE POLICY "Public edukasi are viewable by everyone."
  ON edukasi FOR SELECT
  USING ( true );

-- Policy untuk write (admin/temporary public)
CREATE POLICY "Anyone can insert edukasi (temporary)"
  ON edukasi FOR INSERT
  WITH CHECK ( true );

CREATE POLICY "Anyone can update edukasi (temporary)"
  ON edukasi FOR UPDATE
  USING ( true )
  WITH CHECK ( true );

CREATE POLICY "Anyone can delete edukasi (temporary)"
  ON edukasi FOR DELETE
  USING ( true );

-- Insert data awal
INSERT INTO edukasi (title, subtitle, media_url, media_type, content, order_index) VALUES 
('Mengenal Kemoterapi', 'Panduan dasar mengenai prosedur kemoterapi dan apa yang perlu dipersiapkan.', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'video', 'Prosedur kemoterapi adalah...', 1),
('Nutrisi Selama Pengobatan', 'Makanan yang dianjurkan untuk menjaga kondisi tubuh tetap optimal.', 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=1200', 'image', 'Nutrisi sangat penting untuk...', 2);
