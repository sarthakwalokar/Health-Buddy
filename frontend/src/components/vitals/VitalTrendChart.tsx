import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { VitalTrendResponse } from '../../types/vital';
import { Table, LineChart as ChartIcon, Calendar, Info } from 'lucide-react';

interface VitalTrendChartProps {
  trendData: VitalTrendResponse | undefined;
  isLoading: boolean;
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
}

export const VitalTrendChart: React.FC<VitalTrendChartProps> = ({
  trendData,
  isLoading,
  selectedPeriod,
  onPeriodChange,
}) => {
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');

  const periods = [
    { key: '7_DAYS', label: '7 Days' },
    { key: '30_DAYS', label: '30 Days' },
    { key: '90_DAYS', label: '90 Days' },
    { key: '6_MONTHS', label: '6 Months' },
    { key: '1_YEAR', label: '1 Year' },
  ];

  const isBloodPressure = trendData?.measurementType === 'BLOOD_PRESSURE';

  const chartData = (trendData?.dataPoints || []).map((dp) => {
    const d = new Date(dp.timestamp);
    const dateLabel = d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    const timeLabel = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return {
      date: `${dateLabel} ${timeLabel}`,
      rawDate: dp.timestamp,
      value: dp.value,
      secondaryValue: dp.secondaryValue,
      systolic: isBloodPressure ? dp.value : undefined,
      diastolic: isBloodPressure ? dp.secondaryValue : undefined,
      context: dp.context,
    };
  });

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
      {/* Header with Range Controls and View Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-gray-100">
        <div>
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            Historical Trend & Statistics
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {trendData?.measurementType.replace('_', ' ')} over time ({trendData?.unit})
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Period Selector */}
          <div className="flex items-center bg-gray-100 p-1 rounded-xl">
            {periods.map((p) => (
              <button
                key={p.key}
                onClick={() => onPeriodChange(p.key)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                  selectedPeriod === p.key
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* View Toggle */}
          <button
            onClick={() => setViewMode(viewMode === 'chart' ? 'table' : 'chart')}
            className="p-2 border border-gray-200 rounded-xl text-gray-600 hover:text-primary hover:bg-gray-50 transition-colors"
            title={viewMode === 'chart' ? 'View as accessible data table' : 'View chart'}
            aria-label="Toggle chart table view"
          >
            {viewMode === 'chart' ? <Table className="w-4 h-4" /> : <ChartIcon className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Statistical Summary Pills */}
      {trendData && trendData.totalReadings > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-5">
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
            <span className="text-[11px] font-medium text-gray-500 block">Latest Value</span>
            <span className="text-base font-extrabold text-gray-900">
              {isBloodPressure && trendData.latestSecondaryValue != null
                ? `${Math.round(trendData.latestValue || 0)} / ${Math.round(trendData.latestSecondaryValue)}`
                : trendData.latestValue?.toFixed(1) || 'N/A'}{' '}
              <span className="text-xs font-normal text-gray-500">{trendData.unit}</span>
            </span>
          </div>

          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
            <span className="text-[11px] font-medium text-gray-500 block">Period Average</span>
            <span className="text-base font-extrabold text-gray-900">
              {isBloodPressure && trendData.averageSecondaryValue != null
                ? `${trendData.averageValue?.toFixed(0)} / ${trendData.averageSecondaryValue?.toFixed(0)}`
                : trendData.averageValue?.toFixed(1) || 'N/A'}{' '}
              <span className="text-xs font-normal text-gray-500">{trendData.unit}</span>
            </span>
          </div>

          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
            <span className="text-[11px] font-medium text-gray-500 block">Observed Range</span>
            <span className="text-base font-extrabold text-gray-900">
              {trendData.minValue?.toFixed(0)} - {trendData.maxValue?.toFixed(0)}{' '}
              <span className="text-xs font-normal text-gray-500">{trendData.unit}</span>
            </span>
          </div>

          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
            <span className="text-[11px] font-medium text-gray-500 block">Total Readings</span>
            <span className="text-base font-extrabold text-gray-900">{trendData.totalReadings}</span>
          </div>
        </div>
      )}

      {/* Chart Area / Table Area */}
      {isLoading ? (
        <div className="h-72 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : chartData.length === 0 ? (
        <div className="h-72 flex flex-col items-center justify-center text-center p-6 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
          <Calendar className="w-8 h-8 text-gray-400 mb-2" />
          <h4 className="text-sm font-semibold text-gray-800">No data points for this period</h4>
          <p className="text-xs text-gray-500 mt-1 max-w-sm">
            Record measurements regularly to track trends and changes over time.
          </p>
        </div>
      ) : viewMode === 'chart' ? (
        <div className="h-72 w-full mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickLine={false}
                axisLine={false}
                domain={['auto', 'auto']}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
              {isBloodPressure ? (
                <>
                  <Line
                    type="monotone"
                    dataKey="systolic"
                    name="Systolic (Upper)"
                    stroke="#F97316"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: '#F97316' }}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="diastolic"
                    name="Diastolic (Lower)"
                    stroke="#BE185D"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: '#BE185D' }}
                    activeDot={{ r: 5 }}
                  />
                </>
              ) : (
                <Line
                  type="monotone"
                  dataKey="value"
                  name={`${trendData?.measurementType.replace('_', ' ')} (${trendData?.unit})`}
                  stroke="#F97316"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#F97316' }}
                  activeDot={{ r: 5 }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        /* Accessible Table View */
        <div className="overflow-x-auto mt-2 max-h-72 border border-gray-100 rounded-xl">
          <table className="w-full text-left text-xs text-gray-700">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase tracking-wider font-semibold sticky top-0">
              <tr>
                <th className="py-2.5 px-3">Date & Time</th>
                <th className="py-2.5 px-3">Value ({trendData?.unit})</th>
                {isBloodPressure && <th className="py-2.5 px-3">Diastolic</th>}
                <th className="py-2.5 px-3">Context</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {chartData.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50/80">
                  <td className="py-2 px-3">{row.date}</td>
                  <td className="py-2 px-3 font-semibold text-gray-900">
                    {isBloodPressure ? row.systolic : row.value}
                  </td>
                  {isBloodPressure && <td className="py-2 px-3 text-gray-900">{row.diastolic}</td>}
                  <td className="py-2 px-3 text-gray-500">{row.context || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Descriptive Text Summary */}
      {trendData?.descriptiveSummary && (
        <div className="mt-5 p-3.5 bg-warm-cream/30 rounded-xl border border-warm-cream/60 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <div className="text-xs text-gray-700 leading-relaxed">
            <span className="font-semibold text-gray-900">Summary: </span>
            {trendData.descriptiveSummary}
          </div>
        </div>
      )}
    </div>
  );
};
