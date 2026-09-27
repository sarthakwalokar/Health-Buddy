import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Pill,
  Clock,
  ChevronRight,
  MoreVertical,
  Pause,
  Play,
  CheckCircle2,
  Square,
  Trash2,
  Bell,
  BellOff
} from 'lucide-react';
import { MedicationResponse, MedicationStatus } from '../../types/medication';
import { ActionConfirmationDialog } from './ActionConfirmationDialog';

interface MedicationCardProps {
  medication: MedicationResponse;
  onPause?: (id: string) => Promise<void>;
  onResume?: (id: string) => Promise<void>;
  onStop?: (id: string) => Promise<void>;
  onComplete?: (id: string) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

export const MedicationCard: React.FC<MedicationCardProps> = ({
  medication,
  onPause,
  onResume,
  onStop,
  onComplete,
  onDelete
}) => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [activeDialog, setActiveDialog] = useState<string | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Format schedule times
  const scheduleTimes =
    medication.schedules && medication.schedules.length > 0
      ? medication.schedules
          .map((s) => (s.timeOfDay ? s.timeOfDay.substring(0, 5) : ''))
          .filter(Boolean)
          .join(' • ')
      : null;

  // Format next dose time
  const formatNextDose = (isoString?: string) => {
    if (!isoString) return null;
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  };

  // Status Badge styles & icons
  const getStatusBadge = (status: MedicationStatus) => {
    switch (status) {
      case MedicationStatus.ACTIVE:
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Active</span>
          </span>
        );
      case MedicationStatus.PAUSED:
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Pause className="w-3 h-3 text-amber-600" />
            <span>Paused</span>
          </span>
        );
      case MedicationStatus.COMPLETED:
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <CheckCircle2 className="w-3 h-3 text-blue-600" />
            <span>Completed</span>
          </span>
        );
      case MedicationStatus.STOPPED:
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-300">
            <Square className="w-3 h-3 text-gray-500" />
            <span>Stopped</span>
          </span>
        );
      default:
        return null;
    }
  };

  const handleAction = async (actionFn?: (id: string) => Promise<void>) => {
    if (!actionFn) return;
    try {
      setIsActionLoading(true);
      await actionFn(medication.id);
      setActiveDialog(null);
    } catch (err) {
      console.error('Action failed', err);
    } finally {
      setIsActionLoading(false);
    }
  };

  const adherence = medication.adherencePercentage ?? 100;
  const adherenceColor =
    adherence >= 80 ? 'text-emerald-700' : adherence >= 60 ? 'text-amber-700' : 'text-red-700';

  return (
    <>
      <div className="bg-white rounded-2xl border border-orange-100/80 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between group">
        {/* Card Header */}
        <div className="p-5 pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center text-white shadow-sm shadow-orange-500/20">
                <Pill className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 group-hover:text-orange-600 transition">
                  {medication.medicineName}
                </h3>
                {medication.strength && (
                  <p className="text-xs font-medium text-gray-500">{medication.strength}</p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {getStatusBadge(medication.status)}

              {/* Options Menu */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
                  aria-label="Medication actions"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {showMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-20"
                      onClick={() => setShowMenu(false)}
                    />
                    <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-30 text-xs font-medium text-gray-700 animate-in fade-in zoom-in-95 duration-100">
                      <button
                        type="button"
                        onClick={() => {
                          setShowMenu(false);
                          navigate(`/patient/medications/${medication.id}`);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-orange-50 hover:text-orange-700 flex items-center space-x-2"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                        <span>View Details</span>
                      </button>

                      {medication.status === MedicationStatus.ACTIVE && onPause && (
                        <button
                          type="button"
                          onClick={() => {
                            setShowMenu(false);
                            setActiveDialog('pause');
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-amber-50 hover:text-amber-700 flex items-center space-x-2"
                        >
                          <Pause className="w-3.5 h-3.5 text-amber-600" />
                          <span>Pause Tracking</span>
                        </button>
                      )}

                      {medication.status === MedicationStatus.PAUSED && onResume && (
                        <button
                          type="button"
                          onClick={() => {
                            setShowMenu(false);
                            setActiveDialog('resume');
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-emerald-50 hover:text-emerald-700 flex items-center space-x-2"
                        >
                          <Play className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Resume Tracking</span>
                        </button>
                      )}

                      {medication.status === MedicationStatus.ACTIVE && onComplete && (
                        <button
                          type="button"
                          onClick={() => {
                            setShowMenu(false);
                            setActiveDialog('complete');
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-blue-50 hover:text-blue-700 flex items-center space-x-2"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                          <span>Mark Completed</span>
                        </button>
                      )}

                      {medication.status === MedicationStatus.ACTIVE && onStop && (
                        <button
                          type="button"
                          onClick={() => {
                            setShowMenu(false);
                            setActiveDialog('stop');
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 hover:text-gray-900 flex items-center space-x-2"
                        >
                          <Square className="w-3.5 h-3.5 text-gray-500" />
                          <span>Stop Tracking</span>
                        </button>
                      )}

                      {onDelete && (
                        <button
                          type="button"
                          onClick={() => {
                            setShowMenu(false);
                            setActiveDialog('delete');
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 flex items-center space-x-2 border-t border-gray-100 mt-1"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-600" />
                          <span>Delete Record</span>
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Dosage & Frequency details */}
          <div className="mt-4 bg-orange-50/40 rounded-xl p-3 border border-orange-100/60 space-y-1.5">
            <div className="text-xs font-semibold text-gray-900 flex items-center space-x-1.5">
              <span>{medication.dosageAmount} {medication.dosageUnit || 'tablet'}</span>
              <span className="text-gray-300">•</span>
              <span className="text-orange-900 capitalize">
                {medication.frequencyType ? medication.frequencyType.replace(/_/g, ' ').toLowerCase() : 'Custom schedule'}
              </span>
            </div>

            {scheduleTimes && (
              <div className="text-xs font-medium text-gray-600 flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5 text-orange-600" />
                <span>{scheduleTimes}</span>
              </div>
            )}
          </div>

          {/* Next Dose and Adherence preview */}
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div className="bg-gray-50 rounded-lg p-2 border border-gray-100">
              <span className="text-gray-400 block text-[10px] font-semibold uppercase">Next Dose</span>
              <span className="font-bold text-gray-800">
                {medication.nextDoseAt ? formatNextDose(medication.nextDoseAt) : 'None scheduled'}
              </span>
            </div>

            <div className="bg-gray-50 rounded-lg p-2 border border-gray-100">
              <span className="text-gray-400 block text-[10px] font-semibold uppercase">30-Day Adherence</span>
              <span className={`font-bold ${adherenceColor}`}>
                {adherence}%
              </span>
            </div>
          </div>
        </div>

        {/* Card Footer */}
        <div className="px-5 py-3 bg-gray-50/80 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-1.5">
            {medication.reminderEnabled ? (
              <span className="inline-flex items-center space-x-1 text-pink-700">
                <Bell className="w-3 h-3" />
                <span>Reminders on</span>
              </span>
            ) : (
              <span className="inline-flex items-center space-x-1 text-gray-400">
                <BellOff className="w-3 h-3" />
                <span>Reminders off</span>
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => navigate(`/patient/medications/${medication.id}`)}
            className="font-semibold text-orange-600 hover:text-pink-700 flex items-center space-x-1 transition"
          >
            <span>View details</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Confirmation Dialogs */}
      <ActionConfirmationDialog
        isOpen={activeDialog === 'pause'}
        onClose={() => setActiveDialog(null)}
        onConfirm={() => handleAction(onPause)}
        title="Pause Medication Tracking?"
        description="This will pause tracking for this medication record in Health Buddy. Active scheduled dose reminders will be put on hold until you resume tracking."
        confirmText="Pause Record"
        confirmVariant="warning"
        isLoading={isActionLoading}
      />

      <ActionConfirmationDialog
        isOpen={activeDialog === 'resume'}
        onClose={() => setActiveDialog(null)}
        onConfirm={() => handleAction(onResume)}
        title="Resume Medication Tracking?"
        description="This will reactivate tracking and schedule upcoming reminders for this medication record in Health Buddy."
        confirmText="Resume Record"
        confirmVariant="primary"
        isLoading={isActionLoading}
      />

      <ActionConfirmationDialog
        isOpen={activeDialog === 'complete'}
        onClose={() => setActiveDialog(null)}
        onConfirm={() => handleAction(onComplete)}
        title="Mark Medication Record as Completed?"
        description="This marks your completed treatment course in Health Buddy. It preserves your dose history and adherence statistics."
        confirmText="Mark Completed"
        confirmVariant="primary"
        isLoading={isActionLoading}
      />

      <ActionConfirmationDialog
        isOpen={activeDialog === 'stop'}
        onClose={() => setActiveDialog(null)}
        onConfirm={() => handleAction(onStop)}
        title="Stop Medication Record?"
        description="This will mark this medication record as stopped in Health Buddy. It does not change your actual clinical treatment. Always follow your healthcare professional's instructions."
        confirmText="Stop Record"
        confirmVariant="danger"
        isLoading={isActionLoading}
      />

      <ActionConfirmationDialog
        isOpen={activeDialog === 'delete'}
        onClose={() => setActiveDialog(null)}
        onConfirm={() => handleAction(onDelete)}
        title="Delete Medication Record?"
        description="Are you sure you want to permanently delete this medication record and its historical dose logs? This action cannot be undone."
        confirmText="Delete Record"
        confirmVariant="danger"
        isLoading={isActionLoading}
      />
    </>
  );
};
