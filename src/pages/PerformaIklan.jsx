import { useCallback, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { ChevronLeft, ChevronRight, Pencil } from 'lucide-react'
import Button from '../components/Button.jsx'
import Card from '../components/Card.jsx'
import DropdownSelect from '../components/DropdownSelect.jsx'
import Input from '../components/Input.jsx'
import Modal from '../components/Modal.jsx'
import {
  costPerChat,
  costPerResult,
  deleteIklanHarian,
  fetchIklanHarian,
  formatRupiahSingkat,
  mqlRatio,
  upsertIklanHarian,
} from '../lib/iklan.js'

/**
 * Performa Iklan — angka operasional iklan harian (mirip sheet Excel
 * Dimas): 1 baris = 1 tanggal. Input manual: Spent, Result Dashboard,
 * Real Chat, MQL, No Respon. Cost per Result, Cost per Real Chat, dan
 * MQL Ratio dihitung otomatis. Baris TOTAL di akhir bulan.
 */

const BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]

function isoDate(y, m, d) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

/** Jumlah hari dalam sebulan (m: 0-11) */
function jumlahHari(y, m) {
  return new Date(y, m + 1, 0).getDate()
}

function tanggalIndo(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return `${d} ${BULAN[m - 1]} ${y}`
}

const F_NOL = (n) => (n ? String(n) : '0')

/** Baris kosong untuk tanggal tanpa data */
function barisKosong(tanggal) {
  return {
    tanggal,
    spent: null,
    result_dashboard: null,
    real_chat: null,
    mql: null,
    no_respon: null,
  }
}

/** Tanggal sekarang — dihitung sekali di module level (purity) */
const SEKARANG = new Date()

/** Pilihan tahun untuk dropdown: 2024 s/d tahun depan */
const DAFTAR_TAHUN = Array.from(
  { length: SEKARANG.getFullYear() + 1 - 2024 + 1 },
  (_, i) => 2024 + i,
)

export default function PerformaIklanPage() {
  const [tahun, setTahun] = useState(SEKARANG.getFullYear())
  const [bulan, setBulan] = useState(SEKARANG.getMonth()) // 0-11
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [editTanggal, setEditTanggal] = useState(null) // iso | null
  const [confirmReset, setConfirmReset] = useState(null) // iso | null

  const tanggalAwal = useMemo(() => isoDate(tahun, bulan, 1), [tahun, bulan])
  const tanggalAkhir = useMemo(
    () => isoDate(tahun, bulan, jumlahHari(tahun, bulan)),
    [tahun, bulan],
  )

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchIklanHarian(tanggalAwal, tanggalAkhir)
      setRows(data)
    } catch (err) {
      toast.error(`Gagal memuat data iklan: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }, [tanggalAwal, tanggalAkhir])

  useEffect(() => {
    // oxlint-disable-next-line set-state-in-effect
    load()
  }, [load])

  /** Map tanggal → data (baris tanggal tanpa data tetap tampil) */
  const dataByTanggal = useMemo(() => {
    const map = new Map(rows.map((r) => [r.tanggal, r]))
    const all = []
    for (let d = 1; d <= jumlahHari(tahun, bulan); d++) {
      all.push(map.get(isoDate(tahun, bulan, d)) ?? barisKosong(isoDate(tahun, bulan, d)))
    }
    return all
  }, [rows, tahun, bulan])

  const total = useMemo(
    () =>
      rows.reduce(
        (acc, r) => ({
          spent: acc.spent + Number(r.spent ?? 0),
          result_dashboard: acc.result_dashboard + Number(r.result_dashboard ?? 0),
          real_chat: acc.real_chat + Number(r.real_chat ?? 0),
          mql: acc.mql + Number(r.mql ?? 0),
          no_respon: acc.no_respon + Number(r.no_respon ?? 0),
        }),
        { spent: 0, result_dashboard: 0, real_chat: 0, mql: 0, no_respon: 0 },
      ),
    [rows],
  )

  const pindahBulan = (delta) => {
    const d = new Date(tahun, bulan + delta, 1)
    setTahun(d.getFullYear())
    setBulan(d.getMonth())
  }

  const hariIniIso = isoDate(SEKARANG.getFullYear(), SEKARANG.getMonth(), SEKARANG.getDate())
  const bisaLompatHariIni =
    tahun !== SEKARANG.getFullYear() || bulan !== SEKARANG.getMonth()

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-text-primary">Performa Iklan</h1>
          <p className="mt-0.5 text-sm text-text-secondary">
            Angka operasional iklan harian — klik tanggal untuk mengisi. Cost &amp; rasio dihitung otomatis.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {bisaLompatHariIni && (
            <Button variant="secondary" onClick={() => { setTahun(SEKARANG.getFullYear()); setBulan(SEKARANG.getMonth()) }}>
              Bulan ini
            </Button>
          )}
          {/* Lompat langsung: dropdown Bulan + Tahun (permintaan Dimas —
              chevron ‹ › saja kelamaan kalau mau cek tahun 2025) */}
          <DropdownSelect
            className="w-[140px]"
            value={String(bulan)}
            onChange={(v) => setBulan(Number(v))}
            options={BULAN.map((b, i) => ({ value: String(i), label: b }))}
          />
          <DropdownSelect
            className="w-[100px]"
            value={String(tahun)}
            onChange={(v) => setTahun(Number(v))}
            options={DAFTAR_TAHUN.map((t) => ({ value: String(t), label: String(t) }))}
          />
          <div className="flex items-center rounded-lg border border-border-default bg-surface">
            <button
              type="button"
              onClick={() => pindahBulan(-1)}
              aria-label="Bulan sebelumnya"
              className="p-2 text-text-secondary hover:text-text-primary"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={() => pindahBulan(1)}
              aria-label="Bulan berikutnya"
              className="p-2 text-text-secondary hover:text-text-primary"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <Card className="!p-0 overflow-x-auto">
        {loading ? (
          <p className="p-6 text-sm text-text-secondary">Memuat data…</p>
        ) : (
          <table className="w-full min-w-[1150px] text-sm whitespace-nowrap">
            <thead>
              <tr className="bg-gray-50 text-xs uppercase text-text-secondary">
                <th className="px-4 py-3 text-left font-medium">Tanggal</th>
                <th className="px-4 py-3 text-center font-medium">Spent Meta Ads</th>
                <th className="px-4 py-3 text-center font-medium">Result Dashboard</th>
                <th className="px-4 py-3 text-center font-medium">Cost per Result</th>
                <th className="px-4 py-3 text-center font-medium">Real Chat</th>
                <th className="px-4 py-3 text-center font-medium">Cost per Real Chat</th>
                <th className="px-4 py-3 text-center font-medium">MQL</th>
                <th className="px-4 py-3 text-center font-medium">MQL Ratio</th>
                <th className="px-4 py-3 text-center font-medium">No Respon</th>
                <th className="px-4 py-3 text-center font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {dataByTanggal.map((r) => {
                const kosong =
                  r.spent == null && r.result_dashboard == null && r.real_chat == null &&
                  r.mql == null && r.no_respon == null
                return (
                  <tr
                    key={r.tanggal}
                    className={`border-b border-border-default last:border-0 ${
                      kosong ? 'text-text-secondary/50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <td className="px-4 py-2.5 text-left font-medium text-text-primary">
                      {tanggalIndo(r.tanggal)}
                      {r.tanggal === hariIniIso && (
                        <span className="ml-2 rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-medium text-sky-700">
                          Hari ini
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-center">{r.spent == null ? '-' : formatRupiahSingkat(Number(r.spent))}</td>
                    <td className="px-4 py-2.5 text-center">{r.result_dashboard == null ? '-' : F_NOL(r.result_dashboard)}</td>
                    <td className="px-4 py-2.5 text-center">{formatRupiahSingkat(costPerResult(Number(r.spent ?? 0), r.result_dashboard))}</td>
                    <td className="px-4 py-2.5 text-center">{r.real_chat == null ? '-' : F_NOL(r.real_chat)}</td>
                    <td className="px-4 py-2.5 text-center">{formatRupiahSingkat(costPerChat(Number(r.spent ?? 0), r.real_chat))}</td>
                    <td className="px-4 py-2.5 text-center">{r.mql == null ? '-' : F_NOL(r.mql)}</td>
                    <td className="px-4 py-2.5 text-center">
                      {mqlRatio(r.mql, r.real_chat) === null ? '-' : `${mqlRatio(r.mql, r.real_chat).toFixed(1)}%`}
                    </td>
                    <td className="px-4 py-2.5 text-center">{r.no_respon == null ? '-' : F_NOL(r.no_respon)}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center justify-center">
                        <button
                          type="button"
                          aria-label={`Isi data ${tanggalIndo(r.tanggal)}`}
                          title={kosong ? 'Isi data' : 'Ubah data'}
                          onClick={() => setEditTanggal(r.tanggal)}
                          className={`rounded-lg p-1.5 transition-colors ${
                            kosong
                              ? 'text-text-secondary/50 hover:bg-sky-50 hover:text-sky-600'
                              : 'text-text-secondary hover:bg-sky-50 hover:text-sky-600'
                          }`}
                        >
                          <Pencil size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {/* Baris TOTAL */}
              <tr className="bg-gray-50 font-semibold text-text-primary">
                <td className="px-4 py-3 text-left">TOTAL</td>
                <td className="px-4 py-3 text-center">{formatRupiahSingkat(total.spent)}</td>
                <td className="px-4 py-3 text-center">{total.result_dashboard}</td>
                <td className="px-4 py-3 text-center">{formatRupiahSingkat(costPerResult(total.spent, total.result_dashboard))}</td>
                <td className="px-4 py-3 text-center">{total.real_chat}</td>
                <td className="px-4 py-3 text-center">{formatRupiahSingkat(costPerChat(total.spent, total.real_chat))}</td>
                <td className="px-4 py-3 text-center">{total.mql}</td>
                <td className="px-4 py-3 text-center">
                  {mqlRatio(total.mql, total.real_chat) === null ? '-' : `${mqlRatio(total.mql, total.real_chat).toFixed(1)}%`}
                </td>
                <td className="px-4 py-3 text-center">{total.no_respon}</td>
                <td className="px-4 py-3" />
              </tr>
            </tbody>
          </table>
        )}
      </Card>

      {editTanggal && (
        <IklanHarianModal
          tanggal={editTanggal}
          existing={rows.find((r) => r.tanggal === editTanggal) ?? null}
          onClose={() => setEditTanggal(null)}
          onSaved={async () => {
            setEditTanggal(null)
            await load()
          }}
        />
      )}

      {confirmReset && (
        <Modal open title="Hapus data tanggal ini?" onClose={() => setConfirmReset(null)}>
          <p className="text-sm text-text-secondary">
            Data {tanggalIndo(confirmReset)} akan dihapus. Lanjutkan?
          </p>
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setConfirmReset(null)}>Batal</Button>
            <Button
              variant="danger"
              onClick={async () => {
                try {
                  await deleteIklanHarian(confirmReset)
                  toast.success('Data berhasil dihapus')
                  setConfirmReset(null)
                  await load()
                } catch (err) {
                  toast.error(err.message)
                }
              }}
            >
              Hapus
            </Button>
          </div>
        </Modal>
      )}
    </div>
  )
}

/** Modal input 5 angka untuk satu tanggal */
function IklanHarianModal({ tanggal, existing, onClose, onSaved }) {
  const [spent, setSpent] = useState(existing?.spent != null ? String(existing.spent) : '')
  const [result, setResult] = useState(existing?.result_dashboard != null ? String(existing.result_dashboard) : '')
  const [realChat, setRealChat] = useState(existing?.real_chat != null ? String(existing.real_chat) : '')
  const [mql, setMql] = useState(existing?.mql != null ? String(existing.mql) : '')
  const [noRespon, setNoRespon] = useState(existing?.no_respon != null ? String(existing.no_respon) : '')
  const [saving, setSaving] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await upsertIklanHarian({
        tanggal,
        spent: Number(spent) || 0,
        result_dashboard: Number(result) || 0,
        real_chat: Number(realChat) || 0,
        mql: Number(mql) || 0,
        no_respon: Number(noRespon) || 0,
      })
      toast.success(`Data ${tanggalIndo(tanggal)} tersimpan`)
      onSaved()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open title={`Isi Data — ${tanggalIndo(tanggal)}`} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <Input
          label="Spent Meta Ads (Rp)"
          inputMode="numeric"
          placeholder="misal: 150000"
          value={spent}
          onChange={(e) => setSpent(e.target.value.replace(/[^\d]/g, ''))}
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Result Dashboard"
            inputMode="numeric"
            placeholder="0"
            value={result}
            onChange={(e) => setResult(e.target.value.replace(/[^\d]/g, ''))}
          />
          <Input
            label="Real Chat"
            inputMode="numeric"
            placeholder="0"
            value={realChat}
            onChange={(e) => setRealChat(e.target.value.replace(/[^\d]/g, ''))}
          />
          <Input
            label="MQL"
            inputMode="numeric"
            placeholder="0"
            value={mql}
            onChange={(e) => setMql(e.target.value.replace(/[^\d]/g, ''))}
          />
          <Input
            label="No Respon"
            inputMode="numeric"
            placeholder="0"
            value={noRespon}
            onChange={(e) => setNoRespon(e.target.value.replace(/[^\d]/g, ''))}
          />
        </div>
        <p className="text-xs text-text-secondary">
          Cost per Result, Cost per Real Chat, dan MQL Ratio dihitung otomatis — tidak perlu diisi.
        </p>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>Batal</Button>
          <Button type="submit" disabled={saving}>
            {saving ? 'Menyimpan…' : 'Simpan'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
