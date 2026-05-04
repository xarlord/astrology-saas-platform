/**
 * Chart Create Page Component
 * Full chart creation form with geocoding and house system selection
 */

import { useNavigate } from 'react-router-dom';
import { AppLayout, BirthDataForm } from '../components';

export default function ChartCreatePage() {
  const navigate = useNavigate();

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto py-8 px-4">
        <h1 className="font-display text-3xl font-bold text-white mb-6">Create New Chart</h1>
        <BirthDataForm onSuccess={(chartId) => navigate(`/charts/${chartId}`)} />
      </div>
    </AppLayout>
  );
}
