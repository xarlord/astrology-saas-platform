/**
 * Chart Create Page Component
 * Redirects to the full Chart Creation Wizard
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

export default function ChartCreatePage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to the full chart creation wizard
    navigate('/charts/create', { replace: true });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <LoadingSpinner size="lg" />
      <span className="ml-3 text-slate-400">Redirecting to chart creation...</span>
    </div>
  );
}
