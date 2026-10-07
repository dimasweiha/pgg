-- ============================================================
-- patch-005 — Performa iklan harian (fitur baru, permintaan Dimas 7 Okt)
-- Meniru sheet Excel: 1 baris = 1 tanggal, angka operasional iklan
-- diisi MANUAL (bukan turunan tabel leads).
--
-- Kolom:
--   spent          = Spent Meta Ads (Rp)
--   result_dashboard = Result Dashboard
--   real_chat      = Real Chat
--   mql            = MQL (Marketing Qualified Lead)
--   no_respon      = No Respon
--
-- Cost per Result, Cost per Real Chat, MQL Ratio TIDAK disimpan —
-- dihitung di frontend (pembagi 0 → "-").
--
-- Cara pakai: paste & run di Supabase SQL Editor (sekali saja).
-- Aman diulang (idempotent).
-- PRASYARAT: tidak ada (berdiri sendiri).
-- ============================================================

create table if not exists public.iklan_harian (
  id uuid primary key default gen_random_uuid(),
  tanggal date not null unique,
  spent numeric not null default 0,
  result_dashboard integer not null default 0,
  real_chat integer not null default 0,
  mql integer not null default 0,
  no_respon integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.iklan_harian enable row level security;

drop policy if exists "authenticated full access iklan_harian" on public.iklan_harian;
create policy "authenticated full access iklan_harian"
on public.iklan_harian
for all
to authenticated
using (true)
with check (true);

create index if not exists idx_iklan_harian_tanggal on public.iklan_harian (tanggal);
