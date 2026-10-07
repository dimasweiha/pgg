import { supabase } from './supabase'

/**
 * CRUD master data sales — tabel `sales` (bukan akun login).
 * Dipakai halaman Pengaturan (revisi Dimas 6 Okt).
 */

/** Semua sales (aktif & nonaktif), urut nama */
export async function fetchAllSales() {
  const { data, error } = await supabase
    .from('sales')
    .select('id, nama, is_active, created_at')
    .order('nama', { ascending: true })
  if (error) throw new Error(error.message)
  return data
}

/** Tambah sales baru. Nama duplikat ditolak DB (unique) → diterjemahkan. */
export async function createSales(nama) {
  const { data, error } = await supabase
    .from('sales')
    .insert({ nama: nama.trim() })
    .select('id, nama, is_active')
    .single()
  if (error) {
    if (error.code === '23505') throw new Error('Nama sales sudah dipakai')
    throw new Error(error.message)
  }
  return data
}

/** Ganti nama sales */
export async function renameSales(id, nama) {
  const { error } = await supabase.from('sales').update({ nama: nama.trim() }).eq('id', id)
  if (error) {
    if (error.code === '23505') throw new Error('Nama sales sudah dipakai')
    throw new Error(error.message)
  }
}

/** Aktifkan / nonaktifkan — nonaktif tetap tampil di riwayat leads lama */
export async function setSalesActive(id, isActive) {
  const { error } = await supabase.from('sales').update({ is_active: isActive }).eq('id', id)
  if (error) throw new Error(error.message)
}

/**
 * Hapus permanen. Gagal bila masih ada leads yang merujuk (FK).
 * Saran alur: pindahkan leads-nya ke sales lain dulu, atau nonaktifkan saja.
 */
export async function deleteSales(id) {
  const { error } = await supabase.from('sales').delete().eq('id', id)
  if (error) {
    if (error.code === '23503') {
      throw new Error('Masih ada leads yang terhubung ke sales ini — nonaktifkan saja atau pindahkan leads-nya dulu')
    }
    throw new Error(error.message)
  }
}
