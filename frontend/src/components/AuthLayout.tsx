import { type ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
  leftPanel: ReactNode;
}

export function AuthLayout({ children, leftPanel }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row bg-cosmic-page">
      <a href="#main-content" className="skip-link">Skip to main content</a>

      {/* Left Panel — Brand & Artwork */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-1/2 relative flex-col justify-between overflow-hidden bg-cosmic-page">
        {leftPanel}
      </div>

      {/* Right Panel — Form */}
      <main id="main-content" tabIndex={-1} className="w-full lg:w-7/12 xl:w-1/2 flex items-center justify-center p-6 lg:p-12 relative">
        {/* Background glows */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-cosmic-blue/10 rounded-full blur-[80px] pointer-events-none" />

        <div className="w-full max-w-[440px] z-10">
          {/* Mobile Logo */}
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20 text-primary">
              <span className="material-symbols-outlined" aria-hidden="true">auto_awesome</span>
            </div>
            <span className="text-2xl font-bold text-white">AstroVerse</span>
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
