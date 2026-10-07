/**
 * Card — container dasar semua blok informasi.
 * Spesifikasi: rounded-xl, border tipis, surface putih.
 */
export default function Card({ children, className = '' }) {
  return (
    <div className={`rounded-xl border border-border-default bg-surface p-6 ${className}`}>
      {children}
    </div>
  )
}
