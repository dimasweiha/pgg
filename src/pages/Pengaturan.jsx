import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Pencil, Plus, Power, Trash2 } from 'lucide-react'
import Card from '../components/Card.jsx'
import Button from '../components/Button.jsx'
import Modal from '../components/Modal.jsx'
import ConfirmDialog from '../components/ConfirmDialog.jsx'
import { createSales, deleteSales, fetchAllSales, renameSales, setSalesActive } from '../lib/sales.js'

/**
 * Pengaturan — kelola master data nama sales (revisi Dimas 6 Okt).
 * Tabel `sales` bukan akun login: tambah, rename, aktif/nonaktif, hapus.
 * Sales nonaktif tidak muncul di dropdown form leads, tapi tetap
 * tampil di riwayat leads lama.
 */

function SalesFormModal({ open, mode, sales, onClose, onSaved }) {
  const isEdit = mode === 'edit'
  const [nama, setNama] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    // oxlint-disable-next-line set-state-in-effect
    setNama(isEdit ? (sales?.nama ?? '') : '')
  }, [open, isEdit, sales])

  const submit = async (e) => {
    e.preventDefault()
    if (!nama.trim()) return
    setSaving(true)
    try {
      if (isEdit) {
        await renameSales(sales.id, nama)
        toast.success('Nama sales berhasil diubah')
      } else {
        await createSales(nama)
        toast.success('Sales baru berhasil ditambahkan')
      }
      onSaved()
      onClose()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} title={isEdit ? 'Ubah Nama Sales' : 'Tambah Sales'} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label
            htmlFor="sales-nama"
            className="mb-1 block text-xs uppercase tracking-wide text-text-secondary"
          >
            Nama Sales
          </label>
          <input
            id="sales-nama"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            placeholder="misal: Budi Santoso"
            autoFocus
            className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm text-text-primary transition-colors focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" disabled={saving || !nama.trim()}>
            {saving ? 'Menyimpan…' : isEdit ? 'Simpan' : 'Tambah'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default function PengaturanPage() {
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)

  const [modalMode, setModalMode] = useState(null) // 'create' | 'edit' | null
  const [editingSales, setEditingSales] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [busyId, setBusyId] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchAllSales()
      setSales(data)
    } catch (err) {
      toast.error(`Gagal memuat sales: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // oxlint-disable-next-line set-state-in-effect
    load()
  }, [load])

  const toggleActive = async (s) => {
    setBusyId(s.id)
    try {
      await setSalesActive(s.id, !s.is_active)
      toast.success(s.is_active ? `${s.nama} dinonaktifkan` : `${s.nama} diaktifkan kembali`)
      await load()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setBusyId(null)
    }
  }

  const handleDelete = async () => {
    if (!confirmDelete) return
    setBusyId(confirmDelete.id)
    try {
      await deleteSales(confirmDelete.id)
      toast.success('Sales berhasil dihapus')
      setConfirmDelete(null)
      await load()
    } catch (err) {
      toast.error(err.message)
      setConfirmDelete(null)
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-text-primary">Pengaturan</h1>
          <p className="mt-0.5 text-sm text-text-secondary">
            Kelola daftar nama sales yang bisa dipilih di form leads.
          </p>
        </div>
        <Button onClick={() => setModalMode('create')}>
          <span className="flex items-center gap-1.5">
            <Plus size={16} />
            Tambah Sales
          </span>
        </Button>
      </div>

      <Card className="!p-0 overflow-x-auto">
        {loading ? (
          <p className="p-6 text-sm text-text-secondary">Memuat data…</p>
        ) : sales.length === 0 ? (
          <p className="p-6 text-sm text-text-secondary">
            Belum ada sales. Klik "Tambah Sales" untuk menambahkan yang pertama.
          </p>
        ) : (
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="bg-gray-50 text-xs uppercase text-text-secondary">
                <th className="px-4 py-3 text-left font-medium">Nama Sales</th>
                <th className="px-4 py-3 text-center font-medium">Status</th>
                <th className="px-4 py-3 text-center font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((s) => (
                <tr
                  key={s.id}
                  className="border-b border-border-default last:border-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-3 text-left font-medium text-text-primary">
                    {s.nama}
                    {s.is_active === false && (
                      <span className="ml-2 text-xs font-normal text-text-secondary">(nonaktif)</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        s.is_active === false
                          ? 'bg-gray-100 text-text-secondary'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {s.is_active === false ? 'Nonaktif' : 'Aktif'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        title="Ubah nama"
                        aria-label="Ubah nama"
                        onClick={() => {
                          setEditingSales(s)
                          setModalMode('edit')
                        }}
                        className="rounded-lg p-1.5 text-text-secondary transition-colors hover:bg-primary-50 hover:text-primary-600"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        type="button"
                        title={s.is_active === false ? 'Aktifkan' : 'Nonaktifkan'}
                        aria-label={s.is_active === false ? 'Aktifkan' : 'Nonaktifkan'}
                        disabled={busyId === s.id}
                        onClick={() => toggleActive(s)}
                        className={`rounded-lg p-1.5 transition-colors ${
                          s.is_active === false
                            ? 'text-text-secondary hover:bg-emerald-50 hover:text-emerald-600'
                            : 'text-text-secondary hover:bg-amber-50 hover:text-amber-600'
                        }`}
                      >
                        <Power size={16} />
                      </button>
                      <button
                        type="button"
                        title="Hapus"
                        aria-label="Hapus"
                        disabled={busyId === s.id}
                        onClick={() => setConfirmDelete(s)}
                        className="rounded-lg p-1.5 text-text-secondary transition-colors hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <SalesFormModal
        open={modalMode !== null}
        mode={modalMode ?? 'create'}
        sales={editingSales}
        onClose={() => {
          setModalMode(null)
          setEditingSales(null)
        }}
        onSaved={load}
      />

      <ConfirmDialog
        open={confirmDelete !== null}
        title="Hapus sales?"
        message={`"${confirmDelete?.nama ?? ''}" akan dihapus permanen. Bila masih ada leads yang terhubung, hapus akan ditolak — nonaktifkan saja agar riwayat leads tetap rapi.`}
        confirmLabel="Hapus"
        onConfirm={handleDelete}
        onClose={() => setConfirmDelete(null)}
      />
    </div>
  )
}
