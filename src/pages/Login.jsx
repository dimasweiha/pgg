import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuthStore } from '../store/auth'
import fotoKawasan from '../assets/kawasan.webp'

const loginSchema = z.object({
  email: z.string().min(1, 'Email wajib diisi').email('Format email tidak valid'),
  password: z.string().min(1, 'Password wajib diisi'),
})

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
    <div className="relative flex min-h-screen items-center justify-center bg-bg-base px-6">
      {/* Background foto kawasan perumahan, transparan (permintaan Dimas 8 Okt):
          opacity rendah + overlay putih supaya form login tetap dominan */}
      <img
        src={fotoKawasan}
        alt=""
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 h-full w-full object-cover opacity-15"
      />
      <div className="relative w-full max-w-sm">
        <div className="mb-6 text-center">
          <p className="text-2xl font-bold tracking-tight text-text-primary">
            Perumahan Grati Garden
          </p>
          <p className="mt-1 text-xs text-text-secondary">Leads Dashboard</p>
        </div>

        <div className="rounded-xl border border-border-default bg-surface p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="mb-1 block text-xs font-medium text-text-secondary"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="email@contoh.com"
                className="w-full rounded-lg border border-border-default bg-surface px-3 py-2.5 text-sm transition-colors focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-600/20"
                {...register('email')}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-800">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1 block text-xs font-medium text-text-secondary"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full rounded-lg border border-border-default bg-surface px-3 py-2.5 text-sm transition-colors focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-600/20"
                {...register('password')}
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-800">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Memproses…' : 'Masuk'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
