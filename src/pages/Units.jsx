import { useCallback, useEffect, useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import Card from '../components/Card.jsx'
import { fetchUnitBreakdown } from '../lib/dashboard.js'
import toast from 'react-hot-toast'

const SKY = '#0ea5e9'
const GRID = '#e9e9f0'

/** Tooltip chart — konsisten dengan Dashboard (DESIGN.md §8) */
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-md border border-border-default bg-white px-3 py-2 text-xs shadow-sm">
      <p className="font-medium text-text-primary">{labelBlok(label)}</p>
      {payload.map((p) => (
        <p key={p.dataKey ?? p.name} className="text-text-secondary">
          {p.name}: <span className="font-medium text-text-primary">{p.value}</span>
        </p>
      ))}
    </div>
  )
}

/** Label blok: kapital huruf pertama (revisi Dimas 6 Okt — "blok A2" → "Blok A2") */
function labelBlok(nilai) {
  if (!nilai) return ''
  const s = String(nilai).trim()
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export default function UnitsPage() {
  const [units, setUnits] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchUnitBreakdown()
      setUnits(data)
    } catch (err) {
      toast.error(`Gagal memuat unit breakdown: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // oxlint-disable-next-line set-state-in-effect
    load()
  }, [load])

  // % deal per unit dihitung di frontend (bukan kolom view)
  const detail = useMemo(
    () =>
      units.map((u) => ({
        ...u,
        persen_deal:
          u.jumlah_leads > 0 ? Math.round((u.jumlah_deal / u.jumlah_leads) * 1000) / 10 : 0,
      })),
    [units]
  )

  const maxLeads = detail.reduce((m, u) => Math.max(m, u.jumlah_leads), 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-text-primary">Unit Breakdown</h1>
        <p className="mt-0.5 text-sm text-text-secondary">
          Blok/unit yang paling diminati leads — dari seluruh data, semua status.
        </p>
      </div>

      {loading ? (
        <Card>
          <p className="text-sm text-text-secondary">Memuat data…</p>
        </Card>
      ) : detail.length === 0 ? (
        <Card>
          <p className="text-sm text-text-secondary">
            Belum ada leads dengan blok unit terisi. Isi field “Blok Unit” di form leads untuk
            melihat breakdown di sini.
          </p>
        </Card>
      ) : (
        <>
          {/* Chart ranking horizontal */}
          <Card>
            <h2 className="mb-4 text-lg font-semibold text-text-primary">
              Ranking Minat per Blok
            </h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={detail}
                  layout="vertical"
                  margin={{ top: 4, right: 24, left: 8, bottom: 0 }}
                >
                  <CartesianGrid stroke={GRID} horizontal={false} />
                  <XAxis
                    type="number"
                    allowDecimals={false}
                    domain={[0, maxLeads]}
                    tick={{ fontSize: 11, fill: '#6b7280' }}
                    tickLine={false}
                    axisLine={{ stroke: GRID }}
                  />
                  <YAxis
                    type="category"
                    dataKey="blok_unit"
                    width={70}
                    tickFormatter={(v) => labelBlok(v)}
                    tick={{ fontSize: 12, fill: '#1a1d23' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(14,165,233,0.08)' }} />
                  <Bar
                    dataKey="jumlah_leads"
                    name="Jumlah Leads"
                    fill={SKY}
                    radius={[0, 4, 4, 0]}
                    barSize={22}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Tabel detail */}
          <Card className="!p-0 overflow-x-auto">
            <div className="p-6 pb-0">
              <h2 className="text-lg font-semibold text-text-primary">Detail per Unit</h2>
              <p className="mt-1 text-xs text-text-secondary">
                Jumlah leads yang menyebut unit, dan berapa yang akhirnya deal.
              </p>
            </div>
            <table className="mt-4 w-full min-w-[520px] text-sm">
              <thead>
                <tr className="bg-gray-50 text-xs uppercase text-text-secondary">
                  <th className="px-4 py-3 text-left font-medium">Blok Unit</th>
                  <th className="px-4 py-3 text-center font-medium">Jumlah Leads</th>
                  <th className="px-4 py-3 text-center font-medium">Deal</th>
                  <th className="px-4 py-3 text-center font-medium">% Deal</th>
                </tr>
              </thead>
              <tbody>
                {detail.map((u) => (
                  <tr
                    key={u.blok_unit}
                    className="border-b border-border-default last:border-0 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 text-left font-medium text-text-primary">
                      {labelBlok(u.blok_unit)}
                    </td>
                    <td className="px-4 py-3 text-center text-text-primary">{u.jumlah_leads}</td>
                    <td className="px-4 py-3 text-center text-text-primary">{u.jumlah_deal}</td>
                    <td className="px-4 py-3 text-center text-text-primary">{u.persen_deal}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </>
      )}
    </div>
  )
}
