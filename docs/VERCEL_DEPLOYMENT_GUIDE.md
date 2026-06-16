# Panduan Arsitektur & Deployment API Vercel

## Overview Permasalahan: Error 404 Pada Rute `/api/*`
Saat mendeploy aplikasi Express + Vite ke Vercel (misalnya untuk rute `/api/login`), pengguna dapat menemukan *error* `404 (Not Found)` pada panggilan *fetch* API. Padahal, aplikasi tersebut berfungsi dan berjalan sempurna ketika dites secara lokal atau berjalan di AI Studio.

## Akar Penyebab (Root Cause)
Penyebab utama dari masalah **404 (Not Found)** terletak pada perbedaan arsitektur lingkungan eksekusi antara kontainer Docker/VPS standar dan platform Vercel:

1. **Vercel Berbasis Serverless Functions**: 
   Secara *default*, Vercel beroperasi menggunakan arsitektur *serverless*. Vercel mengharapkan *endpoint backend* diatur melalui *file-based routing* di dalam direktori `api/` (misalnya terdapat `api/login.ts`), yang masing-masing akan dilayani oleh fungsi *serverless* statis.
2. **Karakteristik Long-Running Process (`server.ts`)**: 
   Aplikasi yang diinisiasi dari AI Studio (yang mewajibkan pembuatan `server.ts` Express.js) menggunakan sistem server *long-running*. Proses ini selalu menyala (*listening* port 3000) dan bertugas memeriksa rute secara internal di aplikasi. Platform *serverless* Vercel tidak mengeksekusi perintah inisiasi *server listener* Node konvensional ini tanpa adanya konfigurasi *rewrites*, sehingga setiap *request* yang masuk ke *path* `/api/login` akan gagal ditemukan oleh sistem *routing* bawaan Vercel.

## Solusi & Skema Ke Depannya
Agar logika *backend* yang diimplementasikan melalui pola `server.ts` *Express* tetap dapat berjalan dengan stabil di Vercel:

1. **Membutuhkan `vercel.json` Konfigurasi Rewrite**:
   Jika menggunakan Express dalam 1 *entry-point*, repositori wajib mengonfigurasikan file `vercel.json` dan menyertakan rute *rewrites* untuk menangkap semua *request* ke arah API agar diteruskan (*forwarded*) secara terpusat.
   
   *Contoh:*
   ```json
   {
     "rewrites": [
       { "source": "/api/(.*)", "destination": "/api/index.js" }
     ]
   }
   ```
   (Dengan catatan direktori dan path *entry-point* juga harus diletakkan pada folder yang dikenali Vercel sebagai *function execution root*).

2. **Atau Bermigrasi Pendekatan Serverless**:
   Jika target utama *deployment* selamanya adalah Vercel, arsitektur *backend* dianjurkan dipisah ke fungsi-fungsi independen tunggal di dalam folder `api/` (*Vercel Serverless File-System Routing*), ketimbang menyatukan seluruh konfigurasi API dan Vite Middleware ke dalam satu file besar `server.ts`.

> **Panduan Perilaku Agen**: Agen pengembang tidak boleh memaksakan satu arsitektur tanpa memberikan edukasi akan dampaknya di lingkungan *deployment*. Selalu perhatikan apakah pengguna menargetkan *hosting serverless* atau *container-based* untuk menjamin rute backend terekspos dengan benar.
