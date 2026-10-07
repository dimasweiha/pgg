import { supabase } from './supabase'

/**
 * Lib agregat Dashboard/Rekap (FEATURES.md §1).
 * Summary cards & chart tren dihitung di frontend dari data leads
 * dalam rentang tanggal — sederhana dan 1x fetch saja.
 * Leaderboard dari view `v_rekap_sales` (scope keseluruhan).
 */

const LEADS_FOR_DASHBOARD = `
  id, tanggal_masuk, jenis, status, omset, sales_id,
  sales:sales_id (id, nama)
`

/** Fetch leads dalam rentang tanggal masuk [from, to] */
export async function fetchLeadsByDateRange(dateFrom, dateTo) {
  let query = supabase
    .from('leads')
    .select(LEADS_FOR_DASHBOARD)
    .order('tanggal_masuk', { ascending: true })

  if (dateFrom) query = query.gte('tanggal_masuk', dateFrom)
  if (dateTo) query = query.lte('tanggal_masuk', dateTo)

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data
}

/**
 * Rentang bulan kalender lalu (1 .. akhir bulan), dibanding hari ini.
 * Dipakai sebagai baseline footer summary card ("dari bulan lalu").
 */
export function bulanLaluRange() {
  const now = new Date()
  const from = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const to = new Date(now.getFullYear(), now.getMonth(), 0)
  const iso = (d) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  return { from: iso(from), to: iso(to) }
}

/**
 * Hitung rentang periode sebelumnya sepanjang rentang aktif.
 * Contoh: 1–7 Okt → 24–30 Sep. Return {from, to} — null kalau
 * rentang aktif tidak lengkap (tak ada pembanding yang adil).
 */
export function periodeSebelumnya(dateFrom, dateTo) {
  if (!dateFrom || !dateTo) return null
  const from = new Date(`${dateFrom}T00:00:00`)
  const to = new Date(`${dateTo}T00:00:00`)
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return null

  const panjangHari = Math.round((to - from) / 86400000) + 1
  const prevTo = new Date(from)
  prevTo.setDate(from.getDate() - 1)
  const prevFrom = new Date(prevTo)
  prevFrom.setDate(prevTo.getDate() - (panjangHari - 1))

  const iso = (d) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  return { from: iso(prevFrom), to: iso(prevTo) }
}

/** Persen perubahan current vs previous; null kalau tak bisa dihitung. */
export function deltaPersen(current, previous) {
  if (previous === null || previous === undefined || previous === 0) return null
  if (current === null || current === undefined) return null
  return Math.round(((current - previous) / previous) * 1000) / 10
}

/** Leaderboard sales dari view v_rekap_sales */
export async function fetchRekapSales() {
  const { data, error } = await supabase
    .from('v_rekap_sales')
    .select('*')
    .order('total_omset', { ascending: false })
  if (error) throw new Error(error.message)
  return data
}

/**
 * Leads stuck dari view v_aging_leads — sudah difilter status='proses'
 * dan diurutkan aging terlama (di view). Threshold diterapkan di frontend
 * (SCHEMA.md §4) supaya fleksibel tanpa migrasi.
 */
export async function fetchAgingLeads() {
  const { data, error } = await supabase.from('v_aging_leads').select('*')
  if (error) throw new Error(error.message)
  return data
}

/**
 * Breakdown minat per blok unit dari view v_unit_breakdown
 * (sudah diurutkan jumlah_leads desc di view, exclude blok kosong).
 */
export async function fetchUnitBreakdown() {
  const { data, error } = await supabase.from('v_unit_breakdown').select('*')
  if (error) throw new Error(error.message)
  return data
}

/**
 * Agregat summary dari array leads (sudah terfilter rentang tanggal).
 * Return { total, deal, noDeal, proses, persenDeal, totalOmset, jumlahOrganik, jumlahIklan }
 */
export function summarize(leads) {
  const total = leads.length
  const deal = leads.filter((l) => l.status === 'deal')
  const noDeal = leads.filter((l) => l.status === 'no_deal')
  const proses = leads.filter((l) => l.status === 'proses')
  const totalOmset = deal.reduce((sum, l) => sum + Number(l.omset ?? 0), 0)

  return {
    total,
    deal: deal.length,
    noDeal: noDeal.length,
    proses: proses.length,
    persenDeal: total > 0 ? Math.round((deal.length / total) * 1000) / 10 : null,
    totalOmset,
    jumlahOrganik: leads.filter((l) => l.jenis === 'organik').length,
    jumlahIklan: leads.filter((l) => l.jenis === 'iklan').length,
  }
}

/**
 * Tren leads masuk per minggu (ISO week: Senin sebagai awal minggu).
 * Return [{ periode: "2026-W40", label: "28 Sep–4 Okt", total, deal, noDeal, proses }]
 */
export function trenMingguan(leads) {
  const buckets = new Map()

  for (const lead of leads) {
    const d = new Date(`${lead.tanggal_masuk}T00:00:00`)
    if (Number.isNaN(d.getTime())) continue

    // ISO week: geser ke Kamis lalu hitung
    const day = (d.getDay() + 6) % 7 // Senin=0..Minggu=6
    const thursday = new Date(d)
    thursday.setDate(d.getDate() - day + 3)
    const jan1 = new Date(thursday.getFullYear(), 0, 1)
    const week = 1 + Math.round((thursday - jan1) / 86400000 / 7)
    const key = `${thursday.getFullYear()}-W${String(week).padStart(2, '0')}`

    if (!buckets.has(key)) {
      buckets.set(key, { key, total: 0, deal: 0, noDeal: 0, proses: 0 })
    }
    const b = buckets.get(key)
    b.total += 1
    if (lead.status === 'deal') b.deal += 1
    else if (lead.status === 'no_deal') b.noDeal += 1
    else b.proses += 1
  }

  return [...buckets.values()]
    .sort((a, b) => a.key.localeCompare(b.key))
    .map(({ key, ...rest }) => ({ periode: key, ...rest }))
}

/**
 * Tren leads masuk per bulan.
 * Return [{ periode: "2026-09", label: "Sep 2026", total, deal, noDeal, proses }]
 */
export function trenBulanan(leads) {
  const buckets = new Map()

  for (const lead of leads) {
    if (!lead.tanggal_masuk) continue
    const key = lead.tanggal_masuk.slice(0, 7) // yyyy-mm
    if (!buckets.has(key)) {
      buckets.set(key, { key, total: 0, deal: 0, noDeal: 0, proses: 0 })
    }
    const b = buckets.get(key)
    b.total += 1
    if (lead.status === 'deal') b.deal += 1
    else if (lead.status === 'no_deal') b.noDeal += 1
    else b.proses += 1
  }

  const bulanIndo = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
  return [...buckets.values()]
    .sort((a, b) => a.key.localeCompare(b.key))
    .map(({ key, ...rest }) => {
      const [y, m] = key.split('-')
      return { periode: key, label: `${bulanIndo[Number(m) - 1]} ${y}`, ...rest }
    })
}

/**
 * Tren leads masuk — granularitas OTOMATIS mengikuti panjang rentang:
 * ≤ 14 hari → harian, ≤ 120 hari → mingguan, sisanya → bulanan.
 * Periode tanpa leads tetap muncul (bucket 0) supaya chart tidak melompat.
 * @param {Array} leads - leads dalam rentang aktif (sudah terfilter)
 * @param {Object} rentang - { from, to } ISO yyyy-mm-dd, opsional
 * @returns {{ granularity: 'harian'|'mingguan'|'bulanan', data: Array }}
 */
export function trenLeads(leads, rentang) {
  const isoOf = (d) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

  const from = rentang?.from || leads[0]?.tanggal_masuk
  const to = rentang?.to || leads[leads.length - 1]?.tanggal_masuk

  // Panjang rentang — fallback 120 hari kalau tanggal tidak lengkap
  let panjang = 120
  if (from && to) {
    const f = new Date(`${from}T00:00:00`)
    const t = new Date(`${to}T00:00:00`)
    if (!Number.isNaN(f.getTime()) && !Number.isNaN(t.getTime())) {
      panjang = Math.round((t - f) / 86400000) + 1
    }
  }

  const BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
  const HARI = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']

  const emptyBucket = (key) => ({ key, total: 0, deal: 0, noDeal: 0, proses: 0 })

  // ---- Harian: ≤ 14 hari, label "Sen 29/9" ----
  if (panjang <= 14 && from && to) {
    const byDay = new Map()
    for (const lead of leads) {
      const key = lead.tanggal_masuk?.slice(0, 10)
      if (!key) continue
      if (!byDay.has(key)) byDay.set(key, emptyBucket(key))
      const b = byDay.get(key)
      b.total += 1
      if (lead.status === 'deal') b.deal += 1
      else if (lead.status === 'no_deal') b.noDeal += 1
      else b.proses += 1
    }

    const data = []
    const cursor = new Date(`${from}T00:00:00`)
    for (let i = 0; i < panjang; i += 1) {
      const iso = isoOf(cursor)
      const b = byDay.get(iso) ?? emptyBucket(iso)
      data.push({ periode: iso, label: `${HARI[cursor.getDay()]} ${cursor.getDate()}/${cursor.getMonth() + 1}`, ...b })
      cursor.setDate(cursor.getDate() + 1)
    }
    return { granularity: 'harian', data }
  }

  // ---- Mingguan: ≤ 120 hari, label "28 Sep–4 Okt" ----
  if (panjang <= 120 && from && to) {
    const isoWeekKey = (dateStr) => {
      const d = new Date(`${dateStr}T00:00:00`)
      const day = (d.getDay() + 6) % 7 // Senin=0..Minggu=6
      const monday = new Date(d)
      monday.setDate(d.getDate() - day)
      // key = tanggal Senin supaya gampang urut & generate
      return isoOf(monday)
    }

    const byWeek = new Map()
    for (const lead of leads) {
      if (!lead.tanggal_masuk) continue
      const key = isoWeekKey(lead.tanggal_masuk)
      if (!byWeek.has(key)) byWeek.set(key, emptyBucket(key))
      const b = byWeek.get(key)
      b.total += 1
      if (lead.status === 'deal') b.deal += 1
      else if (lead.status === 'no_deal') b.noDeal += 1
      else b.proses += 1
    }

    // Generate semua minggu dari Senin sebelum `from` s/d Senin sebelum `to`
    const f = new Date(`${from}T00:00:00`)
    const mondayOfFrom = new Date(f)
    mondayOfFrom.setDate(f.getDate() - ((f.getDay() + 6) % 7))
    const t = new Date(`${to}T00:00:00`)
    const mondayOfTo = new Date(t)
    mondayOfTo.setDate(t.getDate() - ((t.getDay() + 6) % 7))

    const data = []
    const cursor = new Date(mondayOfFrom)
    while (cursor <= mondayOfTo) {
      const iso = isoOf(cursor)
      const b = byWeek.get(iso) ?? emptyBucket(iso)
      const end = new Date(cursor)
      end.setDate(cursor.getDate() + 6)
      data.push({
        periode: iso,
        label: `${cursor.getDate()} ${BULAN[cursor.getMonth()]}–${end.getDate()} ${BULAN[end.getMonth()]}`,
        ...b,
      })
      cursor.setDate(cursor.getDate() + 7)
    }
    return { granularity: 'mingguan', data }
  }

  // ---- Bulanan: > 120 hari, label "Sep 2026" ----
  const byMonth = new Map()
  for (const lead of leads) {
    if (!lead.tanggal_masuk) continue
    const key = lead.tanggal_masuk.slice(0, 7) // yyyy-mm
    if (!byMonth.has(key)) byMonth.set(key, emptyBucket(key))
    const b = byMonth.get(key)
    b.total += 1
    if (lead.status === 'deal') b.deal += 1
    else if (lead.status === 'no_deal') b.noDeal += 1
    else b.proses += 1
  }

  // Generate semua bulan antara from..to (kalau tanggal lengkap)
  const data = []
  if (from && to) {
    const f = new Date(`${from}T00:00:00`)
    const t = new Date(`${to}T00:00:00`)
    const cursor = new Date(f.getFullYear(), f.getMonth(), 1)
    const endMonth = new Date(t.getFullYear(), t.getMonth(), 1)
    while (cursor <= endMonth) {
      const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`
      const b = byMonth.get(key) ?? emptyBucket(key)
      data.push({ periode: key, label: `${BULAN[cursor.getMonth()]} ${cursor.getFullYear()}`, ...b })
      cursor.setMonth(cursor.getMonth() + 1)
    }
  } else {
    for (const key of [...byMonth.keys()].sort()) {
      const [y, m] = key.split('-').map(Number)
      data.push({ periode: key, label: `${BULAN[m - 1]} ${y}`, ...byMonth.get(key) })
    }
  }
  return { granularity: 'bulanan', data }
}

/** Breakdown jenis untuk pie/bar chart: [{ name: 'Iklan', value: n }, …] */
export function breakdownJenis(leads) {
  return [
    { name: 'Iklan', value: leads.filter((l) => l.jenis === 'iklan').length },
    { name: 'Organik', value: leads.filter((l) => l.jenis === 'organik').length },
  ].filter((d) => d.value > 0)
}
