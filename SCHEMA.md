# SCHEMA.md — Grati Garden Leads Dashboard

Struktur database Supabase (PostgreSQL). Semua tabel pakai `uuid` sebagai primary key dan RLS aktif meski single-user, sebagai best practice.

## 1. Tabel `sales`

Master data nama sales yang menghandle leads. Bukan akun login — murni data referensi.

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | `uuid` (PK, default `gen_random_uuid()`) | |
| `nama` | `text` (not null, unique) | Nama sales, misal "ICA", "MAMI" |
| `is_active` | `boolean` (default `true`) | Soft-flag, bukan delete, biar histori leads lama tetap valid |
| `created_at` | `timestamptz` (default `now()`) | |

## 2. Tabel `leads`

Tabel utama — satu baris = satu leads/chat masuk.

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | `uuid` (PK, default `gen_random_uuid()`) | |
| `tanggal_masuk` | `date` (not null) | Tanggal chat pertama masuk |
| `nama` | `text` (not null) | Nama leads |
| `no_hp` | `text` | No. HP/WA leads |
| `jenis` | `text` (not null, check in `('organik','iklan')`) | Asal leads |
| `sales_id` | `uuid` (FK → `sales.id`, nullable) | Sales yang handle |
| `blok_unit` | `text` (nullable) | Format bebas, misal "blok D7" — diisi kalau leads sudah tertarik unit spesifik |
| `status` | `text` (not null, default `'proses'`, check in `('proses','deal','no_deal')`) | |
| `tanggal_keputusan` | `date` (nullable) | Tanggal status berubah jadi deal/no_deal — dipakai hitung lama_proses |
| `omset` | `numeric` (nullable) | Diisi kalau status = deal |
| `catatan` | `text` (nullable) | Catatan bebas (alasan no deal, dll) |
| `created_at` | `timestamptz` (default `now()`) | |
| `updated_at` | `timestamptz` (default `now()`, auto-update via trigger) | |

**Catatan field turunan (bukan kolom fisik, dihitung di query/view):**
- `lama_proses` = `tanggal_keputusan - tanggal_masuk` (hari), hanya relevan kalau status bukan `proses`.
- `aging_hari` = `current_date - tanggal_masuk` (hari), untuk leads yang masih `proses` — dipakai di fitur Aging Leads.

## 3. View `v_rekap_sales`

View agregat untuk halaman Dashboard/Rekap, meniru sheet "Rekap" tapi otomatis terhitung.

```sql
create view v_rekap_sales as
select
  s.id as sales_id,
  s.nama as sales_nama,
  count(*) filter (where l.jenis = 'organik') as jumlah_organik,
  count(*) filter (where l.jenis = 'iklan') as jumlah_iklan,
  count(*) filter (where l.status = 'deal') as jumlah_deal,
  count(*) filter (where l.status = 'no_deal') as jumlah_no_deal,
  count(*) filter (where l.status = 'proses') as jumlah_proses,
  count(*) as total_leads,
  round(
    count(*) filter (where l.status = 'deal')::numeric
    / nullif(count(*), 0) * 100, 2
  ) as persen_deal,
  coalesce(sum(l.omset) filter (where l.status = 'deal'), 0) as total_omset
from sales s
left join leads l on l.sales_id = s.id
group by s.id, s.nama;
```

## 4. View `v_aging_leads`

Leads dengan status "proses" yang sudah lama tidak ada keputusan — dasar fitur Aging/Stuck Leads.

```sql
create view v_aging_leads as
select
  l.*,
  s.nama as sales_nama,
  (current_date - l.tanggal_masuk) as aging_hari
from leads l
left join sales s on s.id = l.sales_id
where l.status = 'proses'
order by aging_hari desc;
```

Threshold "stuck" (misal >7 hari, >14 hari) diterapkan di layer frontend sebagai filter/highlight, bukan hardcoded di view — supaya fleksibel diubah tanpa migrasi database.

## 5. View `v_unit_breakdown`

Ranking blok/unit paling diminati — dasar fitur Unit Breakdown.

Revisi 6 Okt: agregasi pakai **`blok_unit_norm`** (fungsi `norm_blok`: lowercase, buang awalan "blok"/"blk", tanda baca `._-:/\` jadi spasi) supaya penulisan berbeda terhitung satu unit — "Blok D7", "d7", "D-7" → `d7`. Kolom `blok_unit` menampilkan tulisan asli user (entri pertama berdasar tanggal masuk).

```sql
create or replace function public.norm_blok(nilai text)
returns text
language sql
immutable
as $$
  select nullif(
    regexp_replace(
      regexp_replace(
        lower(trim(coalesce(nilai, ''))),
        '^(blok|blk)[\s._\-:]+', ''
      ),
      '[._\-:/\\]+', ' ', 'g'
    ),
    ''
  );
$$;

-- CREATE OR REPLACE tidak bisa menambah kolom view baru — drop dulu
drop view if exists v_unit_breakdown;

create view v_unit_breakdown as
select
  (array_agg(blok_unit order by tanggal_masuk asc))[1] as blok_unit,
  norm_blok(blok_unit) as blok_unit_norm,
  count(*) as jumlah_leads,
  count(*) filter (where status = 'deal') as jumlah_deal
from leads
where norm_blok(blok_unit) is not null
group by norm_blok(blok_unit)
order by jumlah_leads desc;
```

## 6. RLS Policy

Karena single-admin, policy cukup sederhana: hanya user ter-autentikasi (role `authenticated`) yang boleh akses, tanpa pembedaan role lebih lanjut.

```sql
alter table leads enable row level security;
alter table sales enable row level security;

create policy "authenticated full access leads"
on leads for all
to authenticated
using (true)
with check (true);

create policy "authenticated full access sales"
on sales for all
to authenticated
using (true)
with check (true);
```

## 7. Trigger `updated_at`

```sql
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_leads_updated_at
before update on leads
for each row execute function set_updated_at();
```

## 8. Indexing

```sql
create index idx_leads_status on leads(status);
create index idx_leads_sales_id on leads(sales_id);
create index idx_leads_tanggal_masuk on leads(tanggal_masuk);
create index idx_leads_jenis on leads(jenis);
```
