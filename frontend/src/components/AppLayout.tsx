import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks';
import { Link, NavLink, useLocation } from 'react-router-dom';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-cosmic-page">
      {/* WCAG 2.1 AA - Skip Navigation Link */}
      <a
        href="#main-content"
        className="skip-link"
      >
        Skip to main content
      </a>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden bg-black/50"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="lg:pl-64">
        {/* Top Navigation Bar */}
        <TopNav onMenuClick={() => setSidebarOpen(true)} />

        {/* Page Content */}
        <main
          id="main-content"
          className="p-4 lg:p-8"
          tabIndex={-1}
        >
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>

        {/* Footer */}
        <Footer />
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
}

// Top Navigation Bar
function TopNav({ onMenuClick }: { onMenuClick: () => void }) {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!dropdownOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  const handleDropdownKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setDropdownOpen(false);
      (e.currentTarget as HTMLElement).focus();
    }
    if (e.key === 'ArrowDown' && !dropdownOpen) {
      setDropdownOpen(true);
    }
  };

  return (
    <header className="sticky top-0 z-30 glass-nav border-b border-white/5">
      <div className="flex items-center justify-between h-16 px-4">
        {/* Left: Menu button + Logo */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-white/5"
            aria-label="Open main menu"
          >
            <span className="material-symbols-outlined text-slate-200" style={{ fontSize: '24px' }}>menu</span>
          </button>

          <Link to="/" className="flex items-center gap-2.5">
            <div className="size-9 bg-gradient-to-br from-primary to-cosmic-blue rounded-lg flex items-center justify-center text-white shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined text-xl" aria-hidden="true">auto_awesome</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-white hidden sm:block">
              AstroVerse
            </span>
          </Link>
        </div>

        {/* Center: Desktop Navigation — Pill style */}
        <nav className="hidden lg:flex items-center gap-1 bg-cosmic-card-solid/50 p-1.5 rounded-full border border-white/5">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  isActive
                    ? 'text-white bg-primary/20 border border-primary/30 shadow-sm'
                    : 'text-slate-200 hover:text-white hover:bg-white/5'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-4">
          <button className="relative p-2 text-slate-200 hover:text-white transition-colors rounded-full hover:bg-white/5" aria-label="Notifications">
            <span className="material-symbols-outlined" aria-hidden="true">notifications</span>
            <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border border-cosmic-page" />
          </button>

          <div className="h-8 w-px bg-white/10 mx-1 hidden md:block" />

          <Link
            to="/charts/new"
            className="hidden md:flex items-center gap-2 bg-gradient-to-r from-primary to-[#8b5cf6] hover:from-primary hover:to-primary text-white text-sm font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-primary/25 transition-all transform hover:scale-[1.02]"
          >
            <span className="material-symbols-outlined text-lg" aria-hidden="true">add</span>
            New Chart
          </Link>

          <div className="relative" ref={dropdownRef}>
            <button
              className="flex items-center gap-3 pl-2 cursor-pointer group"
              onClick={() => setDropdownOpen((prev) => !prev)}
              onKeyDown={handleDropdownKey}
              aria-expanded={dropdownOpen}
              aria-haspopup="menu"
              aria-label="User menu"
            >
              <div className="size-10 rounded-full bg-cover bg-center border-2 border-cosmic-border group-hover:border-primary transition-colors flex items-center justify-center bg-primary">
                <span className="text-white text-sm font-bold">{user?.name?.charAt(0).toUpperCase() ?? 'U'}</span>
              </div>
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-48 glass-panel rounded-xl shadow-lg"
                role="menu"
                onKeyDown={handleDropdownKey}
              >
                <Link
                  to="/profile"
                  role="menuitem"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm text-slate-200 hover:bg-white/5 rounded-t-xl"
                >
                  <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: '20px' }}>person</span>
                  Profile
                </Link>
                <Link
                  to="/settings"
                  role="menuitem"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm text-slate-200 hover:bg-white/5"
                >
                  <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: '20px' }}>settings</span>
                  Settings
                </Link>
                <hr className="border-white/5" />
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => { setDropdownOpen(false); void logout(); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-900/20 rounded-b-xl"
                >
                  <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: '20px' }}>logout</span>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

// Sidebar Component
function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-cosmic-card-solid border-r border-white/5
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
      `}
      aria-label="Main navigation"
    >
      <div className="flex flex-col h-full">
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-white/5">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="size-9 bg-gradient-to-br from-primary to-cosmic-blue rounded-lg flex items-center justify-center text-white shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined text-xl" aria-hidden="true">auto_awesome</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-white">AstroVerse</span>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg hover:bg-white/5"
            aria-label="Close sidebar"
          >
            <span className="material-symbols-outlined text-slate-200" style={{ fontSize: '24px' }}>close</span>
          </button>
        </div>

        {/* Sidebar Content */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-8">
          {/* Quick Actions */}
          <section>
            <h3 className="px-2 text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">
              Quick Actions
            </h3>
            <div className="space-y-1">
              <Link
                to="/charts/new"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-cosmic-gradient text-white shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>add</span>
                <span className="font-medium">New Chart</span>
              </Link>
              <Link
                to="/transits/today"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-200 hover:bg-white/5 transition-colors"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>calendar_today</span>
                <span>Today&apos;s Transits</span>
              </Link>
            </div>
          </section>

          {/* My Charts */}
          <section>
            <h3 className="px-2 text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">
              My Charts
            </h3>
            <div className="space-y-1">
              <Link
                to="/charts/natal"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-200 hover:bg-white/5 hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>star</span>
                <span>Natal Chart</span>
              </Link>
              <Link
                to="/compatibility"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-200 hover:bg-white/5 hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>favorite_border</span>
                <span>Compatibility</span>
              </Link>
              <Link
                to="/transits"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-200 hover:bg-white/5 hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>schedule</span>
                <span>Transits</span>
              </Link>
            </div>
          </section>

          {/* Tools */}
          <section>
            <h3 className="px-2 text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">
              Tools
            </h3>
            <div className="space-y-1">
              <Link
                to="/ephemeris"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-200 hover:bg-white/5 hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>table</span>
                <span>Ephemeris</span>
              </Link>
              <Link
                to="/moon-calendar"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-200 hover:bg-white/5 hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>dark_mode</span>
                <span>Moon Calendar</span>
              </Link>
              <Link
                to="/retrograde"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-200 hover:bg-white/5 hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>undo</span>
                <span>Retrograde Calendar</span>
              </Link>
              <Link
                to="/calendar"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-200 hover:bg-white/5 hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>calendar_month</span>
                <span>Calendar</span>
              </Link>
              <Link
                to="/lunar-returns"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-200 hover:bg-white/5 hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>nightlight</span>
                <span>Lunar Returns</span>
              </Link>
            </div>
          </section>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-white/5">
          <div className="bg-white/5 border border-cosmic-border rounded-xl p-4">
            <p className="text-sm font-medium text-white mb-1">
              Upgrade to Premium
            </p>
            <p className="text-xs text-slate-200 mb-3">
              Get unlimited charts and detailed analysis
            </p>
            <Link
              to="/subscription"
              className="block text-center px-4 py-2.5 bg-cosmic-gradient text-white text-sm font-semibold rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all"
            >
              Upgrade Now
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
}

// Mobile Bottom Navigation
function MobileBottomNav() {
  const { user } = useAuth();
  const location = useLocation();
  const [activePath, setActivePath] = useState('/');

  useEffect(() => {
    setActivePath(location.pathname);
  }, [location.pathname]);

  const isActive = (href: string) => {
    if (href === '/') {
      return activePath === '/';
    }
    return activePath.startsWith(href);
  };

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 glass-nav"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
      aria-label="Mobile navigation"
    >
      <div className="flex items-center justify-around">
        {mobileNavItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.name}
              to={item.href}
              className="flex flex-col items-center justify-center flex-1 min-h-[56px] relative transition-all duration-200 group"
              aria-label={item.label}
              aria-current={active ? 'page' : undefined}
            >
              {/* Active indicator bar */}
              {active && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-primary rounded-full" />
              )}

              {/* Icon with active state */}
              <span
                className={`
                  relative p-2 rounded-xl transition-all duration-200
                  ${
                    active
                      ? 'bg-primary/15 text-primary'
                      : 'text-slate-200 group-hover:bg-white/5'
                  }
                  active:scale-95 active:bg-white/10
                `}
                style={{ minWidth: '44px', minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <item.icon />
              </span>

              {/* Label with active state */}
              <span
                className={`
                  text-xs mt-0.5 font-medium transition-colors duration-200
                  ${active ? 'text-primary' : 'text-slate-200'}
                `}
              >
                {item.label}
              </span>
            </Link>
          );
        })}

        {/* Profile button */}
        <Link
          to="/profile"
          className={`flex flex-col items-center justify-center flex-1 min-h-[56px] relative transition-all duration-200 group`}
          aria-label="Profile"
          aria-current={activePath === '/profile' ? 'page' : undefined}
        >
          {/* Active indicator bar */}
          {activePath === '/profile' && (
            <span className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-primary rounded-full" />
          )}

          {/* Avatar with active state */}
          <span
            className={`
              relative p-2 rounded-xl transition-all duration-200
              ${
                activePath === '/profile'
                  ? 'bg-primary/15 ring-2 ring-primary ring-offset-2 ring-offset-cosmic-page'
                  : 'group-hover:bg-white/5'
              }
              active:scale-95 active:bg-white/10
            `}
            style={{ minWidth: '44px', minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <div
              className={`
                w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-xs font-medium transition-all duration-200
                ${activePath === '/profile' ? 'scale-110 ring-2 ring-white ring-offset-cosmic-page' : 'group-hover:scale-105'}
              `}
            >
              {user?.name?.charAt(0).toUpperCase() ?? 'U'}
            </div>
          </span>

          {/* Label with active state */}
          <span
            className={`
              text-xs mt-0.5 font-medium transition-colors duration-200
              ${activePath === '/profile' ? 'text-primary' : 'text-slate-200'}
            `}
          >
            Profile
          </span>
        </Link>
      </div>
    </nav>
  );
}

// Footer Component
function Footer() {
  return (
    <footer className="mt-auto border-t border-white/5 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Product */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Product</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/features" className="text-sm text-slate-200 hover:text-white transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-sm text-slate-200 hover:text-white transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/api" className="text-sm text-slate-200 hover:text-white transition-colors">
                  API
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Resources</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/learn" className="text-sm text-slate-200 hover:text-white transition-colors">
                  Learn Astrology
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-sm text-slate-200 hover:text-white transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/support" className="text-sm text-slate-200 hover:text-white transition-colors">
                  Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Company</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/about" className="text-sm text-slate-200 hover:text-white transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link to="/careers" className="text-sm text-slate-200 hover:text-white transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-slate-200 hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Legal</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/privacy" className="text-sm text-slate-200 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-sm text-slate-200 hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/cookies" className="text-sm text-slate-200 hover:text-white transition-colors">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="size-6 bg-gradient-to-br from-primary to-cosmic-blue rounded flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-xs" aria-hidden="true">auto_awesome</span>
            </div>
            <span className="text-sm text-slate-200">
              © 2026 AstroVerse. All rights reserved.
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-slate-200 hover:text-slate-200 cursor-default">
              <span className="sr-only">Twitter</span>
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
              </svg>
            </span>
            <span className="text-slate-200 hover:text-slate-200 cursor-default">
              <span className="sr-only">GitHub</span>
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Navigation data
const navItems = [
  { name: 'charts', label: 'Charts', href: '/charts' },
  { name: 'forecast', label: 'Forecast', href: '/forecast' },
  { name: 'learn', label: 'Learn', href: '/learn' },
];

const mobileNavItems = [
  { name: 'home', label: 'Home', href: '/', icon: () => <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>home</span> },
  { name: 'charts', label: 'Charts', href: '/charts', icon: () => <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>star</span> },
  { name: 'transits', label: 'Transits', href: '/transits', icon: () => <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>dark_mode</span> },
  { name: 'learn', label: 'Learn', href: '/learn', icon: () => <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>bar_chart</span> },
];
