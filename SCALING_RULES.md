# Pedoman Skalabilitas & Performa Arsitektur

Dokumen ini berisi standar arsitektur dan pedoman optimasi performa agar aplikasi dapat menangani trafik tinggi (puluhan ribu pengunjung secara bersamaan) dengan infrastruktur Free Tier (misal: Vercel Hobby & Supabase Free). Pedoman ini bersifat **Re-usable** untuk pengembangan modul lanjutan maupun untuk diterapkan pada website lainnya.

## 1. Caching Data (Stale-While-Revalidate)
Batasi pemanggilan (read operations) berulang ke database akibat re-render dari pengguna publik.
- **Kewajiban Penggunaan Cache**: Gunakan state management caching internal (contoh: `@tanstack/react-query`) untuk semua modul publik yang menarik data dari database. 
- **Durasi Cache (Stale Time)**: Set `staleTime` dengan durasi wajar bertindak sebagai "Waktu Publikasi/Propagasi" (misal: 1 jam atau `1000 * 60 * 60`). Data yang belum kedaluwarsa akan disajikan dari memory (cache browser).
- **Hindari Window Focus Refetch**: Jangan biarkan aplikasi memanggil ulang data database dari perpindahan tab browser. Set `refetchOnWindowFocus: false`.
- **Invalidasi Manual**: Hanya trigger invalidasi atau update cache secara selektif apabila dimutasi langsung oleh akses di device/admin yang sama (misal `queryClient.invalidateQueries`). User umum yang baru membuka site akan otomatis menerima cache state terbaru sesuai waktu siklus.

## 2. Code Splitting & Lazy Component Loading (React Suspense)
Pisahkan muatan antarmuka pengguna, jangan jadikan semuanya dalam satu JavaScript bundle awal yang akan memperlambat Initial Load Time.
- **Modul Publik Dielksekusi Secara Sinkronus**: File landing page utama dan rute halaman depan harus terbuka dengan instan dan menjadi prioritas urutan build/render.
- **Modul Administratif & Dashboard Diload Secara Lazy**: Gunakan `lazy()` dan `Suspense` untuk file yang berada pada wilayah "Back-office" (seperti `/admin`, fitur penyuntingan, dan otentikasi login). Sehingga file besar hanya akan didownload ketika akses tersebut dituju.

## 3. Manajemen Aset Gambar Berbasis Public URL / Eksternal
Jangan menghabiskan kuota internal Storage bandwith transfer maupun kapasitas simpanan proyek yang sangat terbatas dengan binary object.
- **Image Referencing**: File database untuk elemen visual hanya berupa teks `string` yang mengandung URL gambar public langsung dari pihak ketiga (atau CDN gratis lain).

## 4. UI/UX Consistency Compliance
Saat memuat *Suspense fallback* / UI Loading State:
- Berikan loading indicator yang estetik (contoh: indikator lingkaran berputar berbasis Tailwind / `lucide-react` `Loader2`).
- Pertahankan Identitas Desain `AGENTS.md` (hindari background hitam tak selaras atau *color scheme* di luar sistem `--color-primary-*` yang sedang berjalan). 
