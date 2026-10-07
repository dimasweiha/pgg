-- ============================================================
-- Patch 001 — security_invoker pada view
--
-- Masalah: view Postgres default berjalan dengan hak pemilik
-- view (security definer), sehingga RLS tabel underlying tidak
-- dievaluasi untuk caller — anon key BISA membaca data lewat
-- view (terverifikasi: v_rekap_sales dkk return data ke anon).
--
-- Solusi (best practice Supabase): set security_invoker = on
-- supaya view dievaluasi dengan hak pemanggil → RLS leads/sales
-- berlaku: anon diblokir, authenticated (admin) tetap full akses.
--
-- Referensi: supabase.com/docs/guides/database/postgres/views
-- ============================================================

alter view public.v_rekap_sales set (security_invoker = on);
alter view public.v_aging_leads set (security_invoker = on);
alter view public.v_unit_breakdown set (security_invoker = on);
