# Tentang Aplikasi KoncoKemo

## 🌟 Visi & Misi
**KoncoKemo** (berasal dari kata *Konco* = Teman, *Kemo* = Kemoterapi) adalah sebuah platform digital komprehensif yang dirancang khusus untuk mendampingi, mengedukasi, dan memberikan dukungan kepada pasien kanker, penyintas (survivor), keluarga, serta masyarakat luas. Aplikasi ini menjembatani pasien dengan informasi medis yang valid, tenaga ahli, dan komunitas yang saling menguatkan.

---

## 🚀 Fitur Utama (Antarmuka Publik)

Aplikasi ini menyediakan berbagai modul informasi interaktif yang dapat diakses secara bebas oleh masyarakat:

1. **Beranda & Hero Slider (`/`)**
   - Menyajikan informasi terbaru, pengumuman, atau kampanye kesehatan melalui slider visual yang dinamis.
   - Dilengkapi *Greeting Widget* (sapaan hangat interaktif) yang memberikan kesan personal bagi pengunjung.

2. **Pusat Edukasi Kesehatan (`/edukasi`)**
   - Pustaka literasi yang memuat artikel, panduan medis, dan video edukasi seputar kanker, persiapan kemoterapi, manajemen nyeri, hingga nutrisi harian.
   - Dilengkapi fitur pencarian dan filter kategori (Artikel, Video, Panduan) untuk memudahkan penelusuran.

3. **Cerita Konco (`/cerita-konco`)**
   - Ruang berbagi kisah inspiratif dan pengalaman emosional dari para penyintas kanker. 
   - Bertujuan untuk memberikan dukungan psikologis, motivasi, serta pesan bahwa setiap pasien tidak berjuang sendirian.

4. **Konco Dokter (`/konco-dokter`)**
   - Direktori lengkap profil tenaga medis (Spesialis Onkologi, Bedah, Konselor, dll.).
   - Menampilkan detail kualifikasi, jadwal praktik, keahlian, dan informasi lokasi rumah sakit untuk memudahkan pasien mendapatkan penanganan ahli.

5. **Cek Mandiri & Tata Laksana (`/cek-mandiri`, `/tata-laksana`)**
   - Modul edukasi untuk deteksi dini (seperti panduan pemeriksaan mandiri SADARI).
   - Menyediakan alur tata laksana pengobatan (Clinical Pathways) dan rekomendasi tindakan medis terstandar.

6. **Interaksi & Bantuan**
   - **Floating Chat Button**: Akses cepat bagi pengguna untuk berkomunikasi, bertanya, atau mendapatkan bantuan dari tim KoncoKemo di setiap halaman.

---

## 🛠️ Dasbor Admin (Content Management System)

Untuk menjaga agar seluruh informasi tetap *up-to-date* dan valid secara medis, aplikasi ini dibekali sistem Back-Office yang diproteksi (`/admin/*`):

- **Autentikasi Aman**: Perlindungan akses login menggunakan Supabase Auth.
- **Manajemen Edukasi**: Editor artikel (*Rich Text Editor*) untuk menulis, memperbarui, dan mengarsipkan materi kesehatan.
- **Manajemen Cerita Konco**: Kurasi dan persetujuan (CRUD) kisah-kisah yang dikirimkan oleh komunitas penyintas.
- **Manajemen Dokter**: Penambahan dan pembaruan data profil dokter, lokasi, dan jadwal konsultasi.
- **Manajemen Slide Beranda (Hero Slides)**: Kontrol penuh untuk mengatur visual promosi atau pengumuman utama pada halaman depan.
- **Manajemen Founder Gallery**: Galeri dokumentasi, profil tim inisiator, dan rekam jejak kegiatan KoncoKemo.

---

## 💻 Arsitektur & Tumpukan Teknologi (Tech Stack)

KoncoKemo dibangun di atas ekosistem *Full-Stack Web Modern* yang memastikan keamanan, kecepatan, dan skalabilitas:

*   **Frontend Engine**: [React 18+](https://react.dev/) berjalan di atas [Vite](https://vitejs.dev/) untuk performa *rendering* dan waktu muat (*load time*) yang sangat cepat.
*   **Bahasa Pemrograman**: [TypeScript](https://www.typescriptlang.org/) digunakan di seluruh basis kode untuk mencegah *bug* (type-safety) dan memastikan kode yang terstruktur.
*   **Styling & UI**: [Tailwind CSS](https://tailwindcss.com/) dengan ketaatan penuh pada *Design System* khusus KoncoKemo. Tampilan menggunakan palet warna utama ungu (`primary-50` hingga `primary-900`) untuk menjaga identitas *brand* yang tenang dan profesional.
*   **Database & Backend (BaaS)**: [Supabase](https://supabase.com/)
    *   **PostgreSQL**: Basis data relasional yang menampung seluruh skema tabel.
    *   **Supabase Storage**: Penyimpanan *cloud* untuk aset gambar (foto dokter, *thumbnail* artikel, galeri slider).
*   **PWA (Progressive Web App)**: Dikonfigurasi dengan `manifest.json` dan *Service Worker* (`sw.js`). Pengguna dapat menginstal KoncoKemo ke layar utama (*home screen*) ponsel pintar mereka layaknya aplikasi seluler mandiri dan menyediakan fitur aksesibilitas tingkat tinggi.
*   **Ikonografi**: [Lucide React](https://lucide.dev/).

---

## 🗄️ Struktur Basis Data Skematik (PostgreSQL)

Inti dari data KoncoKemo dipetakan dalam 5 tabel utama:

1.  **`Edukasi`**: Tabel artikel kesehatan (`id`, `judul`, `konten`, `kategori`, `author`, `image_url`, `published_at`).
2.  **`CeritaKonco`**: Tabel kisah nyata (`id`, `nama`, `jenis_kanker`, `cerita`, `image_url`, `is_published`).
3.  **`DokterKemo`**: Direktori medis (`id`, `nama`, `spesialisasi`, `lokasi`, `jadwal`, `kontak`, `foto_url`).
4.  **`HeroSlide`**: Slider halaman depan (`id`, `title`, `subtitle`, `image_url`, `action_link`, `order_index`).
5.  **`FounderGallery`**: Dokumentasi pendiri (`id`, `nama`, `peran`, `deskripsi`, `image_url`).

---

## 🌐 Skema Infrastruktur & Deployment

*   **Server / Hosting**: Diarahkan secara default menuju platform *serverless* modern seperti **Vercel** atau **Google Cloud Run**. (Lihat panduan terpisah di `/docs/VERCEL_DEPLOYMENT_GUIDE.md`).
*   **SEO & Optimasi**: Aplikasi dibangun dengan dukungan struktur `<head>` yang tertata menggunakan komponen `<SEO />`, `sitemap.xml`, dan `robots.txt` agar mudah ditemukan oleh mesin pencari seperti Google.

---

> *"KoncoKemo: Karena Anda Tidak Berjuang Sendirian."*
