import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Input from './Input.jsx'
import DropdownSelect from './DropdownSelect.jsx'
import DatePicker from './DatePicker.jsx'
import Button from './Button.jsx'

/**
 * Validasi no. HP: digit dengan awalan + atau 0, boleh pemisah spasi/strip/titik/kurung.
 * Contoh valid: 08123456789, +628123456789, 0812-3456-789.
 */
const NO_HP_PATTERN = /^[+0][\d\s\-().]{7,20}$/

const baseSchema = z.object({
  nama: z.string().trim().min(1, 'Nama wajib diisi'),
  no_hp: z
    .string()
    .trim()
    .min(1, 'No. HP wajib diisi')
    .regex(NO_HP_PATTERN, 'Format no. HP tidak valid (contoh: 08123456789)'),
  jenis: z.enum(['organik', 'iklan'], {
    errorMap: () => ({ message: 'Jenis wajib dipilih' }),
  }),
  sales_id: z.string().optional().default(''),
  blok_unit: z.string().trim().optional().default(''),
  tanggal_masuk: z.string().min(1, 'Tanggal masuk wajib diisi'),
})

/** Tambah leads: selalu status 'proses', tanpa field keputusan */
const createSchema = baseSchema

/**
 * Edit leads: status bisa berubah → tanggal keputusan wajib saat keluar dari proses.
 * Omset sengaja tidak diminta (keputusan Dimas: "kita gak tahu pastinya berapa")
 * → payload selalu mengirim null.
 */
const editSchema = baseSchema
  .extend({
    status: z.enum(['proses', 'deal', 'no_deal'], {
      errorMap: () => ({ message: 'Status wajib dipilih' }),
    }),
    tanggal_keputusan: z.string().optional().default(''),
    catatan: z.string().trim().optional().default(''),
  })
  .superRefine((val, ctx) => {
    if (val.status !== 'proses' && !val.tanggal_keputusan) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Tanggal keputusan wajib diisi',
        path: ['tanggal_keputusan'],
      })
    }
  })

/**
 * Form leads dipakai untuk tambah & edit.
 * @param mode 'create' | 'edit'
 * @param lead data leads saat edit (null saat tambah)
 * @param salesList [{id, nama, is_active}] untuk dropdown
 * @param onSubmit(payload) — payload sudah dipetakan (null untuk field kosong)
 */
export default function LeadsForm({ mode = 'create', lead = null, salesList = [], onSubmit, onClose }) {
  const isEdit = mode === 'edit'
  const schema = isEdit ? editSchema : createSchema

  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: buildDefaults(lead, isEdit),
  })

  // watch() adalah API standar React Hook Form untuk subscribe field
  // — bukan nilai yang perlu di-memoize.
  // oxlint-disable-next-line incompatible-library
  const status = watch('status')
  const showKeputusan = isEdit && (status === 'deal' || status === 'no_deal')

  // Reset setiap kali lead/mode berubah (buka form untuk leads berbeda).
  // Pola reset() di effect adalah pola standar yang didokumentasikan
  // React Hook Form untuk form dinamis — bukan sinkronisasi state biasa.
  // oxlint-disable-next-line react(set-state-in-effect)
  useEffect(() => {
    reset(buildDefaults(lead, isEdit))
  }, [lead, isEdit, reset])

  const submit = (values) => {
    const payload = {
      tanggal_masuk: values.tanggal_masuk,
      nama: values.nama.trim(),
      no_hp: values.no_hp.trim(),
      jenis: values.jenis,
      sales_id: values.sales_id || null,
      // Simpan tulisan asli user; agregasi Unit Breakdown memakai normalisasi
      // di view (norm_blok) supaya "Blok D7" & "d7" terhitung unit sama.
      blok_unit: values.blok_unit?.trim() || null,
    }
    if (isEdit) {
      payload.status = values.status
      payload.tanggal_keputusan = values.status === 'proses' ? null : values.tanggal_keputusan || null
      // Omset tidak diisi lewat form lagi (belum pasti saat deal) — simpan null.
      payload.omset = null
      payload.catatan = values.catatan?.trim() || null
    }
    onSubmit(payload)
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input label="Nama" placeholder="Nama leads" error={errors.nama?.message} {...register('nama')} />
        <Input
          label="No. HP / WA"
          placeholder="08123456789"
          inputMode="tel"
          error={errors.no_hp?.message}
          {...register('no_hp')}
        />
        <Controller
          name="jenis"
          control={control}
          render={({ field }) => (
            <DropdownSelect
              label="Jenis"
              error={errors.jenis?.message}
              placeholder="Pilih jenis leads"
              value={field.value}
              onChange={field.onChange}
              options={[
                { value: 'iklan', label: 'Iklan' },
                { value: 'organik', label: 'Organik' },
              ]}
            />
          )}
        />
        <Controller
          name="sales_id"
          control={control}
          render={({ field }) => (
            <DropdownSelect
              label="Sales yang Handle"
              error={errors.sales_id?.message}
              placeholder="— Belum ditentukan —"
              value={field.value}
              onChange={field.onChange}
              options={salesList.map((s) => ({
                value: s.id,
                label: s.nama,
                // Nonaktif: tetap terlihat tapi abu-abu & tidak bisa dipilih
                // (revisi Dimas 6 Okt) — terutama untuk edit leads lama.
                disabled: s.is_active === false,
                hint: s.is_active === false ? '(nonaktif)' : undefined,
              }))}
            />
          )}
        />
        <Input
          label="Blok Unit"
          placeholder="misal: blok D7"
          error={errors.blok_unit?.message}
          {...register('blok_unit')}
        />
        <Controller
          name="tanggal_masuk"
          control={control}
          render={({ field }) => (
            <DatePicker
              label="Tanggal Masuk"
              error={errors.tanggal_masuk?.message}
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />

        {isEdit && (
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <DropdownSelect
                label="Status"
                error={errors.status?.message}
                value={field.value}
                onChange={field.onChange}
                options={[
                  { value: 'proses', label: 'Proses' },
                  { value: 'deal', label: 'Deal' },
                  { value: 'no_deal', label: 'No Deal' },
                ]}
              />
            )}
          />
        )}
        {showKeputusan && (
          <Controller
            name="tanggal_keputusan"
            control={control}
            render={({ field }) => (
              <DatePicker
                label="Tanggal Keputusan"
                error={errors.tanggal_keputusan?.message}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        )}
      </div>

      {isEdit && (
        <div>
          <label
            htmlFor="leads-catatan"
            className="mb-1 block text-xs uppercase tracking-wide text-text-secondary"
          >
            Catatan (opsional)
          </label>
          <textarea
            id="leads-catatan"
            rows={3}
            placeholder="misal: alasan no deal, progres follow-up…"
            className={`w-full rounded-lg border bg-surface px-3 py-2 text-sm transition-colors focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-600/20 ${
              errors.catatan ? 'border-red-500' : 'border-border-default'
            }`}
            {...register('catatan')}
          />
          {errors.catatan && <p className="mt-1 text-xs text-red-800">{errors.catatan.message}</p>}
        </div>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="secondary" type="button" onClick={onClose}>
          Batal
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Menyimpan…' : isEdit ? 'Simpan Perubahan' : 'Tambah Leads'}
        </Button>
      </div>
    </form>
  )
}

function buildDefaults(lead, isEdit) {
  if (!isEdit || !lead) {
    return {
      nama: '',
      no_hp: '',
      // Tanpa default: user memilih sendiri dari dropdown (keputusan Dimas).
      jenis: '',
      sales_id: '',
      blok_unit: '',
      // Tanpa default terisi — kalender terbuka di bulan berjalan.
      tanggal_masuk: '',
    }
  }
  return {
    nama: lead.nama ?? '',
    no_hp: lead.no_hp ?? '',
    jenis: lead.jenis ?? '',
    sales_id: lead.sales_id ?? lead.sales?.id ?? '',
    blok_unit: lead.blok_unit ?? '',
    tanggal_masuk: lead.tanggal_masuk ?? '',
    status: lead.status ?? 'proses',
    tanggal_keputusan: lead.tanggal_keputusan ?? '',
    catatan: lead.catatan ?? '',
  }
}
