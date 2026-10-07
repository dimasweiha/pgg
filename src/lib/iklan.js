import { supabase } from './supabase'

/**
 * Lib data iklan harian — angka operasional iklan per tanggal
 * (spent, result dashboard, real chat, MQL, no respon).
 * Mirip sheet Excel Dimas; input manual via halaman Performa Iklan.
 * Rasio/cost dihitung di frontend (pembagi 0 → null → tampil "-").
 */

const SELECT_KOLOM = 'tanggal, spent, result_dashboard, real_chat, mql, no_respon'

/** Semua baris dalam rentang tanggal (inklusif), urut tanggal naik */
export async function fetchIklanHarian(tanggalAwal, tanggalAkhir) {
  const { data, error } = await supabase
    .from('iklan_harian')
    .select(SELECT_KOLOM)
    .gte('tanggal', tanggalAwal)
    .lte('tanggal', tanggalAkhir)
    .order('tanggal', { ascending: true })
  if (error) throw new Error(error.message)
  return data
}

/**
 * Simpan (insert atau update) angka untuk satu tanggal.
 * Konflik unique(tanggal) → update (upsert).
 */
export async function upsertIklanHarian(row) {
  const { error } = await supabase
    .from('iklan_harian')
    .upsert(row, { onConflict: 'tanggal' })
  if (error) throw new Error(error.message)
}

/** Hapus data satu tanggal (mis. salah isi, mau reset) */
export async function deleteIklanHarian(tanggal) {
  const { error } = await supabase.from('iklan_harian').delete().eq('tanggal', tanggal)
  if (error) throw new Error(error.message)
}

/* ---------- Perhitungan turunan (frontend) ---------- */

/** Cost per result = spent / result. null → tampil "-" */
export function costPerResult(spent, result) {
  if (!result) return null
  return spent / result
}

/** Cost per real chat = spent / real_chat */
export function costPerChat(spent, realChat) {
  if (!realChat) return null
  return spent / realChat
}

/** MQL ratio = mql / real_chat × 100 (persen) */
export function mqlRatio(mql, realChat) {
  if (!realChat) return null
  return (mql / realChat) * 100
}

/** Format rupiah tanpa desimal; null → "-" */
export function formatRupiahSingkat(nilai) {
  if (nilai === null || nilai === undefined) return '-'
  return `Rp ${Math.round(nilai).toLocaleString('id-ID')}`
}
