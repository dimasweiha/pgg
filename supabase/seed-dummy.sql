-- ============================================================
-- Grati Garden Leads Dashboard — Data Dummy (Testing)
-- Sumber: STEPS.md Step 1 — "Input 2-3 data dummy manual di
-- Supabase Table Editor untuk testing"
--
-- Dijalankan SETELAH supabase/schema.sql.
-- Aman dijalankan ulang (idempotent): dummy di-hapus dulu
-- berdasarkan no_hp yang unik, lalu insert ulang.
-- ============================================================

-- Bersihkan data dummy lama (kalau pernah dijalankan sebelumnya)
delete from public.leads where catatan like 'dummy-step1%';
delete from public.sales where nama in ('ICA', 'MAMI');

-- ------------------------------------------------------------
-- Sales dummy
-- ------------------------------------------------------------
insert into public.sales (nama) values
  ('ICA'),
  ('MAMI');

-- ------------------------------------------------------------
-- Leads dummy (3 baris, catatan ber-tag 'dummy-step1' agar
-- mudah dibersihkan nanti). Tanggal pakai now() relative agar
-- aging selalu relevan saat dijalankan.
-- ------------------------------------------------------------
insert into public.leads (
  tanggal_masuk, nama, no_hp, jenis, sales_id, blok_unit,
  status, tanggal_keputusan, omset, catatan
)
values
  -- Leads lama masih proses → aging ~12 hari (harus muncul di v_aging_leads)
  (
    current_date - 12, 'Budi Dummy', '08111111111', 'iklan',
    (select id from public.sales where nama = 'ICA'), 'blok D7',
    'proses', null, null, 'dummy-step1: masih ditawari unit lain'
  ),
  -- Leads deal cepat → lama_proses 3 hari, ada omset
  (
    current_date - 10, 'Sari Dummy', '08222222222', 'organik',
    (select id from public.sales where nama = 'ICA'), 'blok A2',
    'deal', current_date - 7, 350000000, 'dummy-step1: DP lunas'
  ),
  -- Leads no_deal → ada tanggal keputusan + catatan alasan
  (
    current_date - 15, 'Rudi Dummy', '08333333333', 'iklan',
    (select id from public.sales where nama = 'MAMI'), 'blok C3',
    'no_deal', current_date - 4, null, 'dummy-step1: menolak, budget kurang'
  );
