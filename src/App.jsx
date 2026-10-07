import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './store/auth'

/**
 * App shell: init session Supabase sekali di mount, render route
 * via Outlet (router di src/router.jsx), dan Toaster global.
 *
 * Notif toast gaya modern-simple (revisi Dimas 6 Okt): kartu putih
 * rounded-xl + border tipis + shadow lembut, teks primary; ikon status
 * dibulatkan berwarna — hijau sukses, merah error, sky loading.
 */
const toastStyle = {
  background: '#ffffff',
  color: '#1a1d23',
  borderRadius: '12px',
  border: '1px solid #e5e7eb',
  boxShadow: '0 10px 30px -12px rgb(15 23 42 / 0.18), 0 4px 10px -6px rgb(15 23 42 / 0.08)',
  padding: '12px 16px',
  fontSize: '14px',
  fontWeight: 500,
}

function App() {
  const init = useAuthStore((s) => s.init)

  useEffect(() => {
    init()
  }, [init])

  return (
    <>
      <Outlet />
      <Toaster
        position="top-right"
        gutter={10}
        toastOptions={{
          style: toastStyle,
          duration: 3500,
          success: { iconTheme: { primary: '#16a34a', secondary: '#ffffff' } },
          error: { iconTheme: { primary: '#dc2626', secondary: '#ffffff' }, duration: 4500 },
          loading: { iconTheme: { primary: '#0ea5e9', secondary: '#ffffff' } },
        }}
      />
    </>
  )
}

export default App
