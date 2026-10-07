import { supabase } from './supabase'

/**
 * Lib akses data leads — semua query Supabase terkait leads
 * terpusat di sini supaya halaman tinggal konsumsi.
 */

const LEADS_SELECT = `
  id, tanggal_masuk, nama, no_hp, jenis, blok_unit, status,
  tanggal_keputusan, omset, catatan, created_at, updated_at,
  sales:sales_id (id, nama)
`

/** Ambil semua sales aktif untuk dropdown */
export async function fetchSales() {
  const { data, error } = await supabase
    .from('sales')
    .select('id, nama, is_active')
    .order('nama', { ascending: true })
  if (error) throw new Error(error.message)
  return data
}

/**
 * Fetch leads + filter dinamis.
 * @param {Object} filters - { search, salesIds, statusList, jenisList, dateFrom, dateTo }
 *   - salesIds/statusList/jenisList: array nilai (multi-pilih, kosong = tanpa filter)
 * @returns {Promise<Array>} leads dengan nested sales
 */
export async function fetchLeads(filters = {}) {
  let query = supabase.from('leads').select(LEADS_SELECT).order('tanggal_masuk', { ascending: false })

  if (filters.search) {
    // PostgREST: koma = OR antar kolom, tapi ilike tidak bisa di-select bertingkat;
    // pakai or() dengan pattern di nama & no_hp
    const term = filters.search.replace(/[,()]/g, '').trim()
    if (term) {
      query = query.or(`nama.ilike.%${term}%,no_hp.ilike.%${term}%`)
    }
  }
  if (filters.salesIds?.length) query = query.in('sales_id', filters.salesIds)
  if (filters.statusList?.length) query = query.in('status', filters.statusList)
  if (filters.jenisList?.length) query = query.in('jenis', filters.jenisList)
  if (filters.dateFrom) query = query.gte('tanggal_masuk', filters.dateFrom)
  if (filters.dateTo) query = query.lte('tanggal_masuk', filters.dateTo)

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data
}

/** Insert leads baru. Return data leads yang baru dibuat. */
export async function createLead(payload) {
  const { data, error } = await supabase.from('leads').insert(payload).select(LEADS_SELECT).single()
  if (error) throw new Error(error.message)
  return data
}

/** Update leads. Return data leads terbaru. */
export async function updateLead(id, payload) {
  const { data, error } = await supabase
    .from('leads')
    .update(payload)
    .eq('id', id)
    .select(LEADS_SELECT)
    .single()
  if (error) throw new Error(error.message)
  return data
}

/** Hapus leads */
export async function deleteLead(id) {
  const { error } = await supabase.from('leads').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

/** Format tanggal ISO (yyyy-mm-dd) → "12 Sep 2026" */
export function formatTanggal(iso) {
  if (!iso) return '-'
  const d = new Date(`${iso}T00:00:00`)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

/** Format angka → "Rp 350.000.000" */
export function formatRupiah(num) {
  if (num === null || num === undefined || num === '') return '-'
  const n = Number(num)
  if (Number.isNaN(n)) return '-'
  return `Rp ${n.toLocaleString('id-ID')}`
}

/** Selisih hari antara 2 tanggal ISO (a - b) */
export function selisihHari(a, b) {
  if (!a || !b) return null
  const da = new Date(`${a}T00:00:00`)
  const db = new Date(`${b}T00:00:00`)
  if (Number.isNaN(da.getTime()) || Number.isNaN(db.getTime())) return null
  return Math.round((da - db) / 86400000)
}

/** Tanggal hari ini dalam format yyyy-mm-dd (local) */
export function hariIni() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/**
 * Normalisasi blok/unit agar tidak ada duplikat di Unit Breakdown akibat
 * beda penulisan (keputusan Dimas 6 Okt): lowercase, hapus spasi/tanda baca,
 * satukan awalan "blok"/"blk". "Blok D7", "d7", "D-7", "blok d7" → "d7".
 * Disimpan apa adanya (tampilan tetap tulisan user); normalisasi dipakai
 * sebagai kunci agregasi di view v_unit_breakdown.
 */
export function normalisasiBlok(nilai) {
  if (!nilai) return null
  let s = String(nilai).trim().toLowerCase()
  // Buang awalan "blok"/"blk" + pemisah sesudahnya
  s = s.replace(/^(blok|blk)[\s._\-:]+/, '')
  // Sisa spasi/tanda baca dianggap pemisah → dihapus ("c-2 no. 5" → "c2no5"?)
  // — terlalu agresif untuk alamat; cukup rapikan pemisah umum jadi spasi.
  s = s.replace(/[._\-:/\\]+/g, ' ')
  s = s.replace(/\s+/g, ' ').trim()
  return s === '' ? null : s
}
