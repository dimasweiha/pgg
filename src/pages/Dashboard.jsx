import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import Card from '../components/Card.jsx'
import Button from '../components/Button.jsx'
import DateRangePicker from '../components/DateRangePicker.jsx'
import SummaryCard from '../components/SummaryCard.jsx'
import { useDashboardFilter } from '../store/dashboard.js'
import {
  breakdownJenis,
  bulanLaluRange,
  deltaPersen,
  fetchLeadsByDateRange,
  fetchRekapSales,
  summarize,
  trenLeads,
} from '../lib/dashboard.js'
import { formatRupiah, formatTanggal } from '../lib/leads.js'

// Warna chart sesuai tema biru muda (sky)
const SKY = '#0ea5e9'
const SKY_SOFT = '#7dd3fc'
const EMERALD = '#10b981'
const RED = '#f43f5e'
const AMBER = '#f59e0b'
const GRID = '#e9e9f0'

/** Tooltip chart — putih, border, rounded (DESIGN.md §8) */
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-md border border-border-default bg-white px-3 py-2 text-xs shadow-sm">
      <p className="font-medium text-text-primary">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey ?? p.name} className="text-text-secondary">
          {p.name}: <span className="font-medium text-text-primary">{p.value}</span>
        </p>
      ))}
    </div>
  )
}

export default function DashboardPage() {
  const { dateFrom, dateTo, setDateRange } = useDashboardFilter()
  const [leads, setLeads] = useState([])
  const [prevLeads, setPrevLeads] = useState([])
  const [rekapSales, setRekapSales] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const bulanLalu = bulanLaluRange()
      const [leadsData, rekapData, prevLeadsData] = await Promise.all([
        fetchLeadsByDateRange(dateFrom, dateTo),
        fetchRekapSales(),
        fetchLeadsByDateRange(bulanLalu.from, bulanLalu.to),
      ])
      setLeads(leadsData)
      setRekapSales(rekapData)
      setPrevLeads(prevLeadsData)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [dateFrom, dateTo])

  useEffect(() => {
    // oxlint-disable-next-line set-state-in-effect
    load()
  }, [load])

  const summary = useMemo(() => summarize(leads), [leads])
  const prevSummary = useMemo(() => summarize(prevLeads), [prevLeads])

  const dTotal = deltaPersen(summary.total, prevSummary.total)
  const dDeal = deltaPersen(summary.deal, prevSummary.deal)
  const dNoDeal = deltaPersen(summary.noDeal, prevSummary.noDeal)
  const dProses = deltaPersen(summary.proses, prevSummary.proses)

  // Footer "+N dari bulan lalu" — selisih absolut vs bulan kalender lalu
  const footer = (current, previous) => {
    const selisih = current - previous
    const tanda = selisih > 0 ? '+' : ''
    return { strong: `${tanda}${selisih}`, text: 'dari bulan lalu' }
  }
  // Granularitas tren otomatis: rentang pendek → harian, panjang → mingguan/bulanan
  const tren = useMemo(() => trenLeads(leads, { from: dateFrom, to: dateTo }), [leads, dateFrom, dateTo])
  const jenisData = useMemo(() => breakdownJenis(leads), [leads])

  const leaderboard = useMemo(
    () =>
      rekapSales.map((r) => ({
        ...r,
        persen_deal: r.persen_deal === null ? null : Number(r.persen_deal),
      })),
    [rekapSales]
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-text-primary">Dashboard</h1>
          <p className="mt-0.5 text-sm text-text-secondary">
            Rekap funnel &amp; performa sales
            {dateFrom && dateTo ? ` · ${formatTanggal(dateFrom)} – ${formatTanggal(dateTo)}` : ''}
          </p>
        </div>
        <div className="flex items-end gap-2">
          <DateRangePicker value={{ from: dateFrom, to: dateTo }} onChange={setDateRange} />
          <Button variant="secondary" onClick={load} disabled={loading}>
            {loading ? 'Memuat…' : 'Refresh'}
          </Button>
        </div>
      </div>

      {error && (
        <Card className="!p-4">
          <p className="text-sm text-red-800">Gagal memuat data: {error}</p>
        </Card>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <SummaryCard
          label="Total Leads"
          value={summary.total}
          delta={dTotal}
          footer={footer(summary.total, prevSummary.total)}
        />
        <SummaryCard
          label="Deal"
          value={summary.deal}
          delta={dDeal}
          footer={footer(summary.deal, prevSummary.deal)}
        />
        <SummaryCard
          label="No Deal"
          value={summary.noDeal}
          delta={dNoDeal}
          footer={footer(summary.noDeal, prevSummary.noDeal)}
        />
        <SummaryCard
          label="Proses"
          value={summary.proses}
          delta={dProses}
          footer={footer(summary.proses, prevSummary.proses)}
        />
        <SummaryCard
          label="% Deal"
          value={summary.persenDeal === null ? '—' : `${summary.persenDeal}%`}
          sub={summary.total > 0 ? `Omset: ${formatRupiah(summary.totalOmset)}` : undefined}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-semibold text-text-primary">Tren Leads Masuk</h2>
            <span className="rounded-full bg-gray-50 px-2.5 py-1 text-xs font-medium text-text-secondary">
              {tren.granularity === 'harian'
                ? 'Per hari'
                : tren.granularity === 'mingguan'
                  ? 'Per minggu'
                  : 'Per bulan'}
            </span>
          </div>
          {tren.data.length === 0 ? (
            <p className="py-16 text-center text-sm text-text-secondary">
              Belum ada data leads pada rentang ini.
            </p>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={tren.data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid stroke={GRID} vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11, fill: '#6b7280' }}
                    tickLine={false}
                    axisLine={{ stroke: GRID }}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: '#6b7280' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(14,165,233,0.08)' }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="total" name="Total" fill={SKY} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="deal" name="Deal" fill={EMERALD} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="noDeal" name="No Deal" fill={RED} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="proses" name="Proses" fill={AMBER} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-text-primary">Jenis Leads</h2>
          {jenisData.length === 0 ? (
            <p className="py-16 text-center text-sm text-text-secondary">
              Belum ada data pada rentang ini.
            </p>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={jenisData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius="55%"
                    outerRadius="80%"
                    paddingAngle={2}
                  >
                    {jenisData.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={entry.name === 'Iklan' ? SKY : SKY_SOFT}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>

      {/* Leaderboard sales */}
      <Card>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">Leaderboard Sales</h2>
            <p className="mt-1 text-xs text-text-secondary">
              Rekap seluruh leads (tidak terpengaruh filter tanggal di atas).
            </p>
          </div>
        </div>
        {leaderboard.length === 0 ? (
          <p className="text-sm text-text-secondary">Belum ada data sales.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] table-fixed text-sm">
            <colgroup>
              <col />
              <col className="w-[9%]" />
              <col className="w-[9%]" />
              <col className="w-[9%]" />
              <col className="w-[9%]" />
              <col className="w-[9%]" />
              <col className="w-[9%]" />
              <col className="w-[10%]" />
            </colgroup>
            <thead>
              <tr className="text-left text-sm font-medium text-text-secondary">
                <th className="pb-3 pr-4 font-medium">Sales</th>
                <th className="pb-3 text-center font-medium">Total</th>
                <th className="pb-3 text-center font-medium">Organik</th>
                <th className="pb-3 text-center font-medium">Iklan</th>
                <th className="pb-3 text-center font-medium">Deal</th>
                <th className="pb-3 text-center font-medium">No Deal</th>
                <th className="pb-3 text-center font-medium">Proses</th>
                <th className="pb-3 text-center font-medium">% Deal</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((r) => {
                const persen = r.persen_deal === null ? null : Number(r.persen_deal)
                return (
                  <tr
                    key={r.sales_id}
                    className="border-t border-border-default hover:bg-gray-50"
                  >
                    <td className="py-4 pr-4">
                      <span className="font-medium text-text-primary">
                        {(r.sales_nama ?? '')
                          .toLowerCase()
                          .replace(/(^|\s)\S/g, (c) => c.toUpperCase())}
                      </span>
                    </td>
                    <td className="py-4 text-center font-medium text-text-primary">
                      {r.jumlah_organik + r.jumlah_iklan}
                    </td>
                    <td className="py-4 text-center text-text-secondary">{r.jumlah_organik}</td>
                    <td className="py-4 text-center text-text-secondary">{r.jumlah_iklan}</td>
                    <td className="py-4 text-center text-text-secondary">{r.jumlah_deal}</td>
                    <td className="py-4 text-center text-text-secondary">{r.jumlah_no_deal}</td>
                    <td className="py-4 text-center text-text-secondary">{r.jumlah_proses}</td>
                    <td className="py-4 text-center text-text-primary">
                      {persen === null ? '—' : `${persen}%`}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          </div>
        )}
      </Card>
    </div>
  )
}
