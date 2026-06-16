# Panduan Penggunaan URL Aset (Gambar/Logo)

## Aturan Hardcode URL Logo
Berdasarkan kendala deployment yang pernah terjadi, logo atau aset statis yang dirender di aplikasi web—terutama yang dirender secara asinkronus (seperti Splash Screen) atau di luar siklus utama React (pada `index.html`)—harus menggunakan **Direct URL** (*hardcoded*) secara langsung, alih-alih mengandalkan file lokal di direktori `public` (seperti `/logo-transparent.png`).

### Alasannya:
- **Build vs Server-Side Asset Generation**: Terkadang di beberapa platform hosting atau lingkungan *serverless* (termasuk Vercel), logika *backend* yang mengunduh file statis secara otomatis ke folder `public` (misalnya di `server.ts`) tidak tereksekusi bersamaan atau selesai sebelum proses *build frontend* Vite diantarkan ke klien.
- Selain itu, folder *public* *filesystem* bisa jadi bersifat *read-only* pada saat *runtime* di lingkungan kontainer *serverless*. 
- Akibatnya, pada saat pengguna membuka website dan *script* mencari path relatif  `/logo-transparent.png`, berkas tersebut belum ada atau tak dapat dimuat (menghasilkan gambar *broken* pada *Splash Screen* / tidak ter-load).

### Praktik Kesepakatan (Best Practice):
Selalu tautkan URL *source* aslinya untuk gambar-gambar kritikal untuk antarmuka.

Misal, untuk Logo KoncoKemo:

**HTML:**
```html
<img src="https://lh3.googleusercontent.com/d/13A59jDQDvXFFvrpe9uvTdlusw3OKGM44" alt="KoncoKemo Logo" />
```

**React / TypeScript:**
```tsx
const logoUrl = "https://lh3.googleusercontent.com/d/13A59jDQDvXFFvrpe9uvTdlusw3OKGM44";
// Atau langsung di src image.
```

Catatan: Panduan ini harus selalu diingat oleh agen saat memanipulasi *resource* antarmuka agar selalu menggunakan URL absolut yang disepakati untuk menjamin konsistensi pada saat di-*deploy* di layanan apa pun.
