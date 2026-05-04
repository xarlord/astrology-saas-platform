import { Link } from 'react-router-dom';
import { PublicPageLayout } from '../components/PublicPageLayout';

export function NotFoundPage() {
  return (
    <PublicPageLayout>
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="text-center">
          <span className="material-symbols-outlined text-primary mb-6" style={{ fontSize: '80px' }} aria-hidden="true">
            explore_off
          </span>
          <h1 className="text-4xl font-bold text-white mb-4">Page Not Found</h1>
          <p className="text-slate-200 mb-8 max-w-md mx-auto">
            The page you're looking for doesn't exist or has been moved. Let's get you back on track.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }} aria-hidden="true">home</span>
              Go Home
            </Link>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-white/15 border border-cosmic-border text-slate-200 rounded-lg font-medium hover:bg-white/15 transition-colors"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    </PublicPageLayout>
  );
}
