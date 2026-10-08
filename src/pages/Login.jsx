import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuthStore } from '../store/auth'

const loginSchema = z.object({
  email: z.string().min(1, 'Email wajib diisi').email('Format email tidak valid'),
  password: z.string().min(1, 'Password wajib diisi'),
})

/** Interior rumah mewah sebagai background transparan (permintaan Dimas 8 Okt):
 *  garis tipis abu, opacity sangat rendah — cukup menggambarkan properti, tidak
 *  mengganggu form login. Digambar langsung sebagai SVG component (bukan file
 *  foto) supaya tetap local + tajam di layar retina. */
function InteriorBackground() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMid slice"
      className="pointer-events-none fixed inset-0 h-full w-full text-border-default"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      {/* Lantai perspektif */}
      <path d="M0 900 L720 460 L1440 900" />
      <path d="M0 780 L720 470 L1440 780" />
      <path d="M120 900 L720 560 L1320 900" />
      {/* Dinding belakang + pintu tinggi */}
      <rect x="560" y="180" width="320" height="300" />
      <path d="M560 480 L720 380 L880 480" />
      <rect x="640" y="300" width="160" height="180" />
      <path d="M640 300 L720 250 L800 300" />
      {/* Chandelier */}
      <path d="M720 0 V150 M680 150 H760 M690 180 H750 M700 150 L720 120 L740 150" />
      {/* Jendela besar kiri */}
      <rect x="120" y="200" width="200" height="260" />
      <path d="M220 200 V460 M120 330 H320" />
      {/* Jendela kanan */}
      <rect x="1120" y="200" width="200" height="260" />
      <path d="M1220 200 V460 M1120 330 H1320" />
      {/* Tangga samping */}
      <path d="M0 640 H240 V600 H360 V560 H480" />
      {/* Sofas meja tamu */}
      <rect x="520" y="600" width="180" height="60" rx="10" />
      <rect x="540" y="560" width="140" height="40" rx="10" />
      <rect x="760" y="600" width="180" height="60" rx="10" />
      <rect x="780" y="560" width="140" height="40" rx="10" />
      <ellipse cx="720" cy="700" rx="60" ry="14" />
      {/* Tanaman pot */}
      <path d="M1000 660 H1060 L1050 720 H1010 Z M1030 660 V600 M1030 620 C1010 600 1010 580 1030 560 M1030 620 C1050 600 1050 580 1030 560" />
    </svg>
  )
}

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
      {/* Background interior mewah, sangat transparan */}
      <InteriorBackground />
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
