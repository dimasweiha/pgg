import { useEffect, useMemo, useRef, useState } from 'react'
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'

/**
 * DateRangePicker — satu button gaya Meta Ads: label rentang aktif,
 * klik → popover preset di kiri + dual calendar untuk pilih range,
 * terapkan lewat tombol Update.
 * API: { value: {from,to}, onChange } — from/to format ISO yyyy-mm-dd.
 */

const BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]
const BULAN_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
const HARI = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']

const toISO = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

// Dievaluasi sekali di module scope supaya render tetap pure
const TODAY_ISO = toISO(new Date())

const addDays = (iso, n) => {
  const d = new Date(`${iso}T00:00:00`)
  d.setDate(d.getDate() + n)
  return toISO(d)
}

const shortDate = (iso) => {
  if (!iso) return ''
  const [, m, d] = iso.split('-').map(Number)
  return `${d} ${BULAN_SHORT[m - 1]}`
}

/** Range preset. Semua dihitung dari hari ini. */
function presetRange(kind) {
  const now = new Date()
  const y = now.getFullYear()
  const m = now.getMonth()
  switch (kind) {
    case 'hariIni':
      return { from: TODAY_ISO, to: TODAY_ISO }
    case 'kemarin': {
      const iso = addDays(TODAY_ISO, -1)
      return { from: iso, to: iso }
    }
    case 'maksimal':
      return { from: '', to: '' }
    case 'hariKemarin':
      return { from: addDays(TODAY_ISO, -1), to: TODAY_ISO }
    case '7hari':
      return { from: addDays(TODAY_ISO, -6), to: TODAY_ISO }
    case '14hari':
      return { from: addDays(TODAY_ISO, -13), to: TODAY_ISO }
    case '28hari':
      return { from: addDays(TODAY_ISO, -27), to: TODAY_ISO }
    case '30hari':
      return { from: addDays(TODAY_ISO, -29), to: TODAY_ISO }
    case 'mingguIni': {
      const d = new Date(`${TODAY_ISO}T00:00:00`)
      const offset = (d.getDay() + 6) % 7 // Senin = awal minggu
      return { from: addDays(TODAY_ISO, -offset), to: TODAY_ISO }
    }
    case 'mingguLalu': {
      const d = new Date(`${TODAY_ISO}T00:00:00`)
      const offset = (d.getDay() + 6) % 7
      const seninIni = addDays(TODAY_ISO, -offset)
      return { from: addDays(seninIni, -7), to: addDays(seninIni, -1) }
    }
    case 'bulanIni':
      return { from: toISO(new Date(y, m, 1)), to: TODAY_ISO }
    case 'bulanLalu':
      return { from: toISO(new Date(y, m - 1, 1)), to: toISO(new Date(y, m, 0)) }
    default:
      return { from: '', to: '' }
  }
}

const PRESETS = [
  { kind: 'hariIni', label: 'Hari Ini' },
  { kind: 'kemarin', label: 'Kemarin' },
  { kind: 'maksimal', label: 'Maksimal' },
  { kind: 'hariKemarin', label: 'Hari ini dan kemarin' },
  { kind: '7hari', label: '7 hari terakhir' },
  { kind: '14hari', label: '14 hari terakhir' },
  { kind: '28hari', label: '28 hari terakhir' },
  { kind: '30hari', label: '30 hari terakhir' },
  { kind: 'mingguIni', label: 'Minggu ini' },
  { kind: 'mingguLalu', label: 'Minggu lalu' },
  { kind: 'bulanIni', label: 'Bulan ini' },
  { kind: 'bulanLalu', label: 'Bulan lalu' },
]

/** Label button sesuai gaya Meta: "Hari Ini: 4 Okt 2026" / "1 Okt – 4 Okt 2026" */
function buttonLabel(value) {
  const { from, to } = value
  if (!from && !to) return 'Maksimal'
  if (from && from === to) return `Hari ini & terpilih: ${shortDate(from)}`
  if (from && !to) return `Mulai ${shortDate(from)}`
  if (!from && to) return `Sampai ${shortDate(to)}`
  return `${shortDate(from)} – ${shortDate(to)}`
}

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

export default function DateRangePicker({ value, onChange, className = '' }) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState(value)
  const [hovered, setHovered] = useState(null)
  const [baseMonth, setBaseMonth] = useState(() => {
    const d = new Date()
    return new Date(d.getFullYear(), d.getMonth(), 1)
  })
  const rootRef = useRef(null)

  // Sinkron draft tiap kali value berubah / popover dibuka
  useEffect(() => {
    // oxlint-disable-next-line set-state-in-effect
    setDraft(value)
  }, [value, open])

  // Tutup saat klik di luar
  useEffect(() => {
    if (!open) return undefined
    const onDown = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  const rightMonth = useMemo(
    () => new Date(baseMonth.getFullYear(), baseMonth.getMonth() + 1, 1),
    [baseMonth]
  )

  // Ujung range efektif untuk highlight (pakai hover sebagai preview)
  const endIso = draft.to || (draft.from && hovered && hovered >= draft.from ? hovered : null)

  const pickDay = (iso) => {
    if (!draft.from || (draft.from && draft.to)) {
      setDraft({ from: iso, to: '' })
      return
    }
    if (iso < draft.from) {
      setDraft({ from: iso, to: '' })
      return
    }
    setDraft({ from: draft.from, to: iso })
  }

  const applyDraft = () => {
    let { from, to } = draft
    if (from && to && from > to) [from, to] = [to, from]
    onChange({ from, to })
    setOpen(false)
  }

  const closeWithoutApply = () => {
    setDraft(value)
    setOpen(false)
  }

  const dayClass = (iso) => {
    if (!iso) return ''
    const isStart = iso === draft.from
    const isEnd = iso === endIso
    const inRange = draft.from && endIso && iso > draft.from && iso < endIso
    if (isStart || isEnd) {
      return 'flex h-7 w-7 items-center justify-center rounded-md text-[13px] font-medium text-white bg-sky-500'
    }
    if (inRange)
      return 'flex h-7 w-7 items-center justify-center rounded-md text-[13px] bg-sky-50 text-sky-700'
    return 'flex h-7 w-7 items-center justify-center rounded-md text-[13px] text-text-primary transition-colors hover:bg-gray-100'
  }

  const renderMonth = (monthDate) => (
    <div className="w-[240px]">
      <div className="mb-1.5 flex items-center justify-between px-1">
        <span className="text-[13px] font-semibold text-text-primary">
          {BULAN[monthDate.getMonth()]} {monthDate.getFullYear()}
        </span>
        <div className="flex gap-0.5">
          <button
            type="button"
            onClick={() => setBaseMonth(new Date(monthDate.getFullYear(), monthDate.getMonth() - 1, 1))}
            className="rounded-md p-1 text-text-secondary hover:bg-gray-100 hover:text-text-primary"
            aria-label="Bulan sebelumnya"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            type="button"
            onClick={() => setBaseMonth(new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 1))}
            className="rounded-md p-1 text-text-secondary hover:bg-gray-100 hover:text-text-primary"
            aria-label="Bulan berikutnya"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 text-center">
        {HARI.map((h) => (
          <span key={h} className="py-0.5 text-[10px] font-medium text-text-secondary">
            {h}
          </span>
        ))}
        {monthGrid(monthDate.getFullYear(), monthDate.getMonth()).map((iso, i) => (
          <div key={iso ?? `empty-${i}`} className="flex items-center justify-center py-px">
            {iso ? (
              <button
                type="button"
                onMouseEnter={() => setHovered(iso)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => pickDay(iso)}
                className={dayClass(iso)}
              >
                {Number(iso.slice(-2))}
              </button>
            ) : (
              <span className="h-7 w-7" />
            )}
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/30 ${
          open
            ? 'border-sky-500 bg-sky-50 text-sky-700'
            : 'border-border-default bg-surface text-text-primary hover:bg-gray-50'
        }`}
      >
        <CalendarDays size={16} className={open ? 'text-sky-600' : 'text-text-secondary'} />
        {buttonLabel(value)}
        <ChevronDown
          size={14}
          className={`transition-transform ${open ? 'rotate-180 text-sky-600' : 'text-text-secondary'}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 z-40 mt-2 flex w-max max-w-[calc(100vw-1rem)] flex-col overflow-hidden rounded-xl border border-border-default bg-surface shadow-lg md:flex-row">
          {/* Sidebar preset */}
          <div className="w-full shrink-0 border-b border-border-default py-2 md:w-44 md:border-b-0 md:border-r">
            <p className="px-3.5 pb-1.5 text-[10px] font-semibold uppercase tracking-wide text-text-secondary">
              Baru-baru ini digunakan
            </p>
            <div className="max-h-56 space-y-0.5 overflow-y-auto px-1.5 md:max-h-none">
              {PRESETS.map((p) => {
                const range = presetRange(p.kind)
                const active = range.from === draft.from && range.to === draft.to
                return (
                  <button
                    key={p.kind}
                    type="button"
                    onClick={() => setDraft(range)}
                    className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[13px] transition-colors ${
                      active
                        ? 'font-medium text-sky-600'
                        : 'text-text-primary hover:bg-gray-50'
                    }`}
                  >
                    <span
                      className={`h-3.5 w-3.5 shrink-0 rounded-full border ${
                        active ? 'border-[4px] border-sky-500' : 'border-border-default'
                      }`}
                    />
                    {p.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Dual calendar */}
          <div className="flex-1 p-3">
            <div className="flex flex-col gap-4 lg:flex-row lg:gap-6">
              {renderMonth(baseMonth)}
              <div className="hidden md:block">{renderMonth(rightMonth)}</div>
            </div>

            {/* Custom range input + aksi */}
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border-default pt-3">
              <div className="flex items-center gap-1.5">
                <input
                  type="date"
                  value={draft.from}
                  onChange={(e) => setDraft((d) => ({ ...d, from: e.target.value, to: d.to > e.target.value ? d.to : '' }))}
                  className="rounded-md border border-border-default bg-surface px-2 py-1 text-[11px] focus:border-sky-500 focus:outline-none"
                />
                <span className="text-[11px] text-text-secondary">–</span>
                <input
                  type="date"
                  value={draft.to}
                  onChange={(e) => setDraft((d) => ({ ...d, to: e.target.value }))}
                  className="rounded-md border border-border-default bg-surface px-2 py-1 text-[11px] focus:border-sky-500 focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-1.5 whitespace-nowrap">
                <button
                  type="button"
                  onClick={closeWithoutApply}
                  className="rounded-md border border-border-default bg-surface px-3 py-1.5 text-[13px] font-medium text-text-primary transition-colors hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={applyDraft}
                  className="rounded-md bg-sky-500 px-3 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-sky-600"
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
