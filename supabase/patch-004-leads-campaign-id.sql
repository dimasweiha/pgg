-- ============================================================
-- patch-004 — Campaign di leads (fitur campaign, Step 2)
-- Menambah kolom leads.campaign_id → campaigns (nullable).
--
-- Cara pakai: paste & run di Supabase SQL Editor (sekali saja).
-- Aman diulang (idempotent). Data leads lama tetap aman
-- (campaign_id = null → "-").
--
-- PRASYARAT: patch-003-campaigns.sql sudah dijalankan.
-- ============================================================

-- 1. Kolom campaign_id (nullable — organik/tanpa campaign = null)
alter table public.leads
  add column if not exists campaign_id uuid references public.campaigns (id);

-- 2. Index untuk filter by campaign di dashboard
create index if not exists idx_leads_campaign_id on public.leads (campaign_id);
