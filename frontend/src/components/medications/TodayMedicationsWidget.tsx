import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Pill,
  Clock,
  CheckCircle2,
  AlertCircle,
  Check,
  X,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import {
  TodayMedicationsSummaryResponse,
  DoseStatus
} from '../../types/medication';

interface TodayMedicationsWidgetProps {
  summary: TodayMedicationsSummaryResponse | null;
  isLoading?: boolean;
  onMarkTaken: (doseId: string) => Promise<void>;
  onMarkSkipped: (doseId: string) => Promise<void>;
}

export const TodayMedicationsWidget: React.FC<TodayMedicationsWidgetProps> = ({
  summary,
  isLoading = false,
  onMarkTaken,
  onMarkSkipped
}) => {
  const navigate = useNavigate();
  const [loadingDoseId, setLoadingDoseId] = useState<string | null>(null);

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    } catch {
      return isoString;
    }
  };

  const handleAction = async (doseId: string, action: 'taken' | 'skipped') => {
    try {
      setLoadingDoseId(doseId);
      if (action === 'taken') {
        await onMarkTaken(doseId);
      } else {
        await onMarkSkipped(doseId);
      }
    } catch (err) {
      console.error('Failed to update dose status', err);
    } finally {
      setLoadingDoseId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-orange-100 p-6 shadow-sm animate-pulse space-y-4">
        <div className="h-6 bg-orange-100/60 rounded-md w-1/3"></div>
        <div className="space-y-3">
          <div className="h-16 bg-gray-100 rounded-xl"></div>
          <div className="h-16 bg-gray-100 rounded-xl"></div>
        </div>
      </div>
    );
  }

  const doses = summary?.doses || [];
  const total = summary?.totalScheduledToday || 0;
  const taken = summary?.takenToday || 0;
  const progressPercent = total > 0 ? Math.round((taken / total) * 100) : 0;

  return (
    <div className="bg-white rounded-2xl border border-orange-100/90 shadow-sm p-6 overflow-hidden relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-500 to-pink-600 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 tracking-tight flex items-center space-x-2">
              <span>Today's Medications</span>
            </h2>
            <p className="text-xs text-gray-500">
              {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
            </p>
          </div>
        </div>

        {total > 0 && (
          <div className="flex items-center space-x-4 bg-orange-50/60 px-3.5 py-1.5 rounded-xl border border-orange-200/50">
            <div className="text-xs">
              <span className="text-gray-500 font-medium">Completed: </span>
              <span className="font-bold text-orange-950">
                {taken} of {total} doses
              </span>
            </div>
            <div className="w-20 bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-orange-500 to-pink-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Doses List */}
      <div className="mt-5 space-y-3">
        {doses.length === 0 ? (
          <div className="text-center py-8 px-4 rounded-xl bg-orange-50/30 border border-dashed border-orange-200 space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
              <Pill className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">No scheduled doses for today</p>
              <p className="text-xs text-gray-500 mt-0.5">
                Keep track of your medicines by adding your active medication schedules.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/patient/medications')}
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-gradient-to-r from-orange-600 to-pink-700 text-white rounded-xl text-xs font-semibold shadow-sm hover:from-orange-700 hover:to-pink-800 transition"
            >
              <span>Manage Medications</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          doses.map((dose) => {
            const isTaken = dose.status === DoseStatus.TAKEN;
            const isSkipped = dose.status === DoseStatus.SKIPPED;
            const isMissed = dose.status === DoseStatus.MISSED;
            const isScheduled = dose.status === DoseStatus.SCHEDULED;
            const isCurrentLoading = loadingDoseId === dose.id;

            return (
              <div
                key={dose.id}
                className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border transition-all duration-200 gap-3 ${
                  isTaken
                    ? 'bg-emerald-50/40 border-emerald-200/80'
                    : isSkipped
                    ? 'bg-gray-50/80 border-gray-200'
                    : isMissed
                    ? 'bg-red-50/40 border-red-200'
                    : 'bg-white border-orange-100 hover:border-orange-300 hover:shadow-sm'
                }`}
              >
                {/* Time & Medicine Info */}
                <div className="flex items-start space-x-3.5">
                  <div className="px-2.5 py-1.5 rounded-lg bg-orange-100/70 text-orange-950 font-bold text-xs flex items-center space-x-1 shrink-0">
                    <Clock className="w-3 h-3 text-orange-600" />
                    <span>{formatTime(dose.scheduledAt)}</span>
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <h4
                        className={`text-sm font-bold ${
                          isTaken ? 'text-gray-600 line-through' : 'text-gray-900'
                        }`}
                      >
                        {dose.medicineName}
                      </h4>
                      {dose.strength && (
                        <span className="text-xs font-medium text-gray-500">
                          {dose.strength}
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-gray-500 mt-0.5 flex items-center space-x-2">
                      <span>
                        {dose.formattedDosage || `${dose.doseAmount || 1} ${dose.doseUnit || 'tablet'}`}
                      </span>
                      {dose.instructions && (
                        <>
                          <span className="text-gray-300">•</span>
                          <span className="text-gray-600 italic truncate max-w-xs">
                            {dose.instructions}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status or Action Buttons */}
                <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                  {isTaken && (
                    <span className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Taken</span>
                    </span>
                  )}

                  {isSkipped && (
                    <span className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-gray-200 text-gray-700">
                      <X className="w-3.5 h-3.5 text-gray-500" />
                      <span>Skipped</span>
                    </span>
                  )}

                  {isMissed && (
                    <span className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                      <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                      <span>Missed</span>
                    </span>
                  )}

                  {isScheduled && (
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => handleAction(dose.id, 'skipped')}
                        disabled={isCurrentLoading}
                        className="px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 text-xs font-semibold transition disabled:opacity-50 flex items-center space-x-1"
                        title="Mark dose as skipped"
                      >
                        <X className="w-3 h-3" />
                        <span>Skip</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleAction(dose.id, 'taken')}
                        disabled={isCurrentLoading}
                        className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-orange-600 to-pink-700 hover:from-orange-700 hover:to-pink-800 text-white text-xs font-semibold shadow-sm shadow-orange-500/20 transition disabled:opacity-50 flex items-center space-x-1.5"
                        title="Mark dose as taken"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{isCurrentLoading ? 'Saving...' : 'Take'}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Safety Guideline Footer */}
      <div className="mt-5 pt-3 border-t border-gray-100 flex items-start space-x-2 text-[11px] text-gray-500">
        <ShieldAlert className="w-3.5 h-3.5 text-orange-600 mt-0.5 shrink-0" />
        <div>
          <span>
            If you missed a dose, follow the instructions provided by your healthcare professional or drug label. Never take a double dose to make up for a missed intake.
          </span>
        </div>
      </div>
    </div>
  );
};
