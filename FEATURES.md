# FEATURES.md — Grati Garden Leads Dashboard

Breakdown fitur per halaman, untuk jadi acuan implementasi komponen & routing.

## Routing (hash mode)

| Path | Halaman |
|---|---|
| `#/` | Dashboard / Rekap |
| `#/leads` | Leads List |
| `#/leads/aging` | Aging / Stuck Leads |
| `#/units` | Unit Breakdown |
| `#/login` | Login (Supabase Auth) |

---

## 1. Dashboard / Rekap (`#/`)

**Tujuan**: snapshot cepat kondisi funnel keseluruhan, meniru sheet "Rekap" tapi otomatis.

**Komponen**:
- **Summary cards**: Total Leads, Total Deal, Total No Deal, Total Proses, % Deal keseluruhan.
- **Chart tren leads masuk** (Recharts, line/bar chart) — per minggu atau per bulan, dengan filter rentang tanggal.
- **Chart breakdown jenis**: Organik vs Iklan (pie/bar).
- **Tabel leaderboard sales** (dari `v_rekap_sales`): nama sales, jumlah organik, jumlah iklan, deal, no deal, proses, % deal, total omset — sortable per kolom.
- **Filter global**: rentang tanggal (default: bulan berjalan), disimpan di Zustand store supaya konsisten lintas halaman kalau dibutuhkan.

**Data source**: view `v_rekap_sales`, agregat tambahan untuk chart tren (query langsung ke `leads` dengan group by tanggal).

---

## 2. Leads List (`#/leads`)

**Tujuan**: CRUD utama — tempat Dimas input dan update data leads sehari-hari.

**Komponen**:
- **Tabel leads** dengan kolom: Tanggal Masuk, Nama, No. HP, Jenis, Sales, Blok Unit, Status (badge warna: proses=kuning, deal=hijau, no_deal=merah), Lama Proses/Aging, Omset.
- **Form tambah leads** (modal atau halaman terpisah) — React Hook Form + Zod validation:
  - Nama (required)
  - No. HP (required, validasi format nomor)
  - Jenis: radio/select `organik` / `iklan` (required)
  - Sales: dropdown dari tabel `sales` (nullable, bisa "belum ditentukan")
  - Blok Unit: text input bebas (nullable)
  - Tanggal Masuk: date picker (default hari ini)
- **Form edit leads** — sama seperti tambah, plus field khusus update status:
  - Status: select `proses` / `deal` / `no_deal`
  - Kalau status diubah ke `deal` atau `no_deal` → wajib isi Tanggal Keputusan (auto-fill hari ini, bisa diubah), dan kalau `deal` → wajib isi Omset
  - Catatan (opsional)
- **Konfirmasi hapus leads** (dialog konfirmasi sebelum delete).
- **Filter & search bar**:
  - Search by nama / no HP
  - Filter by sales (multi-select)
  - Filter by status
  - Filter by jenis
  - Filter by rentang tanggal masuk
- **Export button**: export hasil tabel (sesuai filter aktif) ke Excel via SheetJS.
- **Toast notification** (React Hot Toast) untuk feedback tambah/edit/hapus sukses atau gagal.

**Data source**: tabel `leads` join `sales`, dengan query filter dinamis.

---

## 3. Aging / Stuck Leads (`#/leads/aging`)

**Tujuan**: highlight leads yang perlu di-push karena sudah lama tidak ada keputusan.

**Komponen**:
- **Threshold selector**: dropdown/toggle (misal >3 hari, >7 hari, >14 hari) — default 7 hari, disimpan di Zustand atau local state.
- **Tabel leads stuck**: nama, no HP, sales, blok unit, tanggal masuk, jumlah hari aging — diurutkan dari paling lama.
- **Highlight visual**: warna merah/oranye untuk aging yang makin ekstrem (misal >14 hari merah, 7–14 hari kuning).
- **Quick action**: tombol langsung ke form edit leads tersebut untuk update status cepat.

**Data source**: view `v_aging_leads`, difilter di frontend sesuai threshold yang dipilih.

---

## 4. Unit Breakdown (`#/units`)

**Tujuan**: insight blok/unit mana yang paling diminati pasar.

**Komponen**:
- **Chart ranking** (bar chart horizontal, Recharts): blok unit vs jumlah leads yang tertarik.
- **Tabel detail**: blok unit, jumlah leads tertarik, jumlah yang deal, % deal per unit.
- **Klik satu blok** → tampilkan list leads yang tertarik ke blok itu (drill-down, opsional untuk v1).

**Data source**: view `v_unit_breakdown`.

---

## 5. Login (`#/login`)

**Tujuan**: autentikasi single-admin via Supabase Auth (email/password).

**Komponen**:
- Form login sederhana (email + password), React Hook Form + Zod.
- Redirect ke `#/` setelah login sukses.
- Protected route wrapper — semua halaman lain redirect ke `#/login` kalau belum autentikasi (dicek via Zustand auth store + Supabase session).

---

## Komponen Shared

- **Layout**: sidebar/navbar navigasi antar halaman, header dengan info user & tombol logout.
- **StatusBadge**: komponen badge warna untuk status (proses/deal/no_deal) — dipakai di Leads List & Aging Leads.
- **DateRangeFilter**: komponen filter rentang tanggal reusable — dipakai di Dashboard & Leads List.
- **ExportButton**: komponen generik export ke Excel, reusable untuk Leads List (dan Unit Breakdown kalau dibutuhkan nanti).

## Prioritas Implementasi (Saran Urutan)

1. Setup project + Supabase (auth, schema, RLS) + Login
2. Leads List (CRUD) — ini jantung sistem, menggantikan input manual sheet
3. Dashboard / Rekap — begitu ada data, langsung terasa manfaatnya
4. Aging / Stuck Leads
5. Unit Breakdown
6. Export Excel (bisa menyusul setelah Leads List jalan)
