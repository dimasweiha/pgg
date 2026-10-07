# PRD — Grati Garden Leads Dashboard

## 1. Latar Belakang

Saat ini tracking leads & sales Perumahan Grati Garden (perumahan KPR) dikerjakan manual di Google Sheet ("DATA CHAT MASUK PERUMAHAN 2026") dengan sheet Setting, Rekap, FU, dan FU Monitoring. Prosesnya berjalan tapi:

- Rekap funnel & % deal dihitung manual pakai formula spreadsheet.
- Tidak ada insight otomatis soal leads yang stuck/mangkrak.
- Tidak ada breakdown unit/blok yang sistematis.
- Sulit di-scale dan rawan human error saat data makin banyak.

Dashboard ini dibangun untuk menggantikan proses tersebut dengan sistem yang lebih terstruktur.

## 2. Tujuan

1. Mencatat setiap leads yang masuk (chat WA iklan, atau organik) secara terstruktur.
2. Melihat funnel leads → follow-up → deal/no deal/proses secara real-time.
3. Melihat performa per sales: volume leads, % konversi, kecepatan closing.
4. Mengidentifikasi leads yang stuck (sudah lama di status "Proses" tanpa keputusan).
5. Melihat unit/blok mana yang paling diminati pasar.
6. Export data (Excel/PDF) untuk kebutuhan laporan.

## 3. Yang Secara Eksplisit DI LUAR Scope

- **Tidak ada** data biaya iklan, CPL, CPA, ROAS, atau integrasi Meta Ads Manager.
- **Tidak ada** form publik untuk leads submit sendiri (no reCAPTCHA, no public lead form).
- **Tidak ada** multi-user login untuk sales — sales hanya dicatat sebagai field referensi, bukan akun aktif.
- Dashboard ini murni leads & sales funnel tracking untuk satu perumahan (Grati Garden), bukan multi-tenant/multi-proyek (untuk sekarang).

## 4. User & Role

| Role | Deskripsi |
|---|---|
| Admin (Dimas) | Satu-satunya pengguna sistem. Input, edit, dan melihat semua data leads. |

Sales **tidak** login ke sistem — nama sales hanya dicatat sebagai atribut pada tiap leads (siapa yang menghandle).

## 5. Fitur Utama

### 5.1 Dashboard / Rekap
- Ringkasan funnel keseluruhan: total leads, Deal, No Deal, Proses.
- % deal keseluruhan dan per sales.
- Breakdown jenis leads: Organik vs Iklan.
- Chart tren leads masuk per periode (mingguan/bulanan) — Recharts.
- Leaderboard sales: volume leads ditangani, jumlah deal, % konversi.

### 5.2 Leads List (CRUD)
- Tabel semua leads dengan kolom: tanggal, nama, no. HP, jenis, sales yang handle, blok unit diminati, status, lama proses, omset (jika deal), tanggal dealing.
- Tambah/edit/hapus leads.
- Filter: by sales, by status, by jenis, by rentang tanggal.
- Search by nama atau no. HP.

### 5.3 Aging / Stuck Leads
- Highlight leads dengan status "Proses" yang sudah melewati threshold tertentu (misal >7 hari, >14 hari) tanpa update status.
- Threshold idealnya configurable (lihat `SCHEMA.md` / `FEATURES.md`).

### 5.4 Unit / Blok Breakdown
- Ranking blok/unit yang paling sering diminati (berdasarkan field blok unit di tiap leads).
- Berguna untuk insight preferensi pasar (posisi, tipe unit, dst).

### 5.5 Export
- Export tabel leads ke Excel (SheetJS/xlsx).
- Export rekap/laporan ke PDF (jsPDF + html2canvas) jika dibutuhkan untuk laporan ke pihak lain (misal pengembang perumahan).

## 6. Alur Data Singkat

1. Chat masuk dari leads (WA, sumber iklan atau organik).
2. Dimas input leads baru ke sistem: nama, no HP, jenis, sales yang akan handle, blok unit yang diminati (jika sudah ada).
3. Status awal: "Proses".
4. Sales follow-up di luar sistem (WA langsung).
5. Dimas update status leads: "Deal" (isi omset & tanggal dealing) atau "No Deal".
6. Dashboard otomatis merefleksikan perubahan ke funnel, rekap, dan insight aging.

Detail lengkap di `FLOW.md`.

## 7. Referensi Dokumen Lain

- `CLAUDE.md` — context & tech stack
- `SCHEMA.md` — struktur database
- `FEATURES.md` — breakdown fitur per halaman secara teknis
- `FLOW.md` — alur input & update data secara detail
