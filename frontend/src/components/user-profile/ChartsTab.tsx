import { useNavigate } from 'react-router-dom';
import { EmptyState } from '../EmptyState';
import { APP_LOCALE } from '../../utils/constants';
import type { Chart } from './types';

export interface ChartsTabProps {
  charts?: Chart[];
  onEditChart?: (chartId: string) => void;
  onViewChart?: (chartId: string) => void;
  onDeleteChart?: (chartId: string) => void;
}

export function ChartsTab({
  charts,
  onEditChart,
  onViewChart,
  onDeleteChart,
}: ChartsTabProps) {
  const navigate = useNavigate();
  if (!charts || charts.length === 0) {
    return (
      <div className="text-center py-12">
        <EmptyState
          icon="auto_awesome"
          title="No charts yet"
          description="Create your first natal chart to get started"
          actionText="Create Your First Chart"
          onAction={() => navigate('/charts/new')}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="charts-tab-content">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">
          My Charts ({charts.length})
        </h3>
        <button type="button" className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
          <span className="material-symbols-outlined text-4xl" aria-hidden="true">add</span>
          Add New Chart
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {charts.map((chart) => (
          <ChartCard
            key={chart.id}
            chart={chart}
            onEdit={() => onEditChart?.(chart.id)}
            onView={() => onViewChart?.(chart.id)}
            onDelete={() => onDeleteChart?.(chart.id)}
          />
        ))}
      </div>
    </div>
  );
}

// Chart Card Component (internal to ChartsTab)
interface ChartCardProps {
  chart: Chart;
  onEdit?: () => void;
  onView?: () => void;
  onDelete?: () => void;
}

function ChartCard({
  chart,
  onEdit,
  onView,
  onDelete,
}: ChartCardProps) {
  return (
    <div className="bg-white/15 rounded-lg border border-white/15 overflow-hidden hover:shadow-lg transition-shadow">
      {/* Chart Thumbnail */}
      <div className="aspect-square bg-gradient-to-br from-white/5 to-white/[0.02] flex items-center justify-center p-4">
        <div className="w-full h-full flex items-center justify-center text-slate-200">
          <span className="text-sm">Chart Preview</span>
        </div>
      </div>

      {/* Chart Info */}
      <div className="p-4">
        <h4 className="font-semibold text-white mb-1">{chart.name}</h4>
        <p className="text-sm text-slate-200 mb-2">
          {new Date(chart.birthData.date).toLocaleDateString(APP_LOCALE, {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })}{' '}
          • {chart.birthData.place.name}
        </p>
        <div className="flex items-center gap-2 text-xs text-slate-200">
          <span className="capitalize">{chart.settings.houseSystem}</span>
          <span>•</span>
          <span className="capitalize">{chart.settings.zodiac}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 pb-4 flex gap-2">
        <button
          type="button"
          onClick={onView}
          className="flex-1 px-3 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
        >
          View
        </button>
        <button
          type="button"
          onClick={onEdit}
          className="px-3 py-2 border border-white/15 text-slate-200 text-sm font-medium rounded-lg hover:bg-white/15 transition-colors"
          aria-label="Edit chart"
        >
          <span className="material-symbols-outlined text-4xl" aria-hidden="true">edit</span>
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="px-3 py-2 border border-red-800 text-red-400 text-sm font-medium rounded-lg hover:bg-red-900/20 transition-colors"
          aria-label="Delete chart"
        >
          <span className="material-symbols-outlined text-4xl" aria-hidden="true">delete</span>
        </button>
      </div>
    </div>
  );
}
