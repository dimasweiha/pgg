import { create } from 'zustand'

/** Tanggal lokal (yyyy-mm-dd), hindari pergeseran UTC */
function todayLocal() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function firstDayOfMonthLocal() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}-01`
}

/**
 * Filter rentang tanggal global Dashboard.
 * Disimpan di Zustand supaya konsisten lintas halaman
 * kalau nanti dibutuhkan (FEATURES.md §1).
 */
export const useDashboardFilter = create((set) => ({
  dateFrom: firstDayOfMonthLocal(),
  dateTo: todayLocal(),
  setDateRange: ({ from, to }) =>
    set((state) => ({
      dateFrom: from ?? state.dateFrom,
      dateTo: to ?? state.dateTo,
    })),
}))
