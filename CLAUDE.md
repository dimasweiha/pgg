# CLAUDE.md — Grati Garden Leads Dashboard

Context file ini dibaca AI coding agent (Kilo Code / Claude Code) sebagai referensi utama sebelum mengerjakan task apapun di project ini.

## Ringkasan Project

Dashboard internal untuk tracking **leads & sales funnel** Perumahan Grati Garden (perumahan KPR). Dimas berperan sebagai Meta Ads advertiser untuk perumahan ini — WhatsApp yang dipakai saat ini khusus menerima chat dari iklan (leads organik kemungkinan ada tapi kecil, tetap dicatat sebagai salah satu `jenis`).

**Scope dengan tegas TIDAK termasuk** data biaya iklan, CPL, ROAS, atau integrasi apapun ke Meta Ads Manager. Dashboard ini murni mencatat dan menganalisis data leads yang sudah masuk, dari titik chat masuk sampai deal/tidak.

## Siapa Penggunanya

- **Single admin**: Dimas sendiri yang input semua data leads secara manual.
- Setiap leads dicatat termasuk **sales yang handle** leads tersebut (field referensi, bukan multi-user login — sales tidak login ke sistem ini).
- Tidak ada form publik, tidak ada self-registration, tidak ada reCAPTCHA.

## Tujuan Dashboard

1. Menggantikan Google Sheet manual ("DATA CHAT MASUK PERUMAHAN 2026") dengan sistem yang lebih terstruktur dan punya insight otomatis.
2. Melihat funnel: chat masuk → follow-up → deal / no deal / masih proses.
3. Mengidentifikasi leads yang stuck/mangkrak (aging) supaya bisa di-push.
4. Melihat performa tiap sales (volume, % konversi, kecepatan closing).
5. Melihat unit/blok mana yang paling diminati.

## Dokumen Terkait

- `PRD.md` — requirement detail & scope lengkap
- `SCHEMA.md` — struktur database Supabase
- `FEATURES.md` — breakdown fitur per halaman
- `FLOW.md` — alur input & update data

## Tech Stack

- **Framework**: React 18 + Vite (SPA, JavaScript — bukan TypeScript)
- **Routing**: React Router v6 (`createBrowserRouter`, hash mode untuk static hosting)
- **State Global**: Zustand (auth, UI, filter global)
- **Database**: Supabase (PostgreSQL + Auth + Storage + RLS)
- **Styling**: Tailwind CSS (via npm, bukan CDN)
- **Charting**: Recharts
- **PDF**: jsPDF + html2canvas (jika dibutuhkan export laporan)
- **Excel Export**: SheetJS / xlsx
- **Form & Validasi**: React Hook Form + Zod
- **Notifikasi**: React Hot Toast
- **Hosting**: VPS CyberPanel (`npm run build` → upload `dist/` ke `public_html`)

**Tidak dipakai di project ini**: Google reCAPTCHA v3 (tidak ada form publik).

## Konvensi Development

- Bahasa kode: JavaScript (bukan TypeScript), konsisten dengan project lain milik Dimas.
- Auth: Supabase Auth, single admin (kemungkinan tanpa role-based access karena hanya 1 user — konfirmasi lagi saat implementasi auth).
- RLS Supabase tetap diaktifkan meski single-user, sebagai best practice.
- Routing pakai hash mode (`#/`) karena deploy ke static hosting VPS tanpa server-side routing config.
- Ikuti pola dashboard lain milik Dimas: React + Vite + Supabase (bukan Next.js, karena ini bukan situs publik yang butuh SEO).

## Istilah Domain (Penting)

- **Jenis**: asal leads — `organik` atau `iklan`.
- **Blok unit**: kode unit rumah yang diminati leads, format `blok [Huruf][Angka]` misal "blok D7".
- **Status**: `Deal`, `No Deal`, `Proses` (masih dalam follow-up, belum ada keputusan).
- **Lama Proses**: durasi dari chat masuk sampai ada keputusan (Deal/No Deal).
- **Sales yang handle**: nama sales yang menangani leads tersebut (field pencatatan, bukan akun login).
