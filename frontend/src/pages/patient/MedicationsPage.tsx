import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Pill,
  Plus,
  Search,
  TrendingUp,
  AlertCircle,
  ShieldAlert
} from 'lucide-react';
import { medicationApi } from '../../api/medicationApi';
import {
  MedicationResponse,
  MedicationStatus,
  CreateMedicationRequest
} from '../../types/medication';
import { MedicationCard } from '../../components/medications/MedicationCard';
import { AddMedicationModal } from '../../components/medications/AddMedicationModal';
import { TodayMedicationsWidget } from '../../components/medications/TodayMedicationsWidget';
import { Link } from 'react-router-dom';

export const MedicationsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'ALL' | 'ACTIVE' | 'PAUSED' | 'HISTORY'>('ACTIVE');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Fetch medications list
  const statusParam =
    activeTab === 'ACTIVE'
      ? MedicationStatus.ACTIVE
      : activeTab === 'PAUSED'
      ? MedicationStatus.PAUSED
      : undefined;

  const { data: medsData, isLoading: isMedsLoading, error: medsError } = useQuery({
    queryKey: ['patient-medications', statusParam, searchQuery],
    queryFn: () => medicationApi.getMedications({ status: statusParam, query: searchQuery || undefined, size: 50 })
  });

  // Fetch today's doses summary
  const { data: todaySummary, isLoading: isTodayLoading } = useQuery({
    queryKey: ['patient-medications-today'],
    queryFn: () => medicationApi.getTodayDoses()
  });

  // Mutations
  const createMedMutation = useMutation({
    mutationFn: (data: CreateMedicationRequest) => medicationApi.createMedication(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient-medications'] });
      queryClient.invalidateQueries({ queryKey: ['patient-medications-today'] });
      queryClient.invalidateQueries({ queryKey: ['patient-medications-adherence'] });
    }
  });

  const pauseMutation = useMutation({
    mutationFn: (id: string) => medicationApi.pauseMedication(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient-medications'] });
      queryClient.invalidateQueries({ queryKey: ['patient-medications-today'] });
    }
  });

  const resumeMutation = useMutation({
    mutationFn: (id: string) => medicationApi.resumeMedication(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient-medications'] });
      queryClient.invalidateQueries({ queryKey: ['patient-medications-today'] });
    }
  });

  const stopMutation = useMutation({
    mutationFn: (id: string) => medicationApi.stopMedication(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient-medications'] });
      queryClient.invalidateQueries({ queryKey: ['patient-medications-today'] });
    }
  });

  const completeMutation = useMutation({
    mutationFn: (id: string) => medicationApi.completeMedication(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient-medications'] });
      queryClient.invalidateQueries({ queryKey: ['patient-medications-today'] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => medicationApi.deleteMedication(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient-medications'] });
      queryClient.invalidateQueries({ queryKey: ['patient-medications-today'] });
    }
  });

  const markTakenMutation = useMutation({
    mutationFn: (doseId: string) => medicationApi.markDoseTaken(doseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient-medications-today'] });
      queryClient.invalidateQueries({ queryKey: ['patient-medications-adherence'] });
      queryClient.invalidateQueries({ queryKey: ['patient-medications'] });
    }
  });

  const markSkippedMutation = useMutation({
    mutationFn: (doseId: string) => medicationApi.markDoseSkipped(doseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient-medications-today'] });
      queryClient.invalidateQueries({ queryKey: ['patient-medications-adherence'] });
      queryClient.invalidateQueries({ queryKey: ['patient-medications'] });
    }
  });

  // Client-side filtering for History tab (COMPLETED or STOPPED)
  const allMedications: MedicationResponse[] = medsData?.content || [];
  const filteredMeds = allMedications.filter((med) => {
    if (activeTab === 'HISTORY') {
      return med.status === MedicationStatus.COMPLETED || med.status === MedicationStatus.STOPPED;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Top Banner / Hero */}
      <div className="bg-gradient-to-r from-orange-600 via-orange-500 to-pink-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-orange-500/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold">
            <Pill className="w-3.5 h-3.5" />
            <span>Medication Management & Reminders</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Keep track of the medicines you have been instructed to take
          </h1>
          <p className="text-sm text-orange-100/90 leading-relaxed">
            Record dosages, set reminder alerts, mark scheduled intakes, and monitor personal adherence.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-3">
          <Link
            to="/patient/medications/adherence"
            className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-md text-white text-xs font-bold transition flex items-center space-x-1.5"
          >
            <TrendingUp className="w-4 h-4" />
            <span>Adherence Analytics</span>
          </Link>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-white text-orange-700 hover:bg-orange-50 text-xs font-bold shadow-lg shadow-black/10 transition flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Medication</span>
          </button>
        </div>
      </div>

      {/* Safety & Non-Prescribing Disclaimer */}
      <div className="bg-amber-50/90 border border-amber-200/80 rounded-2xl p-4 flex items-start space-x-3.5 text-xs text-amber-900 shadow-sm">
        <ShieldAlert className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
        <div className="leading-relaxed">
          <span className="font-bold">Important Medical Guidance:</span> Health Buddy is a patient-entered tracking and reminder platform. Health Buddy does not prescribe drugs, adjust dosages, or evaluate treatment effectiveness. For questions about starting, pausing, or modifying medications, always consult your licensed physician or healthcare team.
        </div>
      </div>

      {/* Today's Medications Interactive Widget */}
      <TodayMedicationsWidget
        summary={todaySummary || null}
        isLoading={isTodayLoading}
        onMarkTaken={async (id) => {
          await markTakenMutation.mutateAsync(id);
        }}
        onMarkSkipped={async (id) => {
          await markSkippedMutation.mutateAsync(id);
        }}
      />

      {/* Medications Catalog Section */}
      <div className="space-y-6">
        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="inline-flex p-1.5 bg-gray-100/90 rounded-2xl text-xs font-semibold text-gray-600">
            <button
              type="button"
              onClick={() => setActiveTab('ACTIVE')}
              className={`px-4 py-2 rounded-xl transition-all ${
                activeTab === 'ACTIVE'
                  ? 'bg-white text-orange-700 shadow-sm font-bold'
                  : 'hover:text-gray-900'
              }`}
            >
              Current Medications
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('PAUSED')}
              className={`px-4 py-2 rounded-xl transition-all ${
                activeTab === 'PAUSED'
                  ? 'bg-white text-orange-700 shadow-sm font-bold'
                  : 'hover:text-gray-900'
              }`}
            >
              Paused
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('HISTORY')}
              className={`px-4 py-2 rounded-xl transition-all ${
                activeTab === 'HISTORY'
                  ? 'bg-white text-orange-700 shadow-sm font-bold'
                  : 'hover:text-gray-900'
              }`}
            >
              Completed / History
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('ALL')}
              className={`px-4 py-2 rounded-xl transition-all ${
                activeTab === 'ALL'
                  ? 'bg-white text-orange-700 shadow-sm font-bold'
                  : 'hover:text-gray-900'
              }`}
            >
              All Records
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or generic..."
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 transition shadow-sm"
            />
          </div>
        </div>

        {/* Medication Cards Grid */}
        {isMedsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm animate-pulse space-y-4"
              >
                <div className="h-6 bg-gray-200 rounded-md w-2/3"></div>
                <div className="h-4 bg-gray-100 rounded-md w-1/2"></div>
                <div className="h-16 bg-gray-50 rounded-xl"></div>
              </div>
            ))}
          </div>
        ) : medsError ? (
          <div className="p-8 text-center bg-red-50 rounded-2xl border border-red-200 text-red-700 space-y-2">
            <AlertCircle className="w-8 h-8 mx-auto text-red-500" />
            <p className="font-bold text-sm">Failed to load medication records</p>
            <p className="text-xs">Please refresh or check your internet connection.</p>
          </div>
        ) : filteredMeds.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white rounded-3xl border border-dashed border-gray-200 space-y-4 shadow-sm">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-orange-100 to-pink-100 flex items-center justify-center text-orange-600">
              <Pill className="w-8 h-8" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="text-base font-bold text-gray-900">No medication records found</h3>
              <p className="text-xs text-gray-500">
                {searchQuery
                  ? `No medications match the search term "${searchQuery}".`
                  : activeTab === 'ACTIVE'
                  ? 'You do not have any active medications recorded in your log.'
                  : activeTab === 'PAUSED'
                  ? 'No paused medications found.'
                  : activeTab === 'HISTORY'
                  ? 'No completed or stopped medication history.'
                  : 'Get started by recording the medications you are currently taking.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-orange-600 to-pink-700 hover:from-orange-700 hover:to-pink-800 text-white rounded-xl text-xs font-bold shadow-md shadow-orange-500/20 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Record Medication</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMeds.map((med) => (
              <MedicationCard
                key={med.id}
                medication={med}
                onPause={async (id) => {
                  await pauseMutation.mutateAsync(id);
                }}
                onResume={async (id) => {
                  await resumeMutation.mutateAsync(id);
                }}
                onStop={async (id) => {
                  await stopMutation.mutateAsync(id);
                }}
                onComplete={async (id) => {
                  await completeMutation.mutateAsync(id);
                }}
                onDelete={async (id) => {
                  await deleteMutation.mutateAsync(id);
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add Medication Modal */}
      <AddMedicationModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={async (data) => {
          await createMedMutation.mutateAsync(data);
        }}
        isLoading={createMedMutation.isPending}
      />
    </div>
  );
};
