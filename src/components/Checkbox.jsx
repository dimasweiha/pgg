import { Check } from 'lucide-react'

/**
 * Checkbox custom (revisi Dimas 6 Okt: centang PUTIH di kotak sky,
 * bukan checkbox native accent yang tampak gelap di beberapa browser).
 * Input native tetap ada (aksesibel, keyboard-friendly), hanya visualnya
 * disembunyikan; kotak + ikon Check dirender manual via peer-checked.
 * Taruh di dalam <label> baris supaya klik teks ikut men-toggle.
 */
export default function Checkbox({ checked, onChange }) {
  return (
    <span className="relative inline-flex shrink-0">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="peer size-4 cursor-pointer appearance-none rounded border border-border-default bg-surface transition-colors checked:border-sky-500 checked:bg-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
      />
      <Check
        size={12}
        strokeWidth={3}
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100"
      />
    </span>
  )
}
