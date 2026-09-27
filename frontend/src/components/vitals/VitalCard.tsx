import React from 'react';
import {
  Activity,
  Heart,
  Droplet,
  Thermometer,
  Wind,
  Scale,
  TrendingUp,
  TrendingDown,
  Minus,
  Plus,
  ArrowRight,
  Clock,
} from 'lucide-react';
import { MeasurementType, VitalSummaryItem } from '../../types/vital';
import { Badge } from '../ui/Badge';

interface VitalCardProps {
  type: MeasurementType;
  summary?: VitalSummaryItem;
  onRecord: (type: MeasurementType) => void;
  onViewDetails: (type: MeasurementType) => void;
}

export const VitalCard: React.FC<VitalCardProps> = ({
  type,
  summary,
  onRecord,
  onViewDetails,
}) => {
  const getVitalMeta = (vitalType: MeasurementType) => {
    switch (vitalType) {
      case 'BLOOD_PRESSURE':
        return {
          label: 'Blood Pressure',
          icon: Activity,
          color: 'text-primary',
          bgColor: 'bg-primary/10',
          borderColor: 'border-primary/20',
          unit: 'mmHg',
        };
      case 'HEART_RATE':
        return {
          label: 'Heart Rate',
          icon: Heart,
          color: 'text-brand-darkPink',
          bgColor: 'bg-brand-darkPink/10',
          borderColor: 'border-brand-darkPink/20',
          unit: 'bpm',
        };
      case 'BLOOD_GLUCOSE':
        return {
          label: 'Blood Glucose',
          icon: Droplet,
          color: 'text-primary-deep',
          bgColor: 'bg-primary-deep/10',
          borderColor: 'border-primary-deep/20',
          unit: 'mg/dL',
        };
      case 'SPO2':
        return {
          label: 'Oxygen Saturation (SpO2)',
          icon: Wind,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          unit: '%',
        };
      case 'TEMPERATURE':
        return {
          label: 'Body Temperature',
          icon: Thermometer,
          color: 'text-amber-600',
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-200',
          unit: '°C',
        };
      case 'WEIGHT':
        return {
          label: 'Weight',
          icon: Scale,
          color: 'text-emerald-600',
          bgColor: 'bg-emerald-50',
          borderColor: 'border-emerald-200',
          unit: 'kg',
        };
      default:
        return {
          label: vitalType.replace('_', ' '),
          icon: Activity,
          color: 'text-gray-700',
          bgColor: 'bg-gray-100',
          borderColor: 'border-gray-200',
          unit: '',
        };
    }
  };

  const meta = getVitalMeta(type);
  const Icon = meta.icon;
  const latest = summary?.latestReading;

  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 3600 * 24));
    if (diffDays === 0) {
      return `Today, ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    if (diffDays === 1) {
      return `Yesterday, ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between group">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${meta.bgColor} ${meta.color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 leading-none">{meta.label}</h3>
              <span className="text-[11px] text-gray-500">{meta.unit}</span>
            </div>
          </div>
          {latest?.measurementContext && (
            <Badge variant="neutral" size="sm" className="capitalize text-[10px]">
              {latest.measurementContext.toLowerCase().replace('_', ' ')}
            </Badge>
          )}
        </div>

        {/* Value Display */}
        {latest ? (
          <div className="mt-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-gray-900 tracking-tight">
                {type === 'BLOOD_PRESSURE' && latest.systolic != null
                  ? `${Math.round(latest.systolic)} / ${Math.round(latest.diastolic || 0)}`
                  : type === 'BLOOD_GLUCOSE' || type === 'TEMPERATURE' || type === 'WEIGHT'
                  ? latest.valueNumeric.toFixed(1)
                  : Math.round(latest.valueNumeric)}
              </span>
              <span className="text-xs font-semibold text-gray-500">{latest.unit}</span>
            </div>

            {/* Change Indicator & Timestamp */}
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50 text-[11px] text-gray-500">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-gray-400" />
                <span>{formatDate(latest.measurementTime)}</span>
              </div>
              {summary?.change != null && (
                <div
                  className={`flex items-center gap-0.5 font-medium ${
                    summary.change === 0
                      ? 'text-gray-400'
                      : summary.change > 0
                      ? 'text-amber-600'
                      : 'text-primary'
                  }`}
                >
                  {summary.change > 0 ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : summary.change < 0 ? (
                    <TrendingDown className="w-3 h-3" />
                  ) : (
                    <Minus className="w-3 h-3" />
                  )}
                  <span>
                    {summary.change > 0 ? `+${summary.change}` : summary.change} {latest.unit}
                  </span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="py-4 my-1 text-center bg-gray-50/60 rounded-xl border border-dashed border-gray-200">
            <p className="text-xs text-gray-500">No recent reading</p>
            <button
              onClick={() => onRecord(type)}
              className="mt-1.5 text-xs text-primary font-semibold hover:underline inline-flex items-center gap-1"
            >
              <Plus className="w-3 h-3" /> Log Measurement
            </button>
          </div>
        )}
      </div>

      {/* Footer Navigation */}
      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
        <button
          onClick={() => onViewDetails(type)}
          className="text-xs font-semibold text-gray-700 hover:text-primary transition-colors flex items-center gap-1"
        >
          View Trends <ArrowRight className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onRecord(type)}
          className="p-1.5 rounded-lg text-gray-500 hover:text-primary hover:bg-warm-cream/50 transition-colors"
          title={`Record new ${meta.label}`}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
