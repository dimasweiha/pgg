-- ============================================================
-- patch-003 — Master data campaign iklan (fitur campaign, Step 1)
-- Tabel `campaigns` untuk menyimpan daftar nama campaign.
-- Step 2 (nanti): kolom leads.campaign_id + dropdown di form leads.
--
-- Cara pakai: paste & run di Supabase SQL Editor (sekali saja).
-- Aman diulang (idempotent). Tidak mengubah tabel leads.
-- ============================================================

-- 1. Tabel campaigns — pola sama dengan sales
create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  nama text not null unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- 2. RLS — sama seperti sales/leads: hanya user ter-autentikasi
alter table public.campaigns enable row level security;

drop policy if exists "authenticated full access campaigns" on public.campaigns;
create policy "authenticated full access campaigns"
on public.campaigns
for all
to authenticated
using (true)
with check (true);
