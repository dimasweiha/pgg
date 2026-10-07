import { ArrowDown, ArrowRight, ArrowUp } from 'lucide-react'

/**
 * SummaryCard minimalis:
 * - baris 1: label kecil
 * - baris 2: angka + delta ↑/↓ (hijau/merah)
 * - footer (opsional): border-t, "+N dari bulan lalu" + arrow →
 *
 * `delta`  = persen (number) atau null untuk sembunyikan
 * `footer` = { strong: '+3', text: 'dari bulan lalu' } atau null
 */

export default function SummaryCard({ label, value, delta = null, footer = null }) {
  return (
    <div className="flex flex-col rounded-xl border border-border-default bg-surface p-5">
      <p className="text-sm font-medium text-text-secondary">{label}</p>

      {/* Angka + delta */}
      <div className="mt-2 flex items-baseline gap-2">
        <p className="text-2xl font-bold leading-none tracking-tight text-text-primary">{value}</p>
        {delta !== null && (
          <span
            className={`inline-flex items-center gap-0.5 text-sm font-medium ${
              delta >= 0 ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {delta >= 0 ? <ArrowUp size={13} /> : <ArrowDown size={13} />}
            {Math.abs(delta)}%
          </span>
        )}
      </div>

      {/* Footer: selisih absolut + arrow */}
      {footer && (
        <div className="mt-4 flex items-center justify-between gap-2 border-t border-border-default pt-3">
          <p className="truncate text-sm">
            <span className="font-semibold text-text-primary">{footer.strong}</span>{' '}
            <span className="text-text-secondary">{footer.text}</span>
          </p>
          <ArrowRight size={15} className="shrink-0 text-text-secondary" />
        </div>
      )}
    </div>
  )
}
