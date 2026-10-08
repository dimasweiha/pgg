import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { Loader2, Search } from 'lucide-react'
import StatusBadge from './StatusBadge.jsx'
import { fetchLeads, formatTanggal } from '../lib/leads.js'

const MIN_CHARS = 3
const JUMLAH_HASIL = 6

/**
 * Popup pencarian leads (revisi Dimas 8 Okt):
 * - sudut tegas (rounded-lg, bukan rounded-2xl)
 * - live search: ketik ≥3 huruf → hasil langsung muncul di bawah input
 *   (debounce 300ms), tanpa menekan Enter. Enter = buka halaman Leads
 *   dengan filter kata kunci tersebut.
 * - klik hasil → langsung ke halaman Leads (daftar penuh + filter prefill).
 */
export default function SearchDialog({ open, onClose }) {
  const navigate = useNavigate()
  const [term, setTerm] = useState('')
  const [hasil, setHasil] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const kataKunci = term.trim()

  // Tutup dengan Escape
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  // Reset saat popup dibuka
  useEffect(() => {
    if (open) return
    // oxlint-disable-next-line set-state-in-effect
    setTerm('')
    setHasil([])
    setError(null)
  }, [open])

  // Live search — debounce 300ms, minimal 3 huruf
  useEffect(() => {
    if (!open || kataKunci.length < MIN_CHARS) return
    let batal = false
    // oxlint-disable-next-line set-state-in-effect
    setLoading(true)
    // oxlint-disable-next-line set-state-in-effect
    setError(null)
    const timer = setTimeout(async () => {
      try {
        const data = await fetchLeads({ search: kataKunci })
        if (batal) return
        setHasil(data.slice(0, JUMLAH_HASIL))
      } catch (err) {
        if (!batal) setError(err.message)
      } finally {
        if (!batal) setLoading(false)
      }
    }, 300)
    return () => {
      batal = true
      clearTimeout(timer)
    }
  }, [open, kataKunci])

  if (!open) return null

  const bukaHalamanLeads = (q) => {
    onClose()
    navigate(q ? `/leads?q=${encodeURIComponent(q)}` : '/leads')
  }

  const submit = (e) => {
    e.preventDefault()
    bukaHalamanLeads(kataKunci)
  }

  const tampilkanHasil = kataKunci.length >= MIN_CHARS

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 px-4 pt-[12vh] backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Cari leads"
    >
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg overflow-hidden rounded-lg bg-surface shadow-2xl ring-1 ring-black/5"
      >
        <div className="flex items-center gap-3 px-4 py-3.5">
          <Search size={20} className="shrink-0 text-text-secondary" />
          <input
            autoFocus
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Cari nama, no. HP, atau blok unit… (min. 3 huruf)"
            aria-label="Kata kunci pencarian"
            className="w-full bg-transparent text-base text-text-primary placeholder:text-text-secondary/70 focus:outline-none"
          />
          {loading && <Loader2 size={16} className="shrink-0 animate-spin text-text-secondary" />}
          {term && !loading && (
            <button
              type="button"
              onClick={() => setTerm('')}
              title="Bersihkan"
              aria-label="Bersihkan pencarian"
              className="shrink-0 rounded-md p-1 text-text-secondary transition-colors hover:bg-gray-100 hover:text-text-primary"
            >
              ×
            </button>
          )}
        </div>

        {/* Hasil live search */}
        {tampilkanHasil && (
          <div className="max-h-[45vh] overflow-y-auto border-t border-border-default">
            {error ? (
              <p className="px-4 py-3 text-sm text-red-800">Gagal mencari: {error}</p>
            ) : hasil.length === 0 ? (
              <p className="px-4 py-3 text-sm text-text-secondary">
                {loading ? 'Mencari…' : `Tidak ada leads cocok dengan "${kataKunci}".`}
              </p>
            ) : (
              hasil.map((lead) => (
                <button
                  key={lead.id}
                  type="button"
                  onClick={() => bukaHalamanLeads(lead.nama)}
                  className="flex w-full items-center gap-3 border-b border-border-default px-4 py-2.5 text-left transition-colors last:border-0 hover:bg-gray-50"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-text-primary">{lead.nama}</p>
                    <p className="truncate text-xs text-text-secondary">
                      {lead.no_hp || '—'} · {lead.blok_unit || 'tanpa unit'} ·{' '}
                      {formatTanggal(lead.tanggal_masuk)}
                      {lead.sales?.nama ? ` · ${lead.sales.nama}` : ''}
                    </p>
                  </div>
                  <StatusBadge status={lead.status} />
                </button>
              ))
            )}
          </div>
        )}

        <div className="flex items-center justify-between border-t border-border-default bg-gray-50 px-4 py-2.5 text-[11px] text-text-secondary">
          <span className="flex items-center gap-1.5">
            <kbd className="rounded border border-border-default bg-surface px-1.5 py-0.5 font-sans">
              Enter
            </kbd>
            semua hasil
          </span>
          <span className="flex items-center gap-1.5">
            <kbd className="rounded border border-border-default bg-surface px-1.5 py-0.5 font-sans">
              Esc
            </kbd>
            tutup
          </span>
        </div>
      </form>
    </div>,
    document.body,
  )
}
