import { supabase } from './supabase'

/**
 * CRUD master data campaign iklan — tabel `campaigns`.
 * Step 1: dikelola di halaman Pengaturan.
 * Step 2 (nanti): dropdown campaign di form leads (leads.campaign_id).
 */

/** Semua campaign (aktif & nonaktif), urut nama */
export async function fetchAllCampaigns() {
  const { data, error } = await supabase
    .from('campaigns')
    .select('id, nama, is_active, created_at')
    .order('nama', { ascending: true })
  if (error) throw new Error(error.message)
  return data
}

/** Tambah campaign baru. Nama duplikat ditolak DB (unique) → diterjemahkan. */
export async function createCampaign(nama) {
  const { data, error } = await supabase
    .from('campaigns')
    .insert({ nama: nama.trim() })
    .select('id, nama, is_active')
    .single()
  if (error) {
    if (error.code === '23505') throw new Error('Nama campaign sudah dipakai')
    throw new Error(error.message)
  }
  return data
}

/** Ganti nama campaign */
export async function renameCampaign(id, nama) {
  const { error } = await supabase.from('campaigns').update({ nama: nama.trim() }).eq('id', id)
  if (error) {
    if (error.code === '23505') throw new Error('Nama campaign sudah dipakai')
    throw new Error(error.message)
  }
}

/** Aktifkan / nonaktifkan — nonaktif tetap tampil di riwayat leads lama */
export async function setCampaignActive(id, isActive) {
  const { error } = await supabase.from('campaigns').update({ is_active: isActive }).eq('id', id)
  if (error) throw new Error(error.message)
}

/**
 * Hapus permanen. Sampai Step 2 (leads.campaign_id ada) hapus selalu
 * berhasil; setelah FK terpasang, gagal bila masih dirujuk leads (23503).
 */
export async function deleteCampaign(id) {
  const { error } = await supabase.from('campaigns').delete().eq('id', id)
  if (error) {
    if (error.code === '23503') {
      throw new Error('Masih ada leads yang terhubung ke campaign ini — nonaktifkan saja')
    }
    throw new Error(error.message)
  }
}
