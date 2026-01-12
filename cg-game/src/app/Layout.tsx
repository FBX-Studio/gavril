import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'

function NavItem({ to, label, onClick }: { to: string; label: string; onClick?: () => void }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        [
          'rounded-lg px-3 py-2 text-sm font-medium transition',
          isActive
            ? 'bg-white/15 text-white'
            : 'text-white/80 hover:bg-white/10 hover:text-white',
        ].join(' ')
      }
    >
      {label}
    </NavLink>
  )
}

export function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  return (
    <div className="min-h-screen overflow-x-hidden bg-[radial-gradient(80%_60%_at_50%_0%,rgba(99,102,241,0.35),rgba(11,16,32,0))]">
      <header className="sticky top-0 z-10 border-b border-white/10 bg-[#0b1020]/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-3 py-3 sm:px-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-500/20 text-indigo-200 ring-1 ring-indigo-400/30">
              KG
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold leading-tight text-white">Подготовка по компьютерной графике</div>
              <div className="text-xs text-white/60">Игра-экзамен: теория + практика</div>
            </div>
          </div>

          <nav className="hidden items-center gap-2 sm:flex">
            <NavItem to="/" label="Уровни" />
            <NavItem to="/exam" label="Экзамен" />
            <NavItem to="/bank" label="Вопросы" />
            <NavItem to="/notes" label="Шпаргалка" />
            <NavItem to="/videos" label="Видео" />
            <NavItem to="/chat" label="Нейро-чат" />
          </nav>

          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-xl bg-white/5 text-white/80 ring-1 ring-white/10 hover:bg-white/10 sm:hidden"
            aria-label={mobileOpen ? 'Закрыть меню' : 'Открыть меню'}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M4 7H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M4 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M4 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            )}
          </button>
        </div>
      </header>

      {mobileOpen && (
        <div className="sm:hidden">
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/55"
            aria-label="Закрыть меню"
            onClick={() => setMobileOpen(false)}
          />
          <div
            id="mobile-nav"
            className="fixed left-0 right-0 top-0 z-50 border-b border-white/10 bg-[#0b1020]/95 px-3 pb-4 pt-3 backdrop-blur"
          >
            <div className="mx-auto flex max-w-6xl items-center justify-between">
              <div className="text-sm font-semibold text-white">Меню</div>
              <button
                type="button"
                className="grid h-10 w-10 place-items-center rounded-xl bg-white/5 text-white/80 ring-1 ring-white/10 hover:bg-white/10"
                aria-label="Закрыть меню"
                onClick={() => setMobileOpen(false)}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <nav className="mx-auto mt-3 grid max-w-6xl gap-2" aria-label="Навигация">
              <NavItem to="/" label="Уровни" onClick={() => setMobileOpen(false)} />
              <NavItem to="/exam" label="Экзамен" onClick={() => setMobileOpen(false)} />
              <NavItem to="/bank" label="Вопросы" onClick={() => setMobileOpen(false)} />
              <NavItem to="/notes" label="Шпаргалка" onClick={() => setMobileOpen(false)} />
              <NavItem to="/videos" label="Видео" onClick={() => setMobileOpen(false)} />
              <NavItem to="/chat" label="Нейро-чат" onClick={() => setMobileOpen(false)} />
            </nav>
          </div>
        </div>
      )}

      <main className="mx-auto max-w-6xl px-3 py-5 sm:px-4 sm:py-6">
        <Outlet />
      </main>

      <footer className="mx-auto max-w-6xl px-3 pb-8 text-xs text-white/50 sm:px-4">
        Прогресс сохраняется в браузере (localStorage). Видео открываются через YouTube.
      </footer>
    </div>
  )
}
