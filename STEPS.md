# STEPS.md — Checklist Eksekusi Bertahap

Aturan main: kerjakan satu step sampai selesai & teruji sebelum lanjut ke step berikutnya. Jangan minta AI agent mengerjakan beberapa step sekaligus dalam satu prompt.

Setiap kali membuat komponen UI baru di step manapun, wajib mengikuti `DESIGN.md` (warna, border, rounded, spacing, tipografi) — jangan improvisasi style baru.

Setiap step ditandai `[ ]` belum dikerjakan, `[x]` selesai. Update file ini setiap step selesai supaya AI agent (atau kamu sendiri) tahu progress saat membuka project lagi.

---

## Step 0 — Setup Project

- [x] Init project Vite + React 18 (JavaScript)
- [x] Install dependencies: react-router-dom, zustand, @supabase/supabase-js, tailwindcss, recharts, jspdf, html2canvas, xlsx, react-hook-form, zod, @hookform/resolvers, react-hot-toast
- [x] Setup Tailwind (config + import di `index.css`)
- [x] Extend `tailwind.config.js` dengan color token dari `DESIGN.md` (charcoal, bg-base, surface, border-default, text-primary, text-secondary)
- [x] Buat struktur folder dasar: `src/pages`, `src/components`, `src/lib`, `src/store`
- [x] Setup `.env` untuk Supabase URL & anon key
- [x] Buat Supabase client di `src/lib/supabase.js`

**Selesai kalau**: `npm run dev` jalan, Tailwind kedetect (coba styling sederhana), koneksi ke Supabase berhasil (test query sederhana).

---

## Step 1 — Database Supabase

- [x] Jalankan SQL dari `SCHEMA.md`: tabel `sales`, tabel `leads`
- [x] Jalankan SQL view: `v_rekap_sales`, `v_aging_leads`, `v_unit_breakdown`
- [x] Jalankan RLS policy
- [x] Jalankan trigger `updated_at`
- [x] Jalankan index
- [x] Input 2-3 data dummy manual di Supabase Table Editor untuk testing

**Selesai kalau**: semua tabel & view ada di Supabase, bisa di-query dari SQL editor, RLS tidak block akses dari authenticated user.

---

## Step 2 — Auth & Login

- [x] Buat halaman Login (`#/login`) — form email/password, React Hook Form + Zod
- [x] Setup Zustand auth store (simpan session user)
- [x] Buat Protected Route wrapper (redirect ke `#/login` kalau belum login)
- [x] Buat tombol logout
- [x] Buat 1 user admin manual di Supabase Auth (Dimas)

**Selesai kalau**: bisa login dengan akun admin, halaman lain terproteksi, logout berfungsi.

---

## Step 3 — Leads List (CRUD) — Fitur Inti

- [x] Buat halaman `#/leads` dengan tabel leads (ambil data dari tabel `leads` join `sales`)
- [x] Buat form "Tambah Leads" (modal/halaman) sesuai field di `FEATURES.md`
- [x] Buat form "Edit Leads" termasuk logic update status (deal/no_deal wajib isi tanggal keputusan, deal wajib isi omset)
- [x] Buat konfirmasi hapus leads
- [x] Buat komponen `StatusBadge`
- [x] Buat filter & search bar (nama/no HP, sales, status, jenis, rentang tanggal)
- [x] Toast notification untuk tiap aksi (tambah/edit/hapus)

**Selesai kalau**: Dimas bisa input, edit, hapus, filter, dan search leads sepenuhnya dari UI — ini pengganti utama Google Sheet, jadi harus benar-benar solid sebelum lanjut.

---

## Step 4 — Dashboard / Rekap

- [x] Buat halaman `#/` dengan summary cards (total leads, deal, no deal, proses, % deal)
- [x] Chart tren leads masuk (Recharts) per minggu/bulan
- [x] Chart breakdown jenis (organik vs iklan)
- [x] Tabel leaderboard sales dari view `v_rekap_sales`
- [x] Filter rentang tanggal global untuk halaman ini

**Selesai kalau**: angka-angka di dashboard match dengan data aktual di Leads List (cross-check manual beberapa kali).

---

## Step 5 — Aging / Stuck Leads

- [x] Buat halaman `#/leads/aging` dari view `v_aging_leads`
- [x] Threshold selector (default 7 hari)
- [x] Highlight warna berdasarkan level aging
- [x] Quick action ke form edit leads

**Selesai kalau**: leads yang sengaja dibuat dengan tanggal masuk lama (data dummy) muncul dengan benar sesuai threshold.

---

## Step 6 — Unit Breakdown

- [x] Buat halaman `#/units` dari view `v_unit_breakdown`
- [x] Chart ranking unit paling diminati (horizontal bar)
- [x] Tabel detail per unit

**Selesai kalau**: ranking unit sesuai dengan data leads yang ada.

---

## Step 7 — Export Excel

- [x] Tombol export di Leads List (SheetJS/xlsx)
- [x] Export menghormati filter yang sedang aktif di tabel

**Selesai kalau**: file Excel yang di-download sesuai dengan data yang sedang ditampilkan/difilter.

---

## Step 8 — Polish & Deploy

- [ ] Review responsiveness (minimal layak dibuka di laptop, tidak wajib mobile-first)
- [ ] `npm run build`
- [ ] Upload `dist/` ke CyberPanel VPS `public_html`
- [ ] Test semua fitur di environment production

---

## Backlog / Belum Diprioritaskan

Hal-hal yang didiskusikan tapi sengaja ditunda sampai ada kebutuhan nyata:

- Export PDF (jsPDF + html2canvas) — baru dikerjakan kalau benar-benar dibutuhkan untuk laporan ke pihak lain
- Drill-down klik unit → list leads terkait (Unit Breakdown v2)

**Catatan**: Data dimulai dari 0 di sistem baru. Google Sheet lama ("DATA CHAT MASUK PERUMAHAN 2026") tidak dimigrasikan — cukup jadi arsip/referensi historis, tidak terhubung ke sistem baru.
