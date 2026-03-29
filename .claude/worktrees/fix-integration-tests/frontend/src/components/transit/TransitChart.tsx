/**
 * TransitChart Component
 * Line chart showing energy levels over time
 */

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  DotProps,
} from 'recharts';

export interface TransitDataPoint {
  date: string;
  energy: number;
  isMajorEvent?: boolean;
  eventName?: string;
  eventDescription?: string;
}

export interface TransitChartProps {
  data: TransitDataPoint[];
  height?: number;
  showGrid?: boolean;
  showReferenceLines?: boolean;
  color?: string;
  onDataPointClick?: (point: TransitDataPoint) => void;
  'aria-label'?: string;
}

interface TooltipProps {
  active?: boolean;
  payload?: { payload: TransitDataPoint }[];
}

const CustomTooltip = ({ active, payload }: TooltipProps) => {
  if (active && payload?.length) {
    const data = payload[0]?.payload;
    if (!data) return null;

    return (
      <div className="bg-surface-dark border border-glass-border rounded-lg p-3 shadow-xl">
        <p className="text-white text-sm font-semibold">
          {new Date(data.date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          })}
        </p>
        <p className="text-slate-300 text-xs mt-1">Energy: {data.energy}%</p>
        {data.isMajorEvent && data.eventName && (
          <>
            <p className="text-primary text-xs font-semibold mt-2">{data.eventName}</p>
            {data.eventDescription && (
              <p className="text-slate-400 text-xs mt-1">{data.eventDescription}</p>
            )}
          </>
        )}
      </div>
    );
  }
  return null;
};

const CustomDot = (props: DotProps & { dataPoint?: TransitDataPoint; onClick?: (point: TransitDataPoint) => void }) => {
  const { cx, cy, dataPoint, onClick } = props;

  if (!dataPoint || !dataPoint.isMajorEvent) {
    return <circle cx={cx} cy={cy} r={3} fill="#6b3de1" opacity={0.6} />;
  }

  return (
    <g>
      <circle
        cx={cx}
        cy={cy}
        r={6}
        fill="#fbbf24"
        opacity={0.3}
        className="cursor-pointer hover:opacity-50 transition-opacity"
        onClick={() => onClick?.(dataPoint)}
      />
      <circle
        cx={cx}
        cy={cy}
        r={4}
        fill="#fbbf24"
        className="cursor-pointer"
        onClick={() => onClick?.(dataPoint)}
      />
    </g>
  );
};

const TransitChart: React.FC<TransitChartProps> = ({
  data,
  height = 300,
  showGrid = true,
  showReferenceLines = true,
  color = '#6b3de1',
  onDataPointClick,
  'aria-label': ariaLabel = 'Transit energy chart',
}) => {

  // Format date for X-axis
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Generate chart data
  const chartData = data.map((point) => ({
    ...point,
    formattedDate: formatDate(point.date),
  }));

  return (
    <div className="w-full" aria-label={ariaLabel}>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
          {showGrid && (
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255, 255, 255, 0.05)"
              vertical={false}
            />
          )}

          <XAxis
            dataKey="formattedDate"
            tick={{ fill: '#64748b', fontSize: 12 }}
            stroke="rgba(255, 255, 255, 0.1)"
          />

          <YAxis
            domain={[0, 100]}
            tick={{ fill: '#64748b', fontSize: 12 }}
            stroke="rgba(255, 255, 255, 0.1)"
            label={{ value: 'Energy', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 11 }}
          />

          {showReferenceLines && (
            <>
              <ReferenceLine y={70} stroke="#22c55e" strokeDasharray="3 3" opacity={0.3} />
              <ReferenceLine y={40} stroke="#fbbf24" strokeDasharray="3 3" opacity={0.3} />
            </>
          )}

          <Tooltip content={<CustomTooltip />} />

          <Line
            type="monotone"
            dataKey="energy"
            stroke={color}
            strokeWidth={2}
            dot={(props: DotProps & { dataPoint?: TransitDataPoint; onClick?: (point: TransitDataPoint) => void }) => {
              const index = 'payload' in props && props.payload && typeof props.payload === 'object' && 'index' in props.payload
                ? (props.payload.index as number)
                : 0;
              return (
                <CustomDot
                  {...props}
                  dataPoint={data[index]}
                  onClick={onDataPointClick}
                />
              );
            }}
            activeDot={{ r: 6, fill: color, stroke: '#fff', strokeWidth: 2 }}
            animationDuration={1000}
            animationBegin={0}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Legend */}
      {showReferenceLines && (
        <div className="flex justify-center gap-6 mt-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-green-500"></div>
            <span className="text-slate-400">High Energy (70+)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-yellow-500"></div>
            <span className="text-slate-400">Medium (40-70)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-red-500"></div>
            <span className="text-slate-400">Low (&lt;40)</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransitChart;
