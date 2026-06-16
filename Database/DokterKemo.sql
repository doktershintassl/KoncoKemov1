CREATE TABLE dokters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  specialization TEXT NOT NULL,
  provinsi TEXT,
  kota TEXT,
  practices JSONB DEFAULT '[]'::jsonb,
  image_url TEXT,
  is_favourite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  search_text TEXT GENERATED ALWAYS AS (
    COALESCE(name, '') || ' ' || COALESCE(specialization, '') || ' ' || COALESCE(provinsi, '') || ' ' || COALESCE(kota, '') || ' ' || COALESCE(practices::text, '')
  ) STORED
);

-- Enable RLS
ALTER TABLE dokters ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access" ON dokters FOR SELECT TO public USING (true);

-- Allow authenticated users to manage doctors
CREATE POLICY "Allow authenticated manage access" ON dokters FOR ALL TO authenticated USING (true);

-- Dummy Data (9 Doctors)
INSERT INTO dokters (name, specialization, image_url, practices) VALUES 
(
  'dr. Andi Wijaya, Sp.B(K)Onk', 
  'Spesialis Onkologi', 
  'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=200&h=200&fit=crop',
  '[
    {
      "workplace": "RS Cancer Center Jakarta",
      "address": "Jl. Gatot Subroto No.10, Jakarta Selatan",
      "contacts": [{"label": "Admin Pendaftaran", "value": "081122334455"}]
    },
    {
      "workplace": "Klinik Utama KemoCare",
      "address": "Jl. Menteng Raya No.5, Jakarta Pusat",
      "contacts": [{"label": "Layanan Homecare", "value": "021-5556677"}]
    }
  ]'
),
(
  'dr. Siti Aminah, Sp.PD-KHOM', 
  'Hematologi & Onkologi Medik', 
  'https://images.unsplash.com/photo-1594824476967-48c8b964273f?q=80&w=200&h=200&fit=crop',
  '[
    {
      "workplace": "RS Medistra",
      "address": "Jl. Gatot Subroto Kav. 59, Jakarta Selatan",
      "contacts": [{"label": "WhatsApp", "value": "081299887766"}]
    }
  ]'
),
(
  'dr. Budi Hartono, Sp.Rad(K)', 
  'Radiologi Onkologi', 
  'https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=200&h=200&fit=crop',
  '[
    {
      "workplace": "RSUP Nasional Dr. Cipto Mangunkusumo",
      "address": "Jl. Diponegoro No. 71, Senen, Jakarta Pusat",
      "contacts": [{"label": "Poli Radioterapi", "value": "021-3193037"}]
    }
  ]'
),
(
  'dr. Linda Kesuma, Sp.OG(K)Onk', 
  'Ginekologi Onkologi', 
  'https://images.unsplash.com/photo-1559839734-2b71f1536783?q=80&w=200&h=200&fit=crop',
  '[
    {
      "workplace": "Siloam Hospitals Semanggi",
      "address": "Jl. Garnisun Kav 2-3, Karet Semanggi, Jakarta",
      "contacts": [{"label": "Concierge", "value": "081344556677"}, {"label": "WhatsApp Desk", "value": "08561234567"}]
    }
  ]'
),
(
  'dr. Robertus Tan, Sp.An-KMN', 
  'Manajemen Nyeri Kanker', 
  'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=200&h=200&fit=crop',
  '[
    {
      "workplace": "RS Pondok Indah",
      "address": "Jl. Metro Pondok Indah Kav. UE, Jakarta Selatan",
      "contacts": [{"label": "Klinik Nyeri", "value": "021-7657525"}]
    }
  ]'
),
(
  'dr. Maria Susanti, Sp.PK(K)', 
  'Patologi Klinik Onkologi', 
  'https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?q=80&w=200&h=200&fit=crop',
  '[
    {
      "workplace": "Lab Klinik Utama Prodia Onkologi",
      "address": "Jl. Kramat Raya No.150, Jakarta Pusat",
      "contacts": [{"label": "Info Lab", "value": "1500830"}]
    }
  ]'
),
(
  'dr. Ahmad Fauzi, Sp.B(K)Onk', 
  'Bedah Onkologi', 
  'https://images.unsplash.com/photo-1582750433449-648ed127bb54?q=80&w=200&h=200&fit=crop',
  '[
    {
      "workplace": "RS Kanker Dharmais",
      "address": "Jl. Letjen S. Parman Kav. 84-86, Slipi, Jakarta Barat",
      "contacts": [{"label": "Poliklinik Bedah", "value": "081211112222"}]
    }
  ]'
),
(
  'dr. Jessica Putri, Sp.PD-KHOM', 
  'Hematologi & Onkologi Medik', 
  'https://images.unsplash.com/photo-1623854767648-e7bb8009f0db?q=80&w=200&h=200&fit=crop',
  '[
    {
      "workplace": "Mayapada Hospital",
      "address": "Jl. Lebak Bulus I Kav. 29, Jakarta Selatan",
      "contacts": [{"label": "Appointment Desk", "value": "0819223344"}]
    },
    {
      "workplace": "MRCCC Siloam Hospitals Semanggi",
      "address": "Jl. Garnisun Kav 2-3, Jakarta",
      "contacts": [{"label": "Admin Chemotherapy", "value": "0817009988"}]
    }
  ]'
),
(
  'dr. Bambang Irawan, Sp.KJ', 
  'Psikoterapi Kanker (Psiko-Onkologi)', 
  'https://images.unsplash.com/photo-1550831107-1553da8c8464?q=80&w=200&h=200&fit=crop',
  '[
    {
      "workplace": "Wisma Sehati Counseling",
      "address": "Jl. Senayan No.12, Jakarta Selatan",
      "contacts": [{"label": "Crisis Center", "value": "085211223344"}]
    }
  ]'
);
