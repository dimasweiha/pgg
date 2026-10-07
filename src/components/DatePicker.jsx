import { forwardRef, useEffect, useMemo, useRef, useState } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import useFixedPopover from '../lib/useFixedPopover.js'

/**
 * DatePicker — input tanggal dengan popover kalender (bukan native `type="date"`,
 * keputusan Dimas). Konsisten gaya DateRangePicker: pill terpilih sky, nav bulan,
 * klik luar / Esc untuk tutup. Popover `position: fixed` — selalu terlihat penuh
 * di dalam modal tanpa perlu scroll (revisi Dimas 6 Okt).
 *
 * API: { label, error, value (ISO 'yyyy-mm-dd' | ''), onChange(iso), placeholder }
 * forwardRef + name/id didukung agar kompatibel dengan react-hook-form.
 */

const BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]
const BULAN_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
const HARI = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']

const toISO = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

const TODAY_ISO = toISO(new Date())

/** Grid 6×7 tanggal untuk satu bulan (mulai Minggu). Cell null = kosong. */
function monthGrid(year, month) {
  const first = new Date(year, month, 1)
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const lead = first.getDay()
  const cells = Array(lead).fill(null)
  for (let d = 1; d <= daysInMonth; d += 1) cells.push(toISO(new Date(year, month, d)))
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

const formatLabel = (iso) => {
  if (!iso) return ''
  const [y, m, d] = iso.split('-').map(Number)
  return `${d} ${BULAN_SHORT[m - 1]} ${y}`
}

const DatePicker = forwardRef(function DatePicker(
  { label, error, id, name, value = '', onChange, placeholder = 'Pilih tanggal', className = '' },
  ref
) {
  const [open, setOpen] = useState(false)
  const [viewMonth, setViewMonth] = useState(() => {
    if (value) {
      const [y, m] = value.split('-').map(Number)
      return new Date(y, m - 1, 1)
    }
    return new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  })
  const rootRef = useRef(null)
  // Kalender selalu buka ke bawah (revisi Dimas 6 Okt: "jangan buat terbuka
  // keatas, tapi dibawahnya aja") — flip dimatikan.
  const { triggerRef, pos } = useFixedPopover(open, { tinggi: 350, flip: false })

  // Buka kalender selalu menampilkan bulan dari nilai terpilih (atau bulan ini)
  useEffect(() => {
    if (!open) return
    const target = value
      ? (() => {
          const [y, m] = value.split('-').map(Number)
          return new Date(y, m - 1, 1)
        })()
      : new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    // oxlint-disable-next-line set-state-in-effect
    setViewMonth(target)
  }, [open, value])

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

  const cells = useMemo(() => monthGrid(viewMonth.getFullYear(), viewMonth.getMonth()), [viewMonth])

  const pick = (iso) => {
    onChange?.(iso)
    setOpen(false)
  }

  const prevMonth = () => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1))
  const nextMonth = () => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1))

  const triggerClass = `flex w-full items-center gap-2 rounded-lg border bg-surface px-3 py-2 text-sm transition-colors focus:outline-none ${
    error
      ? 'border-red-500'
      : open
        ? 'border-sky-500 ring-2 ring-sky-500/20'
        : 'border-border-default'
  }`

  return (
    <div className={className} ref={ref}>
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
          aria-haspopup="dialog"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className={triggerClass}
        >
          <CalendarDays size={16} className={open ? 'text-sky-600' : 'text-text-secondary'} />
          <span className={value ? 'text-text-primary' : 'text-text-secondary'}>
            {value ? formatLabel(value) : placeholder}
          </span>
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
            className="z-50 rounded-xl border border-border-default bg-surface p-3 shadow-lg"
          >
            {/* Header: nav bulan */}
            <div className="mb-2 flex items-center justify-between px-1">
              <button
                type="button"
                onClick={prevMonth}
                aria-label="Bulan sebelumnya"
                className="rounded-md p-1 text-text-secondary hover:bg-gray-100 hover:text-text-primary"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-[13px] font-semibold text-text-primary">
                {BULAN[viewMonth.getMonth()]} {viewMonth.getFullYear()}
              </span>
              <button
                type="button"
                onClick={nextMonth}
                aria-label="Bulan berikutnya"
                className="rounded-md p-1 text-text-secondary hover:bg-gray-100 hover:text-text-primary"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Nama hari */}
            <div className="grid grid-cols-7 text-center">
              {HARI.map((h) => (
                <span key={h} className="py-0.5 text-[10px] font-medium text-text-secondary">
                  {h}
                </span>
              ))}
            </div>

            {/* Grid tanggal */}
            <div className="grid grid-cols-7 text-center">
              {cells.map((iso, i) => (
                <div key={iso ?? `empty-${i}`} className="flex items-center justify-center py-px">
                  {iso ? (
                    <button
                      type="button"
                      onClick={() => pick(iso)}
                      className={`flex h-7 w-7 items-center justify-center rounded-md text-[13px] transition-colors ${
                        iso === value
                          ? 'font-medium text-white bg-sky-500'
                          : iso === TODAY_ISO
                            ? 'font-medium text-sky-600 hover:bg-sky-50'
                            : 'text-text-primary hover:bg-gray-100'
                      }`}
                    >
                      {Number(iso.slice(8))}
                    </button>
                  ) : (
                    <span className="h-7 w-7" />
                  )}
                </div>
              ))}
            </div>

            {/* Footer: hari ini + bersihkan */}
            <div className="mt-2 flex items-center justify-between border-t border-border-default pt-2">
              <button
                type="button"
                onClick={() => pick(TODAY_ISO)}
                className="text-[11px] font-medium text-sky-600 hover:text-sky-700"
              >
                Hari ini
              </button>
              <button
                type="button"
                onClick={() => pick('')}
                className="text-[11px] font-medium text-text-secondary hover:text-red-600"
              >
                Bersihkan
              </button>
            </div>
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-800">{error}</p>}
    </div>
  )
})

export default DatePicker
