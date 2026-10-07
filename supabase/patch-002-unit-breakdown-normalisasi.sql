-- ============================================================
-- patch-002 — Unit Breakdown: normalisasi blok unit
-- Keputusan Dimas 6 Okt: "Blok D7", "d7", "D-7" harus terhitung
-- SATU unit yang sama di v_unit_breakdown.
--
-- Cara pakai: paste & run di Supabase SQL Editor (sekali saja).
-- Aman diulang (idempotent). Tidak mengubah data leads.
-- ============================================================

-- 1. Fungsi normalisasi: lowercase, buang awalan "blok"/"blk",
--    tanda baca umum (. _ - : / \) dianggap pemisah → spasi.
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

-- 2. View: agregasi pakai hasil normalisasi; tampilan tetap tulisan
--    asli user (entri pertama berdasarkan tanggal masuk).
--    Wajib DROP dulu: CREATE OR REPLACE tidak boleh mengubah daftar
--    kolom view yang sudah ada (kolom baru blok_unit_norm).
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

alter view public.v_unit_breakdown set (security_invoker = on);
