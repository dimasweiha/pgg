import Modal from './Modal.jsx'
import StatusBadge from './StatusBadge.jsx'
import Button from './Button.jsx'
import { formatTanggal, selisihHari, hariIni } from '../lib/leads.js'

/**
 * Modal info leads — lihat detail tanpa masuk mode edit.
 * Semua field read-only; tombol tunggal "Tutup".
 */
export default function LeadInfoModal({ lead, onClose }) {
  if (!lead) return null

  const isProses = lead.status === 'proses'
  const durasi = isProses
    ? selisihHari(hariIni(), lead.tanggal_masuk)
    : selisihHari(lead.tanggal_keputusan, lead.tanggal_masuk)

  const rows = [
    ['Nama', lead.nama],
    ['No. HP / WA', lead.no_hp || '-'],
    ['Jenis', lead.jenis === 'iklan' ? 'Iklan' : 'Organik'],
    ['Sales', lead.sales?.nama ?? '—'],
    ...(lead.jenis === 'iklan' ? [['Campaign', lead.campaign?.nama ?? '—']] : []),
    ['Tanggal Masuk', formatTanggal(lead.tanggal_masuk)],
    ['Blok Unit', lead.blok_unit || '—'],
    ['Status', null],
    ...(isProses
      ? []
      : [['Tanggal Keputusan', formatTanggal(lead.tanggal_keputusan)]]),
    [isProses ? 'Umur Leads' : 'Lama Proses', durasi === null ? '-' : `${durasi} hari`],
    ...(lead.catatan ? [['Catatan', lead.catatan]] : []),
  ]

  return (
    <Modal open title="Info Leads" onClose={onClose}>
      <dl className="space-y-3">
        {rows.map(([label, value]) => (
          <div
            key={label}
            className="grid grid-cols-1 gap-0.5 border-b border-border-default pb-3 last:border-0 last:pb-0 sm:grid-cols-[180px_1fr] sm:gap-4"
          >
            <dt className="text-xs uppercase tracking-wide text-text-secondary">{label}</dt>
            <dd className="text-sm font-medium text-text-primary">
              {value === null ? <StatusBadge status={lead.status} /> : value}
            </dd>
          </div>
        ))}
      </dl>
      <div className="mt-5 flex justify-end">
        <Button variant="secondary" type="button" onClick={onClose}>
          Tutup
        </Button>
      </div>
    </Modal>
  )
}
