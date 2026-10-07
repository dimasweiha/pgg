import * as XLSX from 'xlsx'
import { formatTanggal, hariIni, selisihHari } from './leads.js'

const STATUS_LABEL = { proses: 'Proses', deal: 'Deal', no_deal: 'No Deal' }

const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '')

/**
 * Export daftar leads ke file .xlsx (SheetJS).
 * Data yang dikirim = persis array leads yang sedang tampil di tabel,
 * jadi export otomatis menghormati semua filter aktif
 * (search, sales, status, jenis, rentang tanggal) — STEPS.md Step 7.
 *
 * @param {Array} leads - leads terfilter dari halaman Leads
 * @returns {string} nama file yang diunduh
 */
export function exportLeadsToExcel(leads) {
  const header = [
    'Tgl Masuk',
    'Nama',
    'No. HP',
    'Jenis',
    'Sales',
    'Blok Unit',
    'Status',
    'Lama Proses (hari)',
    'Catatan',
  ]

  const rows = leads.map((lead) => {
    // Kolom durasi konsisten dengan tabel UI:
    // proses = aging (hari ini - tgl masuk), lainnya = lama proses
    const lama =
      lead.status === 'proses'
        ? selisihHari(hariIni(), lead.tanggal_masuk)
        : selisihHari(lead.tanggal_keputusan, lead.tanggal_masuk)

    return [
      formatTanggal(lead.tanggal_masuk),
      lead.nama ?? '',
      lead.no_hp ? String(lead.no_hp) : '', // string agar "0" di depan tidak hilang di Excel
      cap(lead.jenis),
      lead.sales?.nama ?? '',
      lead.blok_unit ?? '',
      STATUS_LABEL[lead.status] ?? lead.status ?? '',
      lama ?? '',
      lead.catatan ?? '',
    ]
  })

  const aoa = [header, ...rows]
  const ws = XLSX.utils.aoa_to_sheet(aoa)

  // Lebar kolom agar langsung terbaca tanpa di-resize
  ws['!cols'] = [
    { wch: 12 },
    { wch: 22 },
    { wch: 16 },
    { wch: 10 },
    { wch: 14 },
    { wch: 10 },
    { wch: 10 },
    { wch: 18 },
    { wch: 32 },
  ]

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Leads')

  const now = new Date()
  const hh = String(now.getHours()).padStart(2, '0')
  const mm = String(now.getMinutes()).padStart(2, '0')
  const filename = `leads_${hariIni()}_${hh}${mm}.xlsx`

  XLSX.writeFile(wb, filename)
  return filename
}
