import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import useFixedPopover from '../lib/useFixedPopover.js'

/**
 * DropdownSelect — dropdown custom (bukan <select> native, keputusan Dimas).
 * Popover checklist dengan ikon Check, klik luar / Esc untuk tutup.
 * Popover `position: fixed` — selalu terlihat penuh di dalam modal tanpa
 * perlu scroll (revisi Dimas 6 Okt).
 * Tanpa nilai default: saat value kosong, trigger menampilkan placeholder.
 *
 * API: { label, error, value, onChange, options: [{value, label, hint?}], placeholder }
 */

const DropdownSelect = ({
  label,
  error,
  id,
  name,
  value,
  onChange,
  options,
  placeholder = 'Pilih…',
  className = '',
}) => {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)
  const { triggerRef, pos } = useFixedPopover(open, { tinggi: 240 })

  // Tutup saat klik luar / Escape
  useEffect(() => {
    if (!open) return undefined
    const onDown = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  // value null/undefined = belum dipilih → placeholder.
  // value '' hanya cocok bila memang ada opsi ber-value '' (mis. "Semua leads").
  const selected = options.find((opt) => opt.value === value)

  const triggerClass = `flex w-full items-center justify-between rounded-lg border bg-surface px-3 py-2 text-sm transition-colors focus:outline-none ${
    error
      ? 'border-red-500'
      : open
        ? 'border-sky-500 ring-2 ring-sky-500/20'
        : 'border-border-default'
  }`

  return (
    <div className={className}>
      {label && (
        <label className="mb-1 block text-xs uppercase tracking-wide text-text-secondary">
          {label}
        </label>
      )}
      <div ref={rootRef}>
        <button
          type="button"
          ref={triggerRef}
          id={id || name}
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className={triggerClass}
        >
          <span className={selected ? (selected.disabled ? 'text-text-secondary' : 'text-text-primary') : 'text-text-secondary'}>
            {selected ? selected.label : placeholder}
            {selected?.hint && (
              <span className="ml-1 text-xs font-normal">{selected.hint}</span>
            )}
          </span>
          <ChevronDown
            size={16}
            className={`shrink-0 text-text-secondary transition-transform ${open ? 'rotate-180 text-sky-600' : ''}`}
          />
        </button>

        {open && pos && (
          <div
            style={{
              position: 'fixed',
              top: pos.top,
              bottom: pos.bottom,
              left: pos.left,
              width: pos.width,
            }}
            className="z-50 max-h-60 overflow-y-auto rounded-xl border border-border-default bg-surface p-1.5 shadow-lg"
          >
            {options.length === 0 && (
              <p className="px-2.5 py-2 text-xs text-text-secondary">Tidak ada pilihan</p>
            )}
            {options.map((opt) => {
              const isSelected = opt.value === value
              const disabled = Boolean(opt.disabled)
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  aria-disabled={disabled || undefined}
                  disabled={disabled}
                  onClick={() => {
                    onChange?.(opt.value)
                    setOpen(false)
                  }}
                  className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-sm transition-colors ${
                    isSelected
                      ? 'bg-sky-50 font-medium text-sky-700'
                      : disabled
                        ? 'cursor-not-allowed text-text-secondary/60'
                        : 'text-text-primary hover:bg-gray-100'
                  }`}
                >
                  <span>
                    {opt.label}
                    {opt.hint && (
                      <span className="ml-1 text-xs text-text-secondary">{opt.hint}</span>
                    )}
                  </span>
                  {isSelected && <Check size={15} className="shrink-0 text-sky-600" />}
                </button>
              )
            })}
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-800">{error}</p>}
    </div>
  )
}

export default DropdownSelect
