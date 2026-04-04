/**
 * AppLayout — Authenticated Shell
 *
 * Wraps all authenticated pages with sidebar, top nav, and mobile bottom nav.
 * Uses cosmic dark theme consistent with the rest of the app.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleCloseSidebar = useCallback(() => setSidebarOpen(false), []);
  const handleOpenSidebar = useCallback(() => setSidebarOpen(true), []);

  return (
    <div className="min-h-screen bg-[#0B0D17] text-slate-100">
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
          className="fixed inset-0 z-40 lg:hidden bg-black/60 backdrop-blur-sm"
          onClick={handleCloseSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={handleCloseSidebar} />

      {/* Main Content Area */}
      <div className="lg:pl-64">
        {/* Top Navigation Bar */}
        <TopNav onMenuClick={handleOpenSidebar} />

        {/* Page Content */}
        <main
          id="main-content"
          className="p-4 lg:p-8 pb-24 lg:pb-8"
          tabIndex={-1}
        >
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
}

// Top Navigation Bar
function TopNav({ onMenuClick }: { onMenuClick: () => void }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = useCallback(() => {
    void logout();
    navigate('/login');
  }, [logout, navigate]);

  return (
    <header className="sticky top-0 z-30 bg-[#141627]/70 backdrop-blur-md border-b border-[#2f2645]">
      <div className="flex items-center justify-between h-16 px-4">
        {/* Left: Menu button + Logo */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-white/5 transition-colors"
            aria-label="Open main menu"
          >
            <span className="material-symbols-outlined text-slate-300">menu</span>
          </button>

          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="size-8 bg-gradient-to-br from-primary to-[#8b5cf6] rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined text-[18px] text-white">auto_awesome</span>
            </div>
            <span className="text-xl font-bold text-white hidden sm:block">
              AstroVerse
            </span>
          </Link>
        </div>

        {/* Center: Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-white bg-white/10'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Right: New Chart + User Menu */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/charts/create')}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25"
            aria-label="Create new chart"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span className="hidden md:inline">New Chart</span>
          </button>

          <button className="p-2 rounded-lg hover:bg-white/5 relative transition-colors">
            <span className="sr-only">Notifications</span>
            <span className="material-symbols-outlined text-slate-400">notifications</span>
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          <div className="relative group">
            <button className="flex items-center gap-2 p-1 rounded-lg hover:bg-white/5 transition-colors">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                {user?.name?.charAt(0).toUpperCase() ?? 'U'}
              </div>
              <span className="hidden md:block text-sm font-medium text-slate-300">
                {user?.name ?? 'User'}
              </span>
              <span className="material-symbols-outlined text-[16px] text-slate-500 hidden md:block">expand_more</span>
            </button>

            {/* Dropdown Menu */}
            <div className="absolute right-0 mt-2 w-48 bg-[#1a1d2e] border border-[#2f2645] rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
              <div className="py-2">
                <Link
                  to="/profile"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">person</span>
                  Profile
                </Link>
                <Link
                  to="/settings"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">settings</span>
                  Settings
                </Link>
                <hr className="border-[#2f2645] my-1" />
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">logout</span>
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

// Sidebar Component
function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { user } = useAuth();
  const tier = user?.plan ?? 'free';
  const isPaid = tier !== 'free';

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-[#0B0D17] border-r border-[#2f2645]
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
      `}
      aria-label="Main navigation"
    >
      <div className="flex flex-col h-full">
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-[#2f2645]">
          <Link to="/dashboard" className="flex items-center gap-2" onClick={onClose}>
            <div className="size-8 bg-gradient-to-br from-primary to-[#8b5cf6] rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined text-[18px] text-white">auto_awesome</span>
            </div>
            <span className="text-xl font-bold text-white">AstroVerse</span>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg hover:bg-white/5 transition-colors"
            aria-label="Close sidebar"
          >
            <span className="material-symbols-outlined text-slate-400">close</span>
          </button>
        </div>

        {/* Sidebar Content */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-8">
          {/* Quick Actions */}
          <section>
            <h3 className="px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Quick Actions
            </h3>
            <div className="space-y-1">
              <Link
                to="/charts/create"
                onClick={onClose}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">add</span>
                <span className="font-medium">New Chart</span>
              </Link>
              <Link
                to="/dashboard"
                onClick={onClose}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">dashboard</span>
                <span>Dashboard</span>
              </Link>
            </div>
          </section>

          {/* Features */}
          <section>
            <h3 className="px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Features
            </h3>
            <div className="space-y-1">
              <Link
                to="/calendar"
                onClick={onClose}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">calendar_month</span>
                <span>Calendar</span>
              </Link>
              <Link
                to="/synastry"
                onClick={onClose}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">favorite_border</span>
                <span>Synastry</span>
              </Link>
              <Link
                to="/transits"
                onClick={onClose}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">sync</span>
                <span>Transits</span>
              </Link>
              <Link
                to="/learning"
                onClick={onClose}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">school</span>
                <span>Learning Center</span>
              </Link>
            </div>
          </section>

          {/* Returns */}
          <section>
            <h3 className="px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Returns
            </h3>
            <div className="space-y-1">
              <Link
                to="/solar-returns"
                onClick={onClose}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">light_mode</span>
                <span>Solar Returns</span>
              </Link>
              <Link
                to="/lunar-returns"
                onClick={onClose}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">dark_mode</span>
                <span>Lunar Returns</span>
              </Link>
            </div>
          </section>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-[#2f2645]">
          {isPaid ? (
            <div className="bg-gradient-to-br from-emerald-900/20 to-green-900/20 rounded-lg p-4 border border-emerald-500/20">
              <div className="flex items-center gap-2 mb-1">
                <span className="material-symbols-outlined text-[16px] text-emerald-400">auto_awesome</span>
                <p className="text-sm font-medium text-emerald-300">
                  {tier === 'basic' ? 'Pro Plan' : 'Premium Plan'}
                </p>
              </div>
              <p className="text-xs text-slate-400 mb-3">
                You have access to premium features
              </p>
              <Link
                to="/subscription"
                onClick={onClose}
                className="block text-center px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Manage Plan
              </Link>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-primary/10 to-purple-900/20 rounded-lg p-4 border border-primary/20">
              <p className="text-sm font-medium text-white mb-1">
                Upgrade to Premium
              </p>
              <p className="text-xs text-slate-400 mb-3">
                Get unlimited charts and detailed analysis
              </p>
              <Link
                to="/subscription"
                onClick={onClose}
                className="block text-center px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
              >
                Upgrade Now
              </Link>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

// Mobile Bottom Navigation
const MobileBottomNav = React.memo(function MobileBottomNav() {
  const { user } = useAuth();
  const location = useLocation();
  const [activePath, setActivePath] = useState('/');

  useEffect(() => {
    setActivePath(location.pathname);
  }, [location.pathname]);

  const isActive = useCallback((href: string) => {
    if (href === '/dashboard') {
      return activePath === '/dashboard' || activePath === '/';
    }
    return activePath.startsWith(href);
  }, [activePath]);

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#141627] border-t border-[#2f2645]"
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
                      ? 'bg-primary/20 text-primary'
                      : 'text-slate-400 group-hover:bg-white/5'
                  }
                  active:scale-95 active:bg-white/10
                `}
                style={{ minWidth: '44px', minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <span
                  className={`material-symbols-outlined text-[22px] transition-all duration-200 ${
                    active ? 'scale-110' : 'group-hover:scale-105'
                  }`}
                >
                  {item.icon}
                </span>
              </span>

              {/* Label with active state */}
              <span
                className={`
                  text-xs mt-0.5 font-medium transition-colors duration-200
                  ${active ? 'text-primary' : 'text-slate-400'}
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
          className="flex flex-col items-center justify-center flex-1 min-h-[56px] relative transition-all duration-200 group"
          aria-label="Profile"
          aria-current={activePath === '/profile' ? 'page' : undefined}
        >
          {activePath === '/profile' && (
            <span className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-primary rounded-full" />
          )}

          <span
            className={`
              relative p-2 rounded-xl transition-all duration-200
              ${
                activePath === '/profile'
                  ? 'bg-primary/20 ring-2 ring-primary ring-offset-2 ring-offset-[#141627]'
                  : 'group-hover:bg-white/5'
              }
              active:scale-95 active:bg-white/10
            `}
            style={{ minWidth: '44px', minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <div
              className={`
                w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-medium transition-all duration-200
                ${activePath === '/profile' ? 'scale-110 ring-2 ring-[#141627]' : 'group-hover:scale-105'}
              `}
            >
              {user?.name?.charAt(0).toUpperCase() ?? 'U'}
            </div>
          </span>

          <span
            className={`text-xs mt-0.5 font-medium transition-colors duration-200 ${
              activePath === '/profile' ? 'text-primary' : 'text-slate-400'
            }`}
          >
            Profile
          </span>
        </Link>
      </div>
    </nav>
  );
});

// Navigation data
const navItems = [
  { name: 'charts', label: 'Charts', href: '/charts' },
  { name: 'transits', label: 'Transits', href: '/transits' },
  { name: 'learn', label: 'Learn', href: '/learning' },
];

const mobileNavItems = [
  { name: 'home', label: 'Home', href: '/dashboard', icon: 'home' },
  { name: 'charts', label: 'Charts', href: '/charts', icon: 'star' },
  { name: 'transits', label: 'Transits', href: '/transits', icon: 'sync' },
  { name: 'learn', label: 'Learn', href: '/learning', icon: 'school' },
];
