import { createHashRouter, Navigate } from 'react-router-dom'
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
 * Routing hash mode (#/) — deploy ke static hosting VPS tanpa
 * server-side routing config (sesuai CLAUDE.md).
 */
const router = createHashRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { path: 'login', element: <LoginPage /> },
      {
        element: <ProtectedRoute />, // cek session, redirect #/login kalau belum
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
