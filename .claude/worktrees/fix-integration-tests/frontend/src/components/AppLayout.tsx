import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks';
import {
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  StarIcon,
  ClockIcon,
  MoonIcon,
  ArrowUturnLeftIcon,
  Cog6ToothIcon,
  PlusIcon,
  CalendarIcon,
  ChartBarIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { useLocation } from 'react-router-dom';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { logout: _logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Memoized handlers to prevent unnecessary re-renders
  const handleCloseSidebar = useCallback(() => setSidebarOpen(false), []);
  const handleOpenSidebar = useCallback(() => setSidebarOpen(true), []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
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

  const handleLogout = useCallback(() => {
    void logout();
  }, [logout]);

  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="flex items-center justify-between h-16 px-4">
        {/* Left: Menu button + Logo */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Open main menu"
          >
            <Bars3Icon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
          </button>

          <a href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">✨</span>
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white hidden sm:block">
              AstroSaaS
            </span>
          </a>
        </div>

        {/* Center: Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Right: User Menu */}
        <div className="flex items-center gap-3">
          <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 relative">
            <span className="sr-only">Notifications</span>
            <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          <div className="relative group">
            <button className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                {user?.name?.charAt(0).toUpperCase() ?? 'U'}
              </div>
              <span className="hidden md:block text-sm font-medium text-gray-700 dark:text-gray-300">
                {user?.name ?? 'User'}
              </span>
            </button>

            {/* Dropdown Menu */}
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
              <a
                href="/profile"
                className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <UserIcon className="w-5 h-5" />
                Profile
              </a>
              <a
                href="/settings"
                className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <Cog6ToothIcon className="w-5 h-5" />
                Settings
              </a>
              <hr className="border-gray-200 dark:border-gray-700" />
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <ArrowUturnLeftIcon className="w-5 h-5" />
                Logout
              </button>
            </div>
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
        fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
      `}
      aria-label="Main navigation"
    >
      <div className="flex flex-col h-full">
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700">
          <a href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">✨</span>
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">AstroSaaS</span>
          </a>
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Close sidebar"
          >
            <XMarkIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        {/* Sidebar Content */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-8">
          {/* Quick Actions */}
          <section>
            <h3 className="px-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              Quick Actions
            </h3>
            <div className="space-y-1">
              <a
                href="/charts/new"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
              >
                <PlusIcon className="w-5 h-5" />
                <span className="font-medium">New Chart</span>
              </a>
              <a
                href="/dashboard"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <HomeIcon className="w-5 h-5" />
                <span>Dashboard</span>
              </a>
            </div>
          </section>

          {/* Features */}
          <section>
            <h3 className="px-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              Features
            </h3>
            <div className="space-y-1">
              <a
                href="/calendar"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <CalendarIcon className="w-5 h-5" />
                <span>Calendar</span>
              </a>
              <a
                href="/synastry"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span>Synastry</span>
              </a>
              <a
                href="/transits"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <ClockIcon className="w-5 h-5" />
                <span>Transits</span>
              </a>
            </div>
          </section>

          {/* Returns */}
          <section>
            <h3 className="px-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              Returns
            </h3>
            <div className="space-y-1">
              <a
                href="/solar-returns"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <StarIcon className="w-5 h-5" />
                <span>Solar Returns</span>
              </a>
              <a
                href="/lunar-returns"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <MoonIcon className="w-5 h-5" />
                <span>Lunar Returns</span>
              </a>
            </div>
          </section>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg p-4">
            <p className="text-sm font-medium text-indigo-900 dark:text-indigo-100 mb-1">
              Upgrade to Premium
            </p>
            <p className="text-xs text-indigo-700 dark:text-indigo-300 mb-3">
              Get unlimited charts and detailed analysis
            </p>
            <a
              href="/subscription"
              className="block text-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Upgrade Now
            </a>
          </div>
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
    if (href === '/') {
      return activePath === '/';
    }
    return activePath.startsWith(href);
  }, [activePath]);

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
      aria-label="Mobile navigation"
    >
      <div className="flex items-center justify-around">
        {mobileNavItems.map((item) => {
          const active = isActive(item.href);
          return (
            <a
              key={item.name}
              href={item.href}
              className="flex flex-col items-center justify-center flex-1 min-h-[56px] relative transition-all duration-200 group"
              aria-label={item.label}
              aria-current={active ? 'page' : undefined}
            >
              {/* Active indicator bar */}
              {active && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
              )}

              {/* Icon with active state */}
              <span
                className={`
                  relative p-2 rounded-xl transition-all duration-200
                  ${
                    active
                      ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                      : 'text-gray-600 dark:text-gray-400 group-hover:bg-gray-100 dark:group-hover:bg-gray-700/50'
                  }
                  active:scale-95 active:bg-gray-200 dark:active:bg-gray-700
                `}
                style={{ minWidth: '44px', minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <item.icon
                  className={`
                    w-6 h-6 transition-all duration-200
                    ${active ? 'scale-110' : 'group-hover:scale-105'}
                  `}
                  strokeWidth={active ? 2.5 : 2}
                />
              </span>

              {/* Label with active state */}
              <span
                className={`
                  text-xs mt-0.5 font-medium transition-colors duration-200
                  ${active ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400'}
                `}
              >
                {item.label}
              </span>
            </a>
          );
        })}

        {/* Profile button */}
        <a
          href="/profile"
          className={`flex flex-col items-center justify-center flex-1 min-h-[56px] relative transition-all duration-200 group`}
          aria-label="Profile"
          aria-current={activePath === '/profile' ? 'page' : undefined}
        >
          {/* Active indicator bar */}
          {activePath === '/profile' && (
            <span className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
          )}

          {/* Avatar with active state */}
          <span
            className={`
              relative p-2 rounded-xl transition-all duration-200
              ${
                activePath === '/profile'
                  ? 'bg-indigo-100 dark:bg-indigo-900/30 ring-2 ring-indigo-600 dark:ring-indigo-400 ring-offset-2 dark:ring-offset-gray-800'
                  : 'group-hover:bg-gray-100 dark:group-hover:bg-gray-700/50'
              }
              active:scale-95 active:bg-gray-200 dark:active:bg-gray-700
            `}
            style={{ minWidth: '44px', minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <div
              className={`
                w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-medium transition-all duration-200
                ${activePath === '/profile' ? 'scale-110 ring-2 ring-white dark:ring-gray-800' : 'group-hover:scale-105'}
              `}
            >
              {user?.name?.charAt(0).toUpperCase() ?? 'U'}
            </div>
          </span>

          {/* Label with active state */}
          <span
            className={`
              text-xs mt-0.5 font-medium transition-colors duration-200
              ${activePath === '/profile' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400'}
            `}
          >
            Profile
          </span>
        </a>
      </div>
    </nav>
  );
});

// Footer Component
const Footer = React.memo(function Footer() {
  return (
    <footer className="mt-auto border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Product */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Product</h3>
            <ul className="space-y-3">
              <li>
                <a href="/features" className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400">
                  Features
                </a>
              </li>
              <li>
                <a href="/pricing" className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400">
                  Pricing
                </a>
              </li>
              <li>
                <a href="/api" className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400">
                  API
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Resources</h3>
            <ul className="space-y-3">
              <li>
                <a href="/learn" className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400">
                  Learn Astrology
                </a>
              </li>
              <li>
                <a href="/blog" className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400">
                  Blog
                </a>
              </li>
              <li>
                <a href="/support" className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400">
                  Support
                </a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Company</h3>
            <ul className="space-y-3">
              <li>
                <a href="/about" className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400">
                  About
                </a>
              </li>
              <li>
                <a href="/careers" className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400">
                  Careers
                </a>
              </li>
              <li>
                <a href="/contact" className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Legal</h3>
            <ul className="space-y-3">
              <li>
                <a href="/privacy" className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/terms" className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="/cookies" className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400">
                  Cookie Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded flex items-center justify-center">
              <span className="text-white text-xs font-bold">✨</span>
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              © 2026 AstroSaaS. All rights reserved.
            </span>
          </div>

          <div className="flex items-center gap-4">
            <a href="#" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <span className="sr-only">Twitter</span>
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
              </svg>
            </a>
            <a href="#" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <span className="sr-only">GitHub</span>
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
});

// Navigation data
const navItems = [
  { name: 'charts', label: 'Charts', href: '/charts' },
  { name: 'forecast', label: 'Forecast', href: '/forecast' },
  { name: 'learn', label: 'Learn', href: '/learn' },
];

const mobileNavItems = [
  { name: 'home', label: 'Home', href: '/', icon: HomeIcon },
  { name: 'charts', label: 'Charts', href: '/charts', icon: StarIcon },
  { name: 'transits', label: 'Transits', href: '/transits', icon: MoonIcon },
  { name: 'learn', label: 'Learn', href: '/learn', icon: ChartBarIcon },
];
