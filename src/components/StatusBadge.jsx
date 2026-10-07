/**
 * StatusBadge — warna status sesuai DESIGN.md §2.
 * proses=kuning(amber), deal=hijau(emerald), no_deal=merah(red).
 */
const STATUS_CONFIG = {
  proses: { label: 'Proses', className: 'bg-amber-100 text-amber-800' },
  deal: { label: 'Deal', className: 'bg-emerald-100 text-emerald-800' },
  no_deal: { label: 'No Deal', className: 'bg-red-100 text-red-800' },
}

export default function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] ?? {
    label: status,
    className: 'bg-gray-100 text-gray-800',
  }
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  )
}
