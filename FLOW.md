# FLOW.md — Grati Garden Leads Dashboard

Alur kerja end-to-end: dari chat masuk sampai data tercermin di dashboard.

## 1. Alur Utama: Leads Baru

```
Chat masuk via WA (iklan/organik)
        │
        ▼
Dimas buka Leads List → "Tambah Leads"
        │
        ▼
Isi form: nama, no HP, jenis (organik/iklan),
tanggal masuk, sales yang akan handle (opsional saat ini),
blok unit (opsional, kalau sudah tertarik unit tertentu)
        │
        ▼
Simpan → status default "Proses"
        │
        ▼
Leads muncul di Leads List & ikut terhitung di Dashboard/Rekap
```

**Catatan**: Sales tidak perlu login atau input apapun — assignment sales dilakukan oleh Dimas saat input/edit leads.

## 2. Alur Follow-up & Update Status

```
Sales follow-up leads di luar sistem (WA langsung, bukan via dashboard)
        │
        ▼
Dimas dapat info perkembangan dari sales (manual, misal lewat WA/lisan)
        │
        ▼
Dimas buka leads terkait di Leads List → Edit
        │
        ▼
Update status:
  ├── Tetap "Proses"   → tidak ada perubahan lain
  ├── Jadi "Deal"       → wajib isi Tanggal Keputusan + Omset
  └── Jadi "No Deal"    → wajib isi Tanggal Keputusan, Catatan opsional (alasan)
        │
        ▼
Simpan → lama_proses otomatis terhitung (tanggal_keputusan - tanggal_masuk)
        │
        ▼
Dashboard/Rekap, Aging Leads, dan Unit Breakdown otomatis ter-update
```

## 3. Alur Monitoring Aging Leads

```
Dimas buka halaman Aging Leads secara berkala (misal tiap pagi/mingguan)
        │
        ▼
Lihat leads dengan status "Proses" yang sudah melewati threshold
(default 7 hari, bisa diubah di halaman tersebut)
        │
        ▼
Pilih salah satu leads yang stuck → Quick action ke form edit
        │
        ▼
Dua kemungkinan:
  ├── Follow-up ulang ke sales/leads dulu (di luar sistem) → belum update status
  └── Sudah dapat kejelasan → update status jadi Deal/No Deal
```

## 4. Alur Review Performa Sales

```
Dimas buka Dashboard / Rekap
        │
        ▼
Lihat leaderboard sales: volume leads, % deal, total omset
        │
        ▼
Dipakai untuk evaluasi internal (bukan fitur otomatis apapun,
murni insight untuk keputusan Dimas — misal realokasi leads,
evaluasi kecepatan closing sales tertentu)
```

## 5. Alur Export Laporan

```
Dimas butuh laporan (misal untuk pihak pengembang perumahan, atau arsip)
        │
        ▼
Buka Leads List → set filter sesuai kebutuhan (rentang tanggal, status, dll)
        │
        ▼
Klik "Export ke Excel" → file .xlsx ter-download, sesuai hasil filter aktif
```

## 6. Yang TIDAK Ada di Alur (Penegasan Scope)

- Tidak ada webhook/integrasi otomatis dari WhatsApp ke sistem — semua input manual oleh Dimas.
- Tidak ada notifikasi otomatis ke sales (sales tidak punya akses ke sistem).
- Tidak ada approval workflow — Dimas sebagai single admin punya akses penuh, langsung efektif begitu disimpan.
- Tidak ada sinkronisasi dua arah dengan Google Sheet lama — sheet lama hanya referensi awal, bukan sumber data live.

## 7. Data Lama (Tidak Dimigrasikan)

Google Sheet "DATA CHAT MASUK PERUMAHAN 2026" **tidak dipindahkan** ke sistem baru. Sistem baru dimulai dari data kosong (0 leads) — sheet lama tetap ada sebagai arsip/referensi historis saja, tidak ada import otomatis maupun manual ke database baru.
