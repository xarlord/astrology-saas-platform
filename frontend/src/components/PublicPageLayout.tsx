import { Link } from 'react-router-dom';

interface PublicPageLayoutProps {
  children: React.ReactNode;
  hideAuthLinks?: boolean;
}

export function PublicPageLayout({ children, hideAuthLinks }: PublicPageLayoutProps) {
  return (
    <div className="min-h-screen bg-[var(--color-bg-page)]">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <main
        id="main-content"
        className="flex-1"
        tabIndex={-1}
      >
        {children}
      </main>

      <footer className="border-t border-[var(--color-border)] bg-[var(--color-bg-card-solid)]">
        <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
              <span className="text-white text-xs font-bold">✨</span>
            </div>
            <span className="text-sm text-slate-200">
              © 2026 AstroSaaS. All rights reserved.
            </span>
          </div>

          {!hideAuthLinks && (
            <div className="flex items-center gap-6">
              <Link to="/login" className="text-sm text-slate-200 hover:text-white transition-colors">
                Login
              </Link>
              <Link to="/register" className="text-sm text-slate-200 hover:text-white transition-colors">
                Register
              </Link>
            </div>
          )}
        </div>
      </footer>
    </div>
  );
}
