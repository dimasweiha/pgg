import { createBrowserRouter, Navigate } from 'react-router-dom'
import App from './App.jsx'
import LoginPage from './pages/Login.jsx'
import DashboardPage from './pages/Dashboard.jsx'
import LeadsPage from './pages/Leads.jsx'
import AgingPage from './pages/Aging.jsx'
import UnitsPage from './pages/Units.jsx'
import PerformaIklanPage from './pages/PerformaIklan.jsx'
import PengaturanPage from './pages/Pengaturan.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Layout from './components/Layout.jsx'

/**
 * Routing clean URL (tanpa #/) — revisi Dimas 8 Okt: alamat jadi
 * `domain.com/leads`, bukan `domain.com/#/leads`.
 * WAJIB: server harus rewrite semua path ke index.html (SPA fallback),
 * kalau tidak refresh di /leads akan 404. Lihat public/.htaccess (Apache)
 * dan catatan nginx di README/DESIGN.
 */
const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { path: 'login', element: <LoginPage /> },
      {
        element: <ProtectedRoute />, // cek session, redirect /login kalau belum
        children: [
          {
            element: <Layout />, // sidebar + header + logout
            children: [
              { index: true, element: <DashboardPage /> },
              { path: 'leads', element: <LeadsPage /> },
              { path: 'leads/aging', element: <AgingPage /> },
              { path: 'units', element: <UnitsPage /> },
              { path: 'iklan', element: <PerformaIklanPage /> },
              { path: 'pengaturan', element: <PengaturanPage /> },
            ],
          },
        ],
      },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
])

export default router
