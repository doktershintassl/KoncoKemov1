# Panduan Desain Responsif (Mobile & Tablet)

## Prinsip Utama Adaptabilitas Layar Kecil
Khusus untuk perangkat tablet dan terutama layar *mobile*/ponsel yang sempit, semua komponen antarmuka pengguna (UI) harus dirancang agar lebih **fit**, **kompak**, dan **tidak saling berdesakan**. Tujuan utamanya adalah menciptakan pengalaman pengguna (*User Experience*) yang mengalir mulus selayaknya aplikasi *native*.

## Aturan Implementasi

### 1. Manajemen Ruang & Kepadatan Komponen
- **Kompak namun Terbaca**: Sesuaikan `padding`, `margin`, dan ukuran *font* menggunakan Tailwind *breakpoints* (seperti `sm:`, `md:`) agar elemen tidak memakan terlalu banyak ruang di layar kecil, namun target sentuh (*touch target*) tetap ideal (minimal 44px).
- **Cegah Tabrakan Elemen (*Overlapping*)**: Jika terdapat beberapa elemen (seperti tombol, ikon, atau teks panjang) yang berpotensi saling menumpuk atau berdesakan pada mode *mobile*, **pisahkan atau pindahkan tata letaknya**. 
  - *Contoh*: Mengubah susunan baris horizontal (`flex-row`) menjadi kolom vertikal (`flex-col`) pada layar kecil.
  - Memindahkan menu samping (*sidebar*) menjadi menu laci (*drawer/bottom navigation*).

### 2. Konsistensi Visual (Strict Constraint)
- **Dilarang Mengubah Identitas Visual Utama**: Saat melakukan penyesuaian khusus *mobile* (seperti memisahkan tatanan letak), **JANGAN sesekali mengubah warna, jenis font, gaya border, atau ciri khas UI utama** yang sudah ditetapkan (merujuk pada AGENTS.md). 
- Warna-warna utama (misalnya palet `--color-primary-*`) dan bayangan elemen harus tetap sama persis seperti versi *desktop*. Penyesuaian murni hanya terbatas pada struktural (dimensi layar) dan layout *grid/flex*.

### 3. Native App Feel
- Alur *scrolling*, penempatan tombol aksi utama (*Call to Action*/CTA), dan cara panel terbuka pada layar ponsel harus dieksekusi serupa dengan pola yang familiar di aplikasi *mobile native* modern.
- Pendekatan proaktif: Gunakan responsivitas sebelum terjadi distorsi. Terapkan logika penyembunyian teks (*text truncation* atau ikon saja tanpa label pada area sempit) jika itu membantu menghindari UI yang berantakan.

> **Panduan Agen (AI Studio)**: Agen *developer* wajib memprioritaskan dan secara *default* sudah mengintegrasikan aturan tata letak *mobile-first* dan *responsive-design* secara teliti pada kode pertama (**Do it right the first time**). Tidak semestinya pengguna perlu mengajukan revisi berulang-ulang hanya untuk memperbaiki elemen yang tumpah atau *layout* yang pecah di layar kecil.
