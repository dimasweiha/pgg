/**
 * Button — varian sesuai referensi UI baru: primary = violet penuh,
 * secondary = outline netral, danger = merah. Semua rounded-lg.
 */
export default function Button({
  children,
  variant = 'primary',
  type = 'button',
  className = '',
  ...props
}) {
  const base =
    'rounded-lg px-3.5 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600/30'
  const variants = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700',
    secondary:
      'border border-border-default bg-surface text-text-primary hover:bg-gray-50',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  }

  return (
    <button type={type} className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}
