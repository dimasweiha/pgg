import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../store/auth'

/**
 * Wrapper proteksi route: tunggu session selesai dimuat
 * (hindari redirect prematur saat refresh), lalu redirect ke
 * #/login kalau belum login.
 */
export default function ProtectedRoute() {
  const ready = useAuthStore((s) => s.ready)
  const session = useAuthStore((s) => s.session)

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-base">
        <p className="text-sm text-text-secondary">Memuat…</p>
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
