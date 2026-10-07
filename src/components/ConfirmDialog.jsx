import { useEffect } from 'react'
import Button from './Button.jsx'

/**
 * ConfirmDialog — modal konfirmasi generik (dipakai untuk hapus leads).
 * Tutup dengan klik backdrop atau tombol batal.
 */
export default function ConfirmDialog({ open, title, message, confirmLabel = 'Hapus', onConfirm, onClose }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-sm rounded-xl border border-border-default bg-surface p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
        <p className="mt-2 text-sm text-text-secondary">{message}</p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Batal
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
