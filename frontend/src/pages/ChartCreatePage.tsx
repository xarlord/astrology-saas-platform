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
        <h2 className="text-3xl font-bold mb-2">Create Natal Chart</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Enter your birth information to generate a detailed natal chart.
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        <BirthDataForm onSuccess={handleSuccess} />
      </div>
    </AppLayout>
  );
}
