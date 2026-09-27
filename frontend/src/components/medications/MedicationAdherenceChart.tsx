import React from 'react';
import {
  TrendingUp,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Pill,
  Info
} from 'lucide-react';
import { MedicationAdherenceResponse, MedicationAdherenceSummary } from '../../types/medication';

interface MedicationAdherenceChartProps {
  adherenceData: MedicationAdherenceResponse | null;
  period: string;
  onPeriodChange: (period: string) => void;
  isLoading?: boolean;
}

export const MedicationAdherenceChart: React.FC<MedicationAdherenceChartProps> = ({
  adherenceData,
  period,
  onPeriodChange,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-orange-100 p-6 shadow-sm animate-pulse space-y-6">
        <div className="h-6 bg-orange-100/60 rounded-md w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  const overall = adherenceData?.overallAdherencePercentage ?? 100;
  const totalTaken = adherenceData?.totalTakenDoses ?? 0;
  const totalSkipped = adherenceData?.totalSkippedDoses ?? 0;
  const totalMissed = adherenceData?.totalMissedDoses ?? 0;
  const summaries: MedicationAdherenceSummary[] =
    adherenceData?.medicationSummaries || adherenceData?.medications || [];

  const getAdherenceColor = (pct: number) => {
    if (pct >= 85) return 'text-emerald-600 bg-emerald-500';
    if (pct >= 65) return 'text-amber-600 bg-amber-500';
    return 'text-red-600 bg-red-500';
  };

  return (
    <div className="bg-white rounded-2xl border border-orange-100/90 shadow-sm p-6 space-y-6">
      {/* Header & Period Selectors */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
        <div>
          <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-orange-600" />
            <span>Medication Adherence Overview</span>
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {adherenceData?.periodLabel || 'Adherence rate based on your logged doses'}
          </p>
        </div>

        {/* Period Selector Tabs */}
        <div className="inline-flex p-1 bg-gray-100 rounded-xl text-xs font-semibold text-gray-600 self-start sm:self-center">
          {[
            { id: '7_DAYS', label: '7 Days' },
            { id: '30_DAYS', label: '30 Days' },
            { id: '90_DAYS', label: '90 Days' },
            { id: '6_MONTHS', label: '6 Months' },
            { id: '1_YEAR', label: '1 Year' }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => onPeriodChange(tab.id)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                period === tab.id
                  ? 'bg-white text-orange-700 shadow-sm font-bold'
                  : 'hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Overall Score */}
        <div className="bg-gradient-to-br from-orange-50 to-pink-50/40 p-4 rounded-xl border border-orange-100 flex flex-col justify-between">
          <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Overall Adherence</span>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className={`text-3xl font-extrabold ${getAdherenceColor(overall).split(' ')[0]}`}>
              {overall}%
            </span>
            <span className="text-xs font-medium text-gray-500">of doses logged</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-3 overflow-hidden">
            <div
              className={`h-1.5 rounded-full ${getAdherenceColor(overall).split(' ')[1]}`}
              style={{ width: `${overall}%` }}
            ></div>
          </div>
        </div>

        {/* Taken Count */}
        <div className="bg-emerald-50/40 p-4 rounded-xl border border-emerald-100 flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-800 text-xs font-bold uppercase tracking-wider">
            <span>Taken Doses</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-extrabold text-emerald-950">{totalTaken}</span>
            <span className="text-xs text-emerald-700 ml-1.5">doses recorded</span>
          </div>
          <span className="text-[11px] text-emerald-600 font-medium">Logged on schedule</span>
        </div>

        {/* Skipped Count */}
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-700 text-xs font-bold uppercase tracking-wider">
            <span>Skipped</span>
            <XCircle className="w-4 h-4 text-gray-500" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-extrabold text-gray-900">{totalSkipped}</span>
            <span className="text-xs text-gray-500 ml-1.5">doses</span>
          </div>
          <span className="text-[11px] text-gray-500 font-medium">Intentionally skipped</span>
        </div>

        {/* Missed Count */}
        <div className="bg-red-50/40 p-4 rounded-xl border border-red-100 flex flex-col justify-between">
          <div className="flex items-center justify-between text-red-800 text-xs font-bold uppercase tracking-wider">
            <span>Missed</span>
            <AlertCircle className="w-4 h-4 text-red-600" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-extrabold text-red-950">{totalMissed}</span>
            <span className="text-xs text-red-700 ml-1.5">doses</span>
          </div>
          <span className="text-[11px] text-red-600 font-medium">Overdue / unconfirmed</span>
        </div>
      </div>

      {/* Per-Medication Breakdown */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-gray-900 flex items-center space-x-2">
          <Pill className="w-4 h-4 text-pink-700" />
          <span>Adherence by Medication</span>
        </h4>

        {summaries.length === 0 ? (
          <div className="text-center py-6 text-xs text-gray-500 bg-gray-50 rounded-xl">
            No medication data available for this timeframe.
          </div>
        ) : (
          <div className="space-y-3">
            {summaries.map((item: MedicationAdherenceSummary) => {
              const pct = item.adherencePercentage ?? 100;
              return (
                <div
                  key={item.medicationId}
                  className="bg-gray-50/80 rounded-xl p-3.5 border border-gray-200/80 hover:border-orange-200 transition"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-gray-900">{item.medicineName}</span>
                      {item.strength && (
                        <span className="text-xs text-gray-500">({item.strength})</span>
                      )}
                    </div>
                    <div className="flex items-center space-x-3 text-xs">
                      <span className="text-gray-500">
                        {item.takenDoses} / {item.takenDoses + item.skippedDoses + item.missedDoses} doses
                      </span>
                      <span className={`font-bold ${getAdherenceColor(pct).split(' ')[0]}`}>
                        {pct}%
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${getAdherenceColor(pct).split(' ')[1]}`}
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Safety Notice */}
      <div className="p-3.5 bg-pink-50/50 border border-pink-100 rounded-xl flex items-start space-x-2.5 text-xs text-pink-950">
        <Info className="w-4 h-4 text-pink-700 mt-0.5 shrink-0" />
        <div>
          <span className="font-semibold">Clinical Note:</span> Adherence statistics calculate the percentage of doses recorded as taken against scheduled intervals. Health Buddy does not infer drug efficacy, medical appropriateness, or physiological impact. Always consult your doctor regarding changes to your medication schedule.
        </div>
      </div>
    </div>
  );
};
