import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  ChevronLeft,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ShieldAlert
} from 'lucide-react';
import { medicationApi } from '../../api/medicationApi';
import { MedicationAdherenceChart } from '../../components/medications/MedicationAdherenceChart';
import { DoseStatus, MedicationDoseResponse } from '../../types/medication';

export const MedicationAdherencePage: React.FC = () => {
  const [period, setPeriod] = useState<string>('30_DAYS');
  const [doseStatusFilter, setDoseStatusFilter] = useState<DoseStatus | undefined>(undefined);

  // Fetch adherence summary
  const { data: adherenceData, isLoading: isAdherenceLoading } = useQuery({
    queryKey: ['patient-medications-adherence', period],
    queryFn: () => medicationApi.getAdherence({ period })
  });

  // Fetch recent doses for adherence log table
  const { data: dosesData, isLoading: isDosesLoading } = useQuery({
    queryKey: ['patient-medication-doses-adherence-log', doseStatusFilter],
    queryFn: () => medicationApi.getDoses({ status: doseStatusFilter, size: 50 })
  });

  const doses = dosesData?.content || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Top Breadcrumb */}
      <div>
        <Link
          to="/patient/medications"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-gray-500 hover:text-orange-600 transition"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Medications</span>
        </Link>
      </div>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-orange-600 to-pink-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-orange-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Adherence Analytics</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Medication Adherence History
          </h1>
          <p className="text-xs sm:text-sm text-orange-100">
            Review your recorded intake trends and track consistency across your prescribed schedules.
          </p>
        </div>
      </div>

      {/* Medical Safety Disclaimer */}
      <div className="bg-amber-50/90 border border-amber-200/80 rounded-2xl p-4 flex items-start space-x-3.5 text-xs text-amber-900 shadow-sm">
        <ShieldAlert className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
        <div className="leading-relaxed">
          <span className="font-bold">Medical Adherence Context:</span> Adherence scores reflect the ratio of taken doses to applicable scheduled intervals recorded by you. Adherence percentages do not represent medical effectiveness or health outcomes. Consult your doctor before making any adjustments to your medication routine.
        </div>
      </div>

      {/* Adherence Chart & Key Breakdown */}
      <MedicationAdherenceChart
        adherenceData={adherenceData || null}
        period={period}
        onPeriodChange={setPeriod}
        isLoading={isAdherenceLoading}
      />

      {/* Comprehensive Dose Intake Log */}
      <div className="bg-white rounded-2xl border border-orange-100/90 shadow-sm p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
          <div>
            <h3 className="text-base font-bold text-gray-900 flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-orange-600" />
              <span>Dose Log & History</span>
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Detailed chronological record of scheduled, taken, skipped, and missed doses
            </p>
          </div>

          {/* Filter by status */}
          <div className="inline-flex p-1 bg-gray-100 rounded-xl text-xs font-semibold text-gray-600">
            <button
              type="button"
              onClick={() => setDoseStatusFilter(undefined)}
              className={`px-3 py-1.5 rounded-lg transition ${
                doseStatusFilter === undefined
                  ? 'bg-white text-orange-700 shadow-sm font-bold'
                  : 'hover:text-gray-900'
              }`}
            >
              All Doses
            </button>
            <button
              type="button"
              onClick={() => setDoseStatusFilter(DoseStatus.TAKEN)}
              className={`px-3 py-1.5 rounded-lg transition ${
                doseStatusFilter === DoseStatus.TAKEN
                  ? 'bg-white text-emerald-700 shadow-sm font-bold'
                  : 'hover:text-gray-900'
              }`}
            >
              Taken
            </button>
            <button
              type="button"
              onClick={() => setDoseStatusFilter(DoseStatus.SKIPPED)}
              className={`px-3 py-1.5 rounded-lg transition ${
                doseStatusFilter === DoseStatus.SKIPPED
                  ? 'bg-white text-gray-700 shadow-sm font-bold'
                  : 'hover:text-gray-900'
              }`}
            >
              Skipped
            </button>
            <button
              type="button"
              onClick={() => setDoseStatusFilter(DoseStatus.MISSED)}
              className={`px-3 py-1.5 rounded-lg transition ${
                doseStatusFilter === DoseStatus.MISSED
                  ? 'bg-white text-red-700 shadow-sm font-bold'
                  : 'hover:text-gray-900'
              }`}
            >
              Missed
            </button>
          </div>
        </div>

        {/* Doses Table */}
        {isDosesLoading ? (
          <div className="space-y-2 animate-pulse">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-gray-100 rounded-xl"></div>
            ))}
          </div>
        ) : doses.length === 0 ? (
          <div className="text-center py-12 text-xs text-gray-500 bg-gray-50 rounded-xl">
            No dose log entries found for the selected filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-700">
              <thead className="bg-orange-50/50 text-orange-950 font-bold uppercase text-[10px] tracking-wider border-b border-orange-100">
                <tr>
                  <th className="py-3 px-4 rounded-l-xl">Scheduled Time</th>
                  <th className="py-3 px-4">Medication</th>
                  <th className="py-3 px-4">Dosage</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 rounded-r-xl">Notes / Action Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {doses.map((dose: MedicationDoseResponse) => {
                  const scheduledDate = new Date(dose.scheduledAt).toLocaleDateString([], {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  });
                  const scheduledTime = new Date(dose.scheduledAt).toLocaleTimeString([], {
                    hour: 'numeric',
                    minute: '2-digit'
                  });
                  const takenTime = dose.takenAt
                    ? new Date(dose.takenAt).toLocaleTimeString([], {
                        hour: 'numeric',
                        minute: '2-digit'
                      })
                    : null;

                  return (
                    <tr key={dose.id} className="hover:bg-gray-50/80 transition">
                      <td className="py-3 px-4">
                        <span className="font-bold text-gray-900 block">{scheduledDate}</span>
                        <span className="text-[11px] text-gray-500">{scheduledTime}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-gray-900 block">{dose.medicineName}</span>
                        {dose.strength && (
                          <span className="text-[11px] text-gray-500">{dose.strength}</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {dose.formattedDosage || `${dose.doseAmount || 1} ${dose.doseUnit || 'tablet'}`}
                      </td>
                      <td className="py-3 px-4">
                        {dose.status === DoseStatus.TAKEN && (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Taken</span>
                          </span>
                        )}
                        {dose.status === DoseStatus.SKIPPED && (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-gray-200 text-gray-700">
                            <XCircle className="w-3 h-3 text-gray-500" />
                            <span>Skipped</span>
                          </span>
                        )}
                        {dose.status === DoseStatus.MISSED && (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-red-100 text-red-800">
                            <AlertCircle className="w-3 h-3 text-red-600" />
                            <span>Missed</span>
                          </span>
                        )}
                        {dose.status === DoseStatus.SCHEDULED && (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-orange-100 text-orange-800">
                            <span>Scheduled</span>
                          </span>
                        )}
                        {dose.status === DoseStatus.CANCELLED && (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-500">
                            <span>Cancelled</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-gray-500">
                        {takenTime ? (
                          <span>Taken at {takenTime}</span>
                        ) : dose.notes ? (
                          <span className="italic">{dose.notes}</span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
