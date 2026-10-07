import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Batas waktu umur leads (hari) — TANPA default (revisi Dimas 6 Okt):
 * null = belum dipilih → halaman menampilkan semua leads tanpa filter.
 * Dipersist ke localStorage supaya pilihan Dimas tetap ada setelah refresh.
 * Key persist baru ('umur-batas-waktu') supaya nilai lama (7) tidak terbawa.
 */
export const useAgingStore = create(
  persist(
    (set) => ({
      threshold: null,
      setThreshold: (threshold) => set({ threshold }),
    }),
    { name: 'umur-batas-waktu' }
  )
)

/**
 * Level aging untuk highlight warna teks (DESIGN.md §2):
 * - normal   : <= threshold            → netral
 * - warning  : threshold < x <= 2x      → amber-800
 * - critical : > 2x threshold           → red-800
 * threshold null ("Semua leads") → semua normal, tanpa level urgensi.
 * Catatan revisi Dimas (5 Okt): baris TIDAK diberi background kuning/merah —
 * urgensi cukup disampaikan lewat warna teks Aging + pill Level.
 */
export function agingLevel(agingHari, threshold) {
  if (agingHari == null || threshold == null) return 'normal'
  if (agingHari > threshold * 2) return 'critical'
  if (agingHari > threshold) return 'warning'
  return 'normal'
}

export const AGING_TEXT = {
  normal: 'text-text-primary',
  warning: 'text-amber-800',
  critical: 'text-red-800',
}
