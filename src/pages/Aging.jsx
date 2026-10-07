import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Pencil } from 'lucide-react'
import Card from '../components/Card.jsx'
import DropdownSelect from '../components/DropdownSelect.jsx'
import Modal from '../components/Modal.jsx'
import LeadsForm from '../components/LeadsForm.jsx'
import { AGING_TEXT, agingLevel, useAgingStore } from '../store/aging.js'
import { fetchAgingLeads } from '../lib/dashboard.js'
import { fetchSales, formatTanggal, updateLead } from '../lib/leads.js'

const THRESHOLD_OPTIONS = [3, 7, 14, 21, 30]

const LEVEL_LABEL = {
  normal: 'Normal',
  warning: 'Waspada',
  critical: 'Kritis',
}

export default function AgingPage() {
  const threshold = useAgingStore((s) => s.threshold)
  const setThreshold = useAgingStore((s) => s.setThreshold)

  const [leads, setLeads] = useState([])
  const [salesList, setSalesList] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Quick action: edit leads langsung dari halaman ini
  const [editingLead, setEditingLead] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchAgingLeads()
      setLeads(data)
    } catch (err) {
      toast.error(`Gagal memuat aging leads: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // oxlint-disable-next-line set-state-in-effect
    load()
  }, [load])

  useEffect(() => {
    fetchSales()
      .then(setSalesList)
      .catch((err) => toast.error(`Gagal memuat sales: ${err.message}`))
  }, [])

  // Batas waktu diterapkan di frontend (SCHEMA.md §4), sort by umur terlama tetap dari view.
  // null = belum dipilih → semua leads tampil tanpa filter.
  const filtered =
    threshold === null ? leads : leads.filter((l) => (l.aging_hari ?? 0) > threshold)

  const handleSubmit = async (payload) => {
    if (!editingLead) return
    setSaving(true)
    try {
      await updateLead(editingLead.id, payload)
      toast.success('Status leads berhasil diperbarui')
      setEditingLead(null)
      await load()
    } catch (err) {
      toast.error(`Gagal menyimpan: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-text-primary">Umur Leads</h1>
          <p className="mt-0.5 text-sm text-text-secondary">
            Leads status Proses yang sudah melewati batas waktu — perlu di-push.
          </p>
        </div>
        <DropdownSelect
          label="Batas Waktu"
          value={threshold === null ? null : String(threshold)}
          onChange={(v) => setThreshold(v === '' ? null : Number(v))}
          placeholder="Pilih batas waktu"
          className="w-44"
          options={[
            { value: '', label: 'Semua leads' },
            ...THRESHOLD_OPTIONS.map((t) => ({ value: String(t), label: `Lebih dari ${t} hari` })),
          ]}
        />
      </div>

      {/* Ringkasan level — tanpa batas waktu (null): tampil semua leads, kartu "—" */}
      <div className="grid grid-cols-3 gap-4">
        {(['warning', 'critical']).map((level) => {
          const count =
            threshold === null
              ? null
              : leads.filter((l) => agingLevel(l.aging_hari, threshold) === level).length
          return (
            <Card key={level} className="!p-4">
              <p className="text-xs uppercase tracking-wide text-text-secondary">
                {threshold === null
                  ? level === 'warning'
                    ? 'Waspada'
                    : 'Kritis'
                  : level === 'warning'
                    ? `Waspada (${threshold}–${threshold * 2} hari)`
                    : `Kritis (> ${threshold * 2} hari)`}
              </p>
              <p className={`mt-1 text-3xl font-bold ${level === 'warning' ? 'text-amber-800' : 'text-red-800'}`}>
                {count ?? '—'}
              </p>
            </Card>
          )
        })}
        <Card className="!p-4">
          <p className="text-xs uppercase tracking-wide text-text-secondary">
            Total Leads Proses
          </p>
          <p className="mt-1 text-3xl font-bold text-text-primary">{leads.length}</p>
        </Card>
      </div>

      {/* Tabel aging */}
      <Card className="!p-0 overflow-x-auto">
        {loading ? (
          <p className="p-6 text-sm text-text-secondary">Memuat data…</p>
        ) : filtered.length === 0 ? (
          <p className="p-6 text-sm text-text-secondary">
            {leads.length === 0
              ? 'Tidak ada leads dengan status Proses. Bagus!'
              : 'Tidak ada leads yang melewati batas waktu yang dipilih. Semua masih segar.'}
          </p>
        ) : (
          <table className="w-full min-w-[860px] text-sm">
            <thead>
              <tr className="bg-gray-50 text-center text-xs uppercase text-text-secondary">
                <th className="px-4 py-3 text-left font-medium">Nama</th>
                <th className="px-4 py-3 font-medium">No. HP</th>
                <th className="px-4 py-3 font-medium">Sales</th>
                <th className="px-4 py-3 font-medium">Blok Unit</th>
                <th className="px-4 py-3 font-medium">Tanggal Masuk</th>
                <th className="px-4 py-3 font-medium">Umur</th>
                <th className="px-4 py-3 font-medium">Tingkat</th>
                <th className="px-4 py-3 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((lead) => {
                const level = agingLevel(lead.aging_hari, threshold)
                return (
                  <tr
                    key={lead.id}
                    className="border-b border-border-default text-center last:border-0 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 text-left font-medium text-text-primary">{lead.nama}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-text-primary">
                      {lead.no_hp || '—'}
                    </td>
                    <td className="px-4 py-3 text-text-primary">{lead.sales_nama ?? '—'}</td>
                    <td className="px-4 py-3 text-text-primary">{lead.blok_unit || '—'}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-text-primary">
                      {formatTanggal(lead.tanggal_masuk)}
                    </td>
                    <td className={`whitespace-nowrap px-4 py-3 font-semibold ${AGING_TEXT[level]}`}>
                      {lead.aging_hari} hari
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          level === 'critical' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {LEVEL_LABEL[level]}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <button
                        type="button"
                        aria-label={`Update status ${lead.nama}`}
                        title="Update Status"
                        onClick={() => setEditingLead(lead)}
                        className="inline-flex rounded-lg p-1.5 text-text-secondary transition-colors hover:bg-primary-50 hover:text-primary-600"
                      >
                        <Pencil size={16} />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </Card>

      {/* Quick action: edit leads (form sama dengan Leads List) */}
      <Modal
        open={editingLead !== null}
        title="Update Status Leads"
        onClose={() => setEditingLead(null)}
      >
        {editingLead && (
          <div className={saving ? 'pointer-events-none opacity-60' : ''}>
            <LeadsForm
              mode="edit"
              lead={editingLead}
              salesList={salesList}
              onSubmit={handleSubmit}
              onClose={() => setEditingLead(null)}
            />
          </div>
        )}
      </Modal>
    </div>
  )
}
