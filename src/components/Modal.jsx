import { useEffect } from 'react'

/**
 * Modal generik — backdrop + panel tengah.
 * Tutup dengan klik backdrop, tombol, atau Escape.
 */
export default function Modal({ open, title, onClose, children }) {
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
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-border-default bg-surface p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-2 py-1 text-xl leading-none text-text-secondary hover:bg-gray-100"
            aria-label="Tutup"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
