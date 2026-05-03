/**
 * Chart Create Page
 *
 * Renders the BirthDataForm inside AppLayout. On successful chart creation
 * the user is navigated to the chart detail view.
 */

import { useNavigate } from 'react-router-dom';
import { AppLayout, BirthDataForm } from '../components';

export default function ChartCreatePage() {
  const navigate = useNavigate();

  const handleSuccess = (chartId: string) => {
    void navigate(`/charts/${chartId}`);
  };

  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 gradient-text">Create Natal Chart</h1>
        <p className="text-slate-200">
          Enter your birth information to generate a detailed natal chart.
        </p>
      </div>

      <div className="max-w-2xl mx-auto glass-panel rounded-2xl p-6">
        <BirthDataForm onSuccess={handleSuccess} />
      </div>
    </AppLayout>
  );
}
