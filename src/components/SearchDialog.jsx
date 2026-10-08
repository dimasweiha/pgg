import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Search } from 'lucide-react'

/**
 * Popup pencarian leads — gaya command palette (revisi Dimas 8 Okt):
 * panel rounded-2xl tanpa border keras di sepertiga atas layar, input
 * borderless besar, footer hint keyboard. Render via portal ke body supaya
 * overlay selalu menutup seluruh layar (termasuk header & sidebar).
 */
export default function SearchDialog({ open, term, onTermChange, onSubmit, onClose }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 px-4 pt-[12vh] backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Cari leads"
    >
      <form
        onSubmit={onSubmit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg overflow-hidden rounded-2xl bg-surface shadow-2xl ring-1 ring-black/5"
      >
        <div className="flex items-center gap-3 px-5 py-4">
          <Search size={20} className="shrink-0 text-text-secondary" />
          <input
            autoFocus
            value={term}
            onChange={(e) => onTermChange(e.target.value)}
            placeholder="Cari nama, no. HP, atau blok unit…"
            aria-label="Kata kunci pencarian"
            className="w-full bg-transparent text-base text-text-primary placeholder:text-text-secondary/70 focus:outline-none"
          />
          {term && (
            <button
              type="button"
              onClick={() => onTermChange('')}
              title="Bersihkan"
              aria-label="Bersihkan pencarian"
              className="shrink-0 rounded-md p-1 text-text-secondary transition-colors hover:bg-gray-100 hover:text-text-primary"
            >
              ×
            </button>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-border-default bg-gray-50 px-5 py-2.5 text-[11px] text-text-secondary">
          <span className="flex items-center gap-1.5">
            <kbd className="rounded border border-border-default bg-surface px-1.5 py-0.5 font-sans">
              Enter
            </kbd>
            untuk mencari
          </span>
          <span className="flex items-center gap-1.5">
            <kbd className="rounded border border-border-default bg-surface px-1.5 py-0.5 font-sans">
              Esc
            </kbd>
            untuk menutup
          </span>
        </div>
      </form>
    </div>,
    document.body,
  )
}
