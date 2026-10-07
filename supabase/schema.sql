-- ============================================================
-- Grati Garden Leads Dashboard — Schema Database Supabase
-- Sumber: SCHEMA.md (Step 1)
-- Aman dijalankan ulang (idempotent).
-- ============================================================

-- ------------------------------------------------------------
-- 1. Tabel sales — master data nama sales (bukan akun login)
-- ------------------------------------------------------------
create table if not exists public.sales (
  id uuid primary key default gen_random_uuid(),
  nama text not null unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 2. Tabel leads — satu baris = satu leads/chat masuk
-- ------------------------------------------------------------
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  tanggal_masuk date not null,
  nama text not null,
  no_hp text,
  jenis text not null check (jenis in ('organik', 'iklan')),
  sales_id uuid references public.sales (id),
  blok_unit text,
  status text not null default 'proses' check (status in ('proses', 'deal', 'no_deal')),
  tanggal_keputusan date,
  omset numeric,
  catatan text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 3. View v_rekap_sales — agregat performa per sales
-- Catatan deviasi kecil dari SCHEMA.md: pakai count(l.id) untuk
-- total_leads (bukan count(*)) supaya sales tanpa leads terhitung
-- 0, bukan 1 (efek left join pada baris null-extended).
-- ------------------------------------------------------------
create or replace view public.v_rekap_sales as
select
  s.id as sales_id,
  s.nama as sales_nama,
  count(*) filter (where l.jenis = 'organik') as jumlah_organik,
  count(*) filter (where l.jenis = 'iklan') as jumlah_iklan,
  count(*) filter (where l.status = 'deal') as jumlah_deal,
  count(*) filter (where l.status = 'no_deal') as jumlah_no_deal,
  count(*) filter (where l.status = 'proses') as jumlah_proses,
  count(l.id) as total_leads,
  round(
    count(*) filter (where l.status = 'deal')::numeric
    / nullif(count(l.id), 0) * 100, 2
  ) as persen_deal,
  coalesce(sum(l.omset) filter (where l.status = 'deal'), 0) as total_omset
from public.sales s
left join public.leads l on l.sales_id = s.id
group by s.id, s.nama;

-- security_invoker: RLS tabel dasar dievaluasi untuk pemanggil
-- (tanpa ini, anon key bisa membaca view — celah security definer)
alter view public.v_rekap_sales set (security_invoker = on);

-- ------------------------------------------------------------
-- 4. View v_aging_leads — leads "proses" + umur aging (hari)
-- Threshold stuck diterapkan di frontend, bukan di view.
-- ------------------------------------------------------------
create or replace view public.v_aging_leads as
select
  l.*,
  s.nama as sales_nama,
  (current_date - l.tanggal_masuk) as aging_hari
from public.leads l
left join public.sales s on s.id = l.sales_id
where l.status = 'proses'
order by aging_hari desc;

-- security_invoker: lihat catatan di v_rekap_sales
alter view public.v_aging_leads set (security_invoker = on);

-- ------------------------------------------------------------
-- 5. View v_unit_breakdown — ranking blok/unit paling diminati
--    Revisi 6 Okt: agregasi pakai blok_unit_norm (lowercase, tanpa awalan
--    "blok", tanda baca dirapikan) supaya "Blok D7", "d7", "D-7" terhitung
--    satu unit yang sama (keputusan Dimas). Tampilan tetap tulisan asli.
-- ------------------------------------------------------------
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

--    Wajib DROP dulu: CREATE OR REPLACE tidak boleh mengubah daftar kolom
--    view yang sudah ada (kolom baru blok_unit_norm).
drop view if exists public.v_unit_breakdown;

create view public.v_unit_breakdown as
select
  (array_agg(blok_unit order by tanggal_masuk asc))[1] as blok_unit,
  norm_blok(blok_unit) as blok_unit_norm,
  count(*) as jumlah_leads,
  count(*) filter (where status = 'deal') as jumlah_deal
from public.leads
where norm_blok(blok_unit) is not null
group by norm_blok(blok_unit)
order by jumlah_leads desc;

-- security_invoker: lihat catatan di v_rekap_sales
alter view public.v_unit_breakdown set (security_invoker = on);

-- ------------------------------------------------------------
-- 6. RLS — hanya user ter-autentikasi (single admin) yang
--    boleh akses. Aktif meski single-user, best practice.
-- ------------------------------------------------------------
alter table public.leads enable row level security;
alter table public.sales enable row level security;

drop policy if exists "authenticated full access leads" on public.leads;
create policy "authenticated full access leads"
on public.leads
for all
to authenticated
using (true)
with check (true);

drop policy if exists "authenticated full access sales" on public.sales;
create policy "authenticated full access sales"
on public.sales
for all
to authenticated
using (true)
with check (true);

-- ------------------------------------------------------------
-- 7. Trigger updated_at — auto-update kolom updated_at di leads
-- ------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_leads_updated_at on public.leads;
create trigger trg_leads_updated_at
before update on public.leads
for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- 8. Index — kolom yang dipakai filter/sort di dashboard
-- ------------------------------------------------------------
create index if not exists idx_leads_status on public.leads (status);
create index if not exists idx_leads_sales_id on public.leads (sales_id);
create index if not exists idx_leads_tanggal_masuk on public.leads (tanggal_masuk);
create index if not exists idx_leads_jenis on public.leads (jenis);
