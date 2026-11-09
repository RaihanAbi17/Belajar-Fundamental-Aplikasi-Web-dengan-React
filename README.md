# Catatan Pribadi — Submission React

Aplikasi submission untuk proyek **Membangun SPA + API, Context, dan Hooks**.

## Fitur
- RESTful API Dicoding Notes API v1.
- Registrasi dan login dengan access token di `localStorage`.
- Route protection: daftar, detail, arsip, tambah, dan hapus catatan hanya bisa diakses setelah login.
- Daftar catatan aktif dan arsip, detail catatan, tambah, arsip/unarsip, dan hapus.
- React Context untuk tema terang/gelap dan bahasa Indonesia/Inggris.
- Preferensi tema dan bahasa persisten di `localStorage`.
- Custom Hook `useInput` untuk menghindari duplikasi controlled input.
- Custom Hook `useNotes` untuk mengambil data catatan.
- Loading indicator dan error state ketika berkomunikasi dengan API.
- React Router untuk SPA dan minimal dua halaman utama.

## Menjalankan
```bash
npm install
npm run dev
```

Buka URL yang diberikan Vite, biasanya `http://localhost:5173`.

## Build
```bash
npm run build
```

## API
Base URL: `https://notes-api.dicoding.dev/v1`
