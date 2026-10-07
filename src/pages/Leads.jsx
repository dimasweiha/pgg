import { useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { ChevronDown, Info, Pencil, Search, SlidersHorizontal, Trash2 } from 'lucide-react'
import Button from '../components/Button.jsx'
import Card from '../components/Card.jsx'
import Checkbox from '../components/Checkbox.jsx'
import DateRangePicker from '../components/DateRangePicker.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import Modal from '../components/Modal.jsx'
import ConfirmDialog from '../components/ConfirmDialog.jsx'
import LeadsForm from '../components/LeadsForm.jsx'
import LeadInfoModal from '../components/LeadInfoModal.jsx'
import { exportLeadsToExcel } from '../lib/exportExcel.js'
import {
  createLead,
  deleteLead,
  fetchCampaigns,
  fetchLeads,
  fetchSales,
  formatTanggal,
  hariIni,
  selisihHari,
  updateLead,
} from '../lib/leads.js'

const STATUS_OPTIONS = [
  { value: 'proses', label: 'Proses' },
  { value: 'deal', label: 'Deal' },
  { value: 'no_deal', label: 'No Deal' },
]

const JENIS_OPTIONS = [
  { value: 'iklan', label: 'Iklan' },
  { value: 'organik', label: 'Organik' },
]

/** Kolom durasi: lama proses (deal/no_deal) atau aging (proses) */
function DurasiCell({ lead }) {
  const today = hariIni()
  if (lead.status === 'proses') {
    const aging = selisihHari(today, lead.tanggal_masuk)
    return <span>{aging === null ? '-' : `${aging} hari`}</span>
  }
  const lama = selisihHari(lead.tanggal_keputusan, lead.tanggal_masuk)
  return <span>{lama === null ? '-' : `${lama} hari`}</span>
}

export default function LeadsPage() {
  const [searchParams] = useSearchParams()
  const paramQ = searchParams.get('q') ?? ''

  const [leads, setLeads] = useState([])
  const [salesList, setSalesList] = useState([])
  const [campaignList, setCampaignList] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [search, setSearch] = useState(paramQ)
  const [debouncedSearch, setDebouncedSearch] = useState(paramQ)
  const debounceRef = useRef(null)
  // Filter multi-pilih (array kosong = tanpa filter)
  const [filterSales, setFilterSales] = useState([])
  const [filterStatus, setFilterStatus] = useState([])
  const [filterJenis, setFilterJenis] = useState([])
  const [dateRange, setDateRange] = useState({ from: '', to: '' })
  const [filterOpen, setFilterOpen] = useState(false)

  const [modalMode, setModalMode] = useState(null) // 'create' | 'edit' | null
  const [editingLead, setEditingLead] = useState(null)
  const [infoLead, setInfoLead] = useState(null) // lead object | null — modal lihat detail
  const [confirmDelete, setConfirmDelete] = useState(null) // lead object | null

  // Debounce search 400ms di dalam event handler (bukan di effect)
  // supaya tidak memicu cascading render
  const handleSearchChange = (e) => {
    const value = e.target.value
    setSearch(value)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setDebouncedSearch(value.trim()), 400)
  }

  // Bersihkan timer debounce saat unmount
  useEffect(() => () => clearTimeout(debounceRef.current), [])

  // Tutup popover Filter saat klik di luar atau tekan Escape
  const filterRef = useRef(null)
  useEffect(() => {
    if (!filterOpen) return undefined
    const handlePointerDown = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) setFilterOpen(false)
    }
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setFilterOpen(false)
    }
    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [filterOpen])

  // Sinkron search dari sidebar (URL ?q=) ke state halaman
  useEffect(() => {
    // oxlint-disable-next-line set-state-in-effect
    setSearch(paramQ)
    // oxlint-disable-next-line set-state-in-effect
    setDebouncedSearch(paramQ)
  }, [paramQ])

  const loadLeads = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchLeads({
        search: debouncedSearch,
        salesIds: filterSales,
        statusList: filterStatus,
        jenisList: filterJenis,
        dateFrom: dateRange.from || undefined,
        dateTo: dateRange.to || undefined,
      })
      setLeads(data)
    } catch (err) {
      toast.error(`Gagal memuat leads: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, filterSales, filterStatus, filterJenis, dateRange])
  // Sales & campaign untuk dropdown form — load sekali
  useEffect(() => {
    fetchSales()
      .then(setSalesList)
      .catch((err) => toast.error(`Gagal memuat sales: ${err.message}`))
    fetchCampaigns()
      .then(setCampaignList)
      .catch((err) => toast.error(`Gagal memuat campaign: ${err.message}`))
  }, [])

  // Data-fetching on mount + saat filter berubah — pola standar;
  // setLoading sinkron di sini memang disengaja (UI loading state).
  useEffect(() => {
    // oxlint-disable-next-line set-state-in-effect
    loadLeads()
  }, [loadLeads])

  const openCreate = () => {
    setEditingLead(null)
    setModalMode('create')
  }

  const openEdit = (lead) => {
    setEditingLead(lead)
    setModalMode('edit')
  }

  const closeModal = () => {
    setModalMode(null)
    setEditingLead(null)
  }

  const handleSubmit = async (payload) => {
    setSaving(true)
    try {
      if (modalMode === 'edit' && editingLead) {
        await updateLead(editingLead.id, payload)
        toast.success('Leads berhasil diperbarui')
      } else {
        await createLead({ ...payload, status: 'proses' })
        toast.success('Leads baru berhasil ditambahkan')
      }
      closeModal()
      await loadLeads()
    } catch (err) {
      toast.error(`Gagal menyimpan: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirmDelete) return
    try {
      await deleteLead(confirmDelete.id)
      toast.success('Leads berhasil dihapus')
      setConfirmDelete(null)
      await loadLeads()
    } catch (err) {
      toast.error(`Gagal menghapus: ${err.message}`)
    }
  }

  const hasActiveFilter =
    debouncedSearch ||
    filterSales.length > 0 ||
    filterStatus.length > 0 ||
    filterJenis.length > 0 ||
    dateRange.from ||
    dateRange.to

  // Jumlah pilihan aktif di popover Filter (untuk badge angka)
  const activeFilterCount = filterSales.length + filterStatus.length + filterJenis.length

  // Toggle satu nilai di dalam array filter (multi-pilih)
  const toggleFilterValue = (setter) => (value) => {
    setter((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]))
  }

  const handleExport = () => {
    if (leads.length === 0) {
      toast.error('Tidak ada data untuk di-export')
      return
    }
    try {
      const filename = exportLeadsToExcel(leads)
      toast.success(`Export berhasil: ${filename}`)
    } catch (err) {
      toast.error(`Gagal export: ${err.message}`)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-text-primary">Leads</h1>
          <p className="mt-0.5 text-sm text-text-secondary">
            {loading ? 'Memuat…' : `${leads.length} leads`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={handleExport}>
            Export Excel
          </Button>
          <Button onClick={openCreate}>+ Tambah Leads</Button>
        </div>
      </div>

      {/* Search & filter — tanpa kotak card; Filter + tanggal mentok kanan */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex min-w-[220px] flex-1 items-center gap-2 rounded-lg border border-border-default bg-surface px-3 py-2 transition-colors focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-500/20">
          <Search size={16} className="shrink-0 text-text-secondary" />
          <input
            value={search}
            onChange={handleSearchChange}
            placeholder="Cari nama atau no. HP…"
            className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-secondary focus:outline-none"
          />
        </div>
        <div className="ml-auto flex items-center gap-3">
          <div className="relative" ref={filterRef}>
          <button
            type="button"
            aria-haspopup="true"
            aria-expanded={filterOpen}
            onClick={() => setFilterOpen((v) => !v)}
            className={`flex items-center gap-2 rounded-lg border px-3.5 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/30 ${
              filterOpen || activeFilterCount > 0
                ? 'border-sky-500 bg-sky-50 text-sky-700'
                : 'border-border-default bg-surface text-text-primary hover:bg-gray-50'
            }`}
          >
            <SlidersHorizontal size={15} />
            Filter
            {activeFilterCount > 0 && (
              <span className="inline-flex min-w-[20px] items-center justify-center rounded-full bg-sky-500 px-1.5 py-0.5 text-[11px] font-semibold leading-none text-white">
                {activeFilterCount}
              </span>
            )}
            <ChevronDown size={14} className={`transition-transform ${filterOpen ? 'rotate-180' : ''}`} />
          </button>

          {filterOpen && (
            <div className="absolute right-0 z-30 mt-2 max-h-[70vh] w-72 overflow-y-auto rounded-xl border border-border-default bg-surface p-4 shadow-lg">
              {/* Seksi Sales */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
                    Sales
                  </p>
                  {filterSales.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setFilterSales([])}
                      className="text-xs font-medium text-sky-600 hover:text-sky-700"
                    >
                      Bersihkan
                    </button>
                  )}
                </div>
                {salesList.length === 0 ? (
                  <p className="px-2 py-1 text-sm text-text-secondary">Belum ada sales</p>
                ) : (
                  <div className="space-y-1">
                    {salesList.map((s) => {
                      const checked = filterSales.includes(s.id)
                      return (
                        <label
                          key={s.id}
                          className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 text-sm text-text-primary hover:bg-gray-50"
                        >
                          <Checkbox checked={checked} onChange={() => toggleFilterValue(setFilterSales)(s.id)} />
                          {s.nama}
                        </label>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Seksi Status */}
              <div className="mt-4 border-t border-border-default pt-4">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
                    Status
                  </p>
                  {filterStatus.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setFilterStatus([])}
                      className="text-xs font-medium text-sky-600 hover:text-sky-700"
                    >
                      Bersihkan
                    </button>
                  )}
                </div>
                <div className="space-y-1">
                  {STATUS_OPTIONS.map((o) => {
                    const checked = filterStatus.includes(o.value)
                    return (
                      <label
                        key={o.value}
                        className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 text-sm text-text-primary hover:bg-gray-50"
                      >
                        <Checkbox checked={checked} onChange={() => toggleFilterValue(setFilterStatus)(o.value)} />
                        {o.label}
                      </label>
                    )
                  })}
                </div>
              </div>

              {/* Seksi Jenis */}
              <div className="mt-4 border-t border-border-default pt-4">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
                    Jenis
                  </p>
                  {filterJenis.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setFilterJenis([])}
                      className="text-xs font-medium text-sky-600 hover:text-sky-700"
                    >
                      Bersihkan
                    </button>
                  )}
                </div>
                <div className="space-y-1">
                  {JENIS_OPTIONS.map((o) => {
                    const checked = filterJenis.includes(o.value)
                    return (
                      <label
                        key={o.value}
                        className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 text-sm text-text-primary hover:bg-gray-50"
                      >
                        <Checkbox checked={checked} onChange={() => toggleFilterValue(setFilterJenis)(o.value)} />
                        {o.label}
                      </label>
                    )
                  })}
                </div>
              </div>

              {activeFilterCount > 0 && (
                <div className="mt-4 border-t border-border-default pt-3">
                  <button
                    type="button"
                    onClick={() => {
                      setFilterSales([])
                      setFilterStatus([])
                      setFilterJenis([])
                    }}
                    className="text-xs font-medium text-text-secondary hover:text-red-600"
                  >
                    Hapus semua pilihan
                  </button>
                </div>
              )}
            </div>
          )}
          </div>
          <DateRangePicker value={dateRange} onChange={setDateRange} />
        </div>
      </div>

      {/* Tabel */}
      <Card className="!p-0 overflow-x-auto">
        {loading ? (
          <p className="p-6 text-sm text-text-secondary">Memuat data leads…</p>
        ) : leads.length === 0 ? (
          <p className="p-6 text-sm text-text-secondary">
            {hasActiveFilter
              ? 'Tidak ada leads yang cocok dengan filter. Coba ubah filter atau reset.'
              : 'Belum ada leads. Klik “Tambah Leads” untuk input pertama.'}
          </p>
        ) : (
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="bg-gray-50 text-center text-xs uppercase text-text-secondary">
                <th className="px-4 py-3 text-left font-medium">Nama</th>
                <th className="px-4 py-3 font-medium">No. HP</th>
                <th className="px-4 py-3 font-medium">Jenis</th>
                <th className="px-4 py-3 font-medium">Sales</th>
                <th className="px-4 py-3 font-medium">Tgl Masuk</th>
                <th className="px-4 py-3 font-medium">Blok Unit</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Lama Proses</th>
                <th className="px-4 py-3 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr
                  key={lead.id}
                  className="border-b border-border-default text-center last:border-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-3 text-left font-medium text-text-primary">{lead.nama}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-text-primary">
                    {lead.no_hp || '-'}
                  </td>
                  <td className="px-4 py-3 capitalize text-text-primary">{lead.jenis}</td>
                  <td className="px-4 py-3 text-text-primary">{lead.sales?.nama ?? '—'}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-text-secondary">
                    {formatTanggal(lead.tanggal_masuk)}
                  </td>
                  <td className="px-4 py-3 text-text-primary">{lead.blok_unit || '—'}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={lead.status} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-text-primary">
                    <DurasiCell lead={lead} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <button
                      type="button"
                      aria-label={`Info ${lead.nama}`}
                      title="Info"
                      onClick={() => setInfoLead(lead)}
                      className="inline-flex rounded-lg p-1.5 text-text-secondary transition-colors hover:bg-primary-50 hover:text-primary-600"
                    >
                      <Info size={16} />
                    </button>
                    <button
                      type="button"
                      aria-label={`Edit ${lead.nama}`}
                      title="Edit"
                      onClick={() => openEdit(lead)}
                      className="ml-1 inline-flex rounded-lg p-1.5 text-text-secondary transition-colors hover:bg-sky-50 hover:text-sky-600"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      type="button"
                      aria-label={`Hapus ${lead.nama}`}
                      title="Hapus"
                      onClick={() => setConfirmDelete(lead)}
                      className="ml-1 inline-flex rounded-lg p-1.5 text-text-secondary transition-colors hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {/* Modal tambah/edit */}
      <Modal
        open={modalMode !== null}
        title={modalMode === 'edit' ? 'Edit Leads' : 'Tambah Leads'}
        onClose={closeModal}
      >
        {modalMode !== null && (
          <div className={saving ? 'pointer-events-none opacity-60' : ''}>
            <LeadsForm
              mode={modalMode}
              lead={editingLead}
              salesList={salesList}
              campaignList={campaignList}
              onSubmit={handleSubmit}
              onClose={closeModal}
            />
          </div>
        )}
      </Modal>

      {/* Modal info (lihat detail) */}
      {infoLead && <LeadInfoModal lead={infoLead} onClose={() => setInfoLead(null)} />}

      {/* Konfirmasi hapus */}
      <ConfirmDialog
        open={confirmDelete !== null}
        title="Hapus Leads"
        message={
          confirmDelete
            ? `Hapus leads "${confirmDelete.nama}" (${confirmDelete.no_hp || '-'})? Tindakan ini tidak bisa dibatalkan.`
            : ''
        }
        onConfirm={handleDelete}
        onClose={() => setConfirmDelete(null)}
      />
    </div>
  )
}
