import { useEffect, useRef, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  Building2,
  CalendarDays,
  LayoutDashboard,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Megaphone,
  Search,
  Settings,
  Timer,
  Users,
  X,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuthStore } from '../store/auth'

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/leads', label: 'Leads', icon: Users, end: true },
  { to: '/leads/aging', label: 'Umur Leads', icon: Timer, end: false },
  { to: '/units', label: 'Unit Breakdown', icon: Building2, end: false },
  { to: '/iklan', label: 'Performa Iklan', icon: Megaphone, end: true },
  { to: '/pengaturan', label: 'Pengaturan', icon: Settings, end: true },
]

// Judul menu dirender di dalam konten tiap halaman (di atas penjelasan),
// bukan di header sticky — revisi Dimas 6 Okt ("biar ga kosong").

/** Avatar bulat dengan inisial email */
function Avatar({ email }) {
  const initial = (email[0] ?? '?').toUpperCase()
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-50 text-sm font-semibold text-primary-600">
      {initial}
    </span>
  )
}

export default function Layout() {
  const session = useAuthStore((s) => s.session)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()
  const location = useLocation()

  const email = session?.user?.email ?? ''

  const [sidebarSearch, setSidebarSearch] = useState('')
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const searchInputRef = useRef(null)

  // Collapse/expand sidebar (revisi Dimas 6 Okt) — statusnya disimpan
  // di localStorage supaya persist antar reload.
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem('sidebar-collapsed') === '1'
    } catch {
      return false
    }
  })

  const toggleSidebar = () => {
    setSidebarCollapsed((v) => {
      try {
        localStorage.setItem('sidebar-collapsed', v ? '0' : '1')
      } catch {
        // abaikan — localStorage tidak tersedia
      }
      return !v
    })
  }

  const handleLogout = async () => {
    await logout()
    toast.success('Berhasil logout')
    navigate('/login', { replace: true })
  }

  const submitSidebarSearch = (e) => {
    e.preventDefault()
    const term = sidebarSearch.trim()
    navigate(term ? `/leads?q=${encodeURIComponent(term)}` : '/leads')
  }

  // Tutup nav mobile saat pindah halaman
  useEffect(() => {
    // oxlint-disable-next-line set-state-in-effect
    setMobileNavOpen(false)
  }, [location.pathname])

  const navLinks = (onNavigate) =>
    NAV_ITEMS.map((item) => (
      <NavLink
        key={item.to}
        to={item.to}
        end={item.end}
        onClick={onNavigate}
        title={sidebarCollapsed ? item.label : undefined}
        className={({ isActive }) =>
          `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
            sidebarCollapsed ? 'justify-center px-0' : ''
          } ${
            isActive
              ? 'bg-primary-50 font-medium text-primary-600'
              : 'text-text-secondary hover:bg-gray-50 hover:text-text-primary'
          }`
        }
      >
        <item.icon size={18} strokeWidth={2} className="shrink-0" />
        {!sidebarCollapsed && item.label}
      </NavLink>
    ))

  return (
    <div className="flex min-h-screen bg-bg-base font-sans">
      {/* Sidebar — desktop; bisa collapse jadi mode ikon saja */}
      <aside
        className={`sticky top-0 hidden h-screen shrink-0 flex-col border-r border-border-default bg-surface transition-[width] duration-200 lg:flex ${
          sidebarCollapsed ? 'w-[76px]' : 'w-64'
        }`}
      >
        <div className={`flex items-center py-5 ${sidebarCollapsed ? 'justify-center px-2' : 'px-5'}`}>
          {sidebarCollapsed ? (
            <span className="text-sm font-bold text-primary-600">PGG</span>
          ) : (
            <div className="leading-tight">
              <p className="text-sm font-semibold text-text-primary">Perumahan Grati Garden</p>
              <p className="text-[11px] text-text-secondary">Leads Dashboard</p>
            </div>
          )}
        </div>

        {!sidebarCollapsed && (
          <form onSubmit={submitSidebarSearch} className="px-4 pb-2">
            <div className="flex items-center gap-2 rounded-lg border border-border-default bg-gray-50 px-3 py-2 transition-colors focus-within:border-primary-600 focus-within:bg-surface">
              <Search size={16} className="shrink-0 text-text-secondary" />
              <input
                ref={searchInputRef}
                value={sidebarSearch}
                onChange={(e) => setSidebarSearch(e.target.value)}
                placeholder="Cari leads…"
                className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-secondary focus:outline-none"
              />
              <kbd className="hidden rounded border border-border-default bg-surface px-1.5 py-0.5 text-[10px] text-text-secondary xl:block">
                Enter
              </kbd>
            </div>
          </form>
        )}

        {!sidebarCollapsed && (
          <p className="px-5 pb-1 pt-4 text-[11px] font-medium uppercase tracking-wider text-text-secondary">
            Main Menu
          </p>
        )}
        <nav className={`space-y-1 ${sidebarCollapsed ? 'px-2' : 'px-3'}`}>{navLinks()}</nav>

        <div className="mt-auto border-t border-border-default p-4">
          <div className={`items-center gap-3 ${sidebarCollapsed ? 'flex flex-col' : 'flex'}`}>
            <Avatar email={email} />
            {!sidebarCollapsed && (
              <span className="min-w-0 flex-1 truncate text-xs text-text-secondary">{email}</span>
            )}
            <button
              type="button"
              onClick={handleLogout}
              title="Logout"
              className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-gray-50 hover:text-red-600"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Kolom konten */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header */}
        <header className="sticky top-0 z-20 border-b border-border-default bg-surface/90 backdrop-blur">
          <div className="flex h-16 items-center justify-between gap-4 px-6 lg:px-8">
            <div className="flex items-center gap-2">
              {/* Expand/collapse sidebar (revisi Dimas 6 Okt) — hanya desktop */}
              <button
                type="button"
                onClick={toggleSidebar}
                title={sidebarCollapsed ? 'Buka sidebar' : 'Lipat sidebar'}
                aria-label={sidebarCollapsed ? 'Buka sidebar' : 'Lipat sidebar'}
                className="hidden rounded-lg p-2 text-text-secondary transition-colors hover:bg-gray-50 hover:text-text-primary lg:block"
              >
                {sidebarCollapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
              </button>
              <button
                type="button"
                onClick={() => setMobileNavOpen((v) => !v)}
                className="rounded-lg p-2 text-text-secondary hover:bg-gray-50 lg:hidden"
                aria-label="Menu"
              >
                {mobileNavOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
            <div className="flex items-center gap-2 text-text-secondary">
              <span className="hidden items-center gap-2 rounded-lg border border-border-default bg-surface px-3 py-2 text-xs sm:flex">
                <CalendarDays size={14} />
                Data per hari ini
              </span>
              <span className="lg:hidden">
                <Avatar email={email} />
              </span>
            </div>
          </div>
          {/* Nav mobile */}
          {mobileNavOpen && (
            <nav className="space-y-1 border-t border-border-default px-4 py-3 lg:hidden">
              {navLinks(() => setMobileNavOpen(false))}
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-text-secondary hover:bg-gray-50 hover:text-red-600"
              >
                <LogOut size={18} />
                Logout
              </button>
            </nav>
          )}
        </header>

        <main className="w-full flex-1 px-6 py-8 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
