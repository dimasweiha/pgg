import { createPortal } from 'react-dom'
import { useEffect } from 'react'
import { MessageCircle } from 'lucide-react'
import StatusBadge from './StatusBadge.jsx'
import Button from './Button.jsx'
import { formatTanggal, selisihHari, hariIni } from '../lib/leads.js'

/** Tile kecil: label uppercase + nilai — didefinisikan di module level (purity) */
function Field({ label, children }) {
  return (
    <div className="rounded-lg bg-gray-50 px-3.5 py-2.5">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-text-secondary">
        {label}
      </p>
      <div className="mt-0.5 text-sm font-medium text-text-primary">{children}</div>
    </div>
  )
}

/**
 * Modal info leads — lihat detail tanpa masuk mode edit.
 * Redesign 8 Okt: header identitas (avatar + nama + badge status),
 * field dalam tile grid 2 kolom (bukan list datar), catatan full-width,
 * tombol aksi WhatsApp + Tutup.
 */
export default function LeadInfoModal({ lead, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  if (!lead) return null

  const isProses = lead.status === 'proses'
  const durasi = isProses
    ? selisihHari(hariIni(), lead.tanggal_masuk)
    : selisihHari(lead.tanggal_keputusan, lead.tanggal_masuk)
  const initial = (lead.nama?.[0] ?? '?').toUpperCase()

  /** 08xx / +62xx / 62xx → digits untuk link wa.me */
  const waDigits = lead.no_hp
    ? lead.no_hp.replace(/\D/g, '').replace(/^0/, '62')
    : null
  const waLink = waDigits ? `https://wa.me/${waDigits}` : null

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border-default bg-surface shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header identitas */}
        <div className="flex items-center gap-3.5 border-b border-border-default px-5 py-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-50 text-base font-semibold text-primary-600">
            {initial}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="truncate text-base font-semibold text-text-primary">{lead.nama}</h2>
              <StatusBadge status={lead.status} />
            </div>
            <p className="mt-0.5 text-sm text-text-secondary">{lead.no_hp || 'Tanpa no. HP'}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-2 py-1 text-xl leading-none text-text-secondary hover:bg-gray-100"
            aria-label="Tutup"
          >
            ×
          </button>
        </div>

        {/* Field tiles */}
        <div className="grid grid-cols-2 gap-2.5 px-5 py-4">
          <Field label="Jenis">{lead.jenis === 'iklan' ? 'Iklan' : 'Organik'}</Field>
          <Field label="Sales">{lead.sales?.nama ?? '—'}</Field>
          {lead.jenis === 'iklan' && (
            <div className="col-span-2">
              <Field label="Campaign">{lead.campaign?.nama ?? '—'}</Field>
            </div>
          )}
          <Field label="Tanggal Masuk">{formatTanggal(lead.tanggal_masuk)}</Field>
          <Field label={isProses ? 'Umur Leads' : 'Lama Proses'}>
            {durasi === null ? '-' : `${durasi} hari`}
          </Field>
          <Field label="Blok Unit">{lead.blok_unit || '—'}</Field>
          {!isProses && (
            <Field label="Tanggal Keputusan">{formatTanggal(lead.tanggal_keputusan)}</Field>
          )}
          {lead.catatan && (
            <div className="col-span-2">
              <Field label="Catatan">{lead.catatan}</Field>
            </div>
          )}
        </div>

        {/* Aksi */}
        <div className="flex justify-end gap-2 border-t border-border-default px-5 py-4">
          {waLink && (
            <a href={waLink} target="_blank" rel="noreferrer">
              <Button variant="secondary" type="button">
                <span className="flex items-center gap-1.5">
                  <MessageCircle size={16} />
                  Chat WhatsApp
                </span>
              </Button>
            </a>
          )}
          <Button variant="primary" type="button" onClick={onClose}>
            Tutup
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
