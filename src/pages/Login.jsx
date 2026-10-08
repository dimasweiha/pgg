import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuthStore } from '../store/auth'
import fotoKawasan from '../assets/kawasan.webp'

/** Konstanta module-level (purity lint) — tahun untuk footer */
const TAHUN_KINI = new Date().getFullYear()

const loginSchema = z.object({
  email: z.string().min(1, 'Email wajib diisi').email('Format email tidak valid'),
  password: z.string().min(1, 'Password wajib diisi'),
})

/**
 * Halaman Login (redesign 8 Okt — modern simple):
 * foto kawasan full layar + gradasi hitam lembut, card putih rounded-2xl
 * semi-solid, input lega, tanpa logo & tanpa teks tambahan.
 */
export default function LoginPage() {
  const login = useAuthStore((s) => s.login)
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = async (values) => {
    const errorMessage = await login(values.email, values.password)
    if (errorMessage) {
      toast.error(errorMessage)
    } else {
      toast.success('Login berhasil')
      navigate('/', { replace: true })
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-6 py-12">
      {/* Background: foto kawasan full + gradasi hitam lembut */}
      <img
        src={fotoKawasan}
        alt=""
        aria-hidden="true"
        className="fixed inset-0 h-full w-full object-cover"
      />
      <div
        className="fixed inset-0 bg-gradient-to-b from-black/60 via-black/45 to-black/70"
        aria-hidden="true"
      />

      <div className="relative w-full max-w-sm">
        {/* Brand */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white drop-shadow-lg">
            Perumahan Grati Garden
          </h1>
          <p className="mt-1.5 text-sm font-medium tracking-wide text-white/80">
            Leads Dashboard
          </p>
        </div>

        {/* Card form */}
        <div className="rounded-2xl bg-white/95 p-8 shadow-2xl ring-1 ring-white/20 backdrop-blur">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-secondary"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="email@contoh.com"
                className="w-full rounded-lg border border-border-default bg-white px-3.5 py-3 text-sm text-text-primary transition-colors placeholder:text-text-secondary/60 focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-600/20"
                {...register('email')}
              />
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-800">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-secondary"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full rounded-lg border border-border-default bg-white px-3.5 py-3 text-sm text-text-primary transition-colors placeholder:text-text-secondary/60 focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-600/20"
                {...register('password')}
              />
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-800">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-primary-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Memproses…' : 'Masuk'}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-white/70">
          © {TAHUN_KINI} Perumahan Grati Garden
        </p>
      </div>
    </div>
  )
}
