import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Activity,
  Heart,
  Droplet,
  Thermometer,
  Wind,
  Scale,
  Plus,
  Trash2,
  Edit2,
  RefreshCw,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  acknowledgeAlert,
  deleteVital,
  getHealthAlerts,
  getVitals,
  getVitalsDashboardSummary,
  getVitalTrends,
  recordVital,
  updateVital,
} from '../../api/vitalApi';
import { HealthAlertResponse, MeasurementType, VitalResponse } from '../../types/vital';
import { VitalCard } from '../../components/vitals/VitalCard';
import { VitalTrendChart } from '../../components/vitals/VitalTrendChart';
import { RecordVitalModal } from '../../components/vitals/RecordVitalModal';
import { EditVitalModal } from '../../components/vitals/EditVitalModal';
import { AlertBanner } from '../../components/vitals/AlertBanner';

type TabType = 'OVERVIEW' | MeasurementType;

export const VitalsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabType>('OVERVIEW');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('30_DAYS');
  const [isRecordModalOpen, setIsRecordModalOpen] = useState<boolean>(false);
  const [modalInitialType, setModalInitialType] = useState<MeasurementType>('BLOOD_PRESSURE');
  const [editingVital, setEditingVital] = useState<VitalResponse | null>(null);
  const [vitalToDelete, setVitalToDelete] = useState<string | null>(null);

  // Queries
  const { data: dashboardSummary } = useQuery({
    queryKey: ['vitals-dashboard-summary'],
    queryFn: getVitalsDashboardSummary,
  });

  const { data: alertsData } = useQuery({
    queryKey: ['health-alerts'],
    queryFn: () => getHealthAlerts(undefined, 0, 10),
  });

  const selectedVitalType: MeasurementType =
    activeTab === 'OVERVIEW' ? 'BLOOD_PRESSURE' : (activeTab as MeasurementType);

  const { data: trendData, isLoading: trendLoading } = useQuery({
    queryKey: ['vital-trend', selectedVitalType, selectedPeriod],
    queryFn: () => getVitalTrends(selectedVitalType, selectedPeriod),
  });

  const { data: vitalsPage, isLoading: vitalsLoading, refetch: refetchVitals } = useQuery({
    queryKey: ['vitals-list', activeTab === 'OVERVIEW' ? undefined : (activeTab as MeasurementType)],
    queryFn: () =>
      getVitals({
        type: activeTab === 'OVERVIEW' ? undefined : (activeTab as MeasurementType),
        page: 0,
        size: 20,
      }),
  });

  // Mutations
  const recordMutation = useMutation({
    mutationFn: recordVital,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vitals-dashboard-summary'] });
      queryClient.invalidateQueries({ queryKey: ['vital-trend'] });
      queryClient.invalidateQueries({ queryKey: ['vitals-list'] });
      queryClient.invalidateQueries({ queryKey: ['health-alerts'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateVital(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vitals-dashboard-summary'] });
      queryClient.invalidateQueries({ queryKey: ['vital-trend'] });
      queryClient.invalidateQueries({ queryKey: ['vitals-list'] });
      queryClient.invalidateQueries({ queryKey: ['health-alerts'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteVital,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vitals-dashboard-summary'] });
      queryClient.invalidateQueries({ queryKey: ['vital-trend'] });
      queryClient.invalidateQueries({ queryKey: ['vitals-list'] });
      queryClient.invalidateQueries({ queryKey: ['health-alerts'] });
      setVitalToDelete(null);
    },
  });

  const acknowledgeMutation = useMutation({
    mutationFn: acknowledgeAlert,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['health-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['vitals-dashboard-summary'] });
    },
  });

  const handleOpenRecord = (type: MeasurementType = 'BLOOD_PRESSURE') => {
    setModalInitialType(type);
    setIsRecordModalOpen(true);
  };

  const tabs: { key: TabType; label: string; icon: any }[] = [
    { key: 'OVERVIEW', label: 'Overview', icon: Activity },
    { key: 'BLOOD_PRESSURE', label: 'Blood Pressure', icon: Activity },
    { key: 'HEART_RATE', label: 'Heart Rate', icon: Heart },
    { key: 'BLOOD_GLUCOSE', label: 'Blood Glucose', icon: Droplet },
    { key: 'SPO2', label: 'SpO2', icon: Wind },
    { key: 'TEMPERATURE', label: 'Temperature', icon: Thermometer },
    { key: 'WEIGHT', label: 'Weight', icon: Scale },
  ];

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="primary" size="sm">
              Health Monitoring
            </Badge>
            {dashboardSummary?.unreadAlertsCount ? (
              <Badge variant="danger" size="sm">
                {dashboardSummary.unreadAlertsCount} Unread Notice(s)
              </Badge>
            ) : null}
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            Vitals & Health Tracking
          </h1>
          <p className="text-xs text-gray-500 mt-1 max-w-2xl">
            Record everyday observations, monitor physiological baselines, analyze time-series trends, and receive informational safety notifications.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            onClick={() => handleOpenRecord(activeTab === 'OVERVIEW' ? 'BLOOD_PRESSURE' : (activeTab as MeasurementType))}
            className="flex items-center gap-2 shadow-md hover:shadow-lg"
          >
            <Plus className="w-4 h-4" />
            <span>Record Measurement</span>
          </Button>
        </div>
      </div>

      {/* Safety Alerts Banner */}
      {alertsData?.content && alertsData.content.length > 0 && (
        <AlertBanner
          alerts={alertsData.content.filter((a: HealthAlertResponse) => a.status !== 'RESOLVED')}
          onAcknowledge={async (id: string) => {
            await acknowledgeMutation.mutateAsync(id);
          }}
        />
      )}

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-gray-200 scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content: OVERVIEW */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-6">
          {/* Vitals Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <VitalCard
              type="BLOOD_PRESSURE"
              summary={dashboardSummary?.vitals?.BLOOD_PRESSURE}
              onRecord={handleOpenRecord}
              onViewDetails={(t) => setActiveTab(t)}
            />
            <VitalCard
              type="HEART_RATE"
              summary={dashboardSummary?.vitals?.HEART_RATE}
              onRecord={handleOpenRecord}
              onViewDetails={(t) => setActiveTab(t)}
            />
            <VitalCard
              type="BLOOD_GLUCOSE"
              summary={dashboardSummary?.vitals?.BLOOD_GLUCOSE}
              onRecord={handleOpenRecord}
              onViewDetails={(t) => setActiveTab(t)}
            />
            <VitalCard
              type="SPO2"
              summary={dashboardSummary?.vitals?.SPO2}
              onRecord={handleOpenRecord}
              onViewDetails={(t) => setActiveTab(t)}
            />
            <VitalCard
              type="TEMPERATURE"
              summary={dashboardSummary?.vitals?.TEMPERATURE}
              onRecord={handleOpenRecord}
              onViewDetails={(t) => setActiveTab(t)}
            />
            <VitalCard
              type="WEIGHT"
              summary={dashboardSummary?.vitals?.WEIGHT}
              onRecord={handleOpenRecord}
              onViewDetails={(t) => setActiveTab(t)}
            />
          </div>

          {/* BMI Snapshot Card */}
          {dashboardSummary?.latestBmi && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="p-3 bg-brand-darkPink/10 text-brand-darkPink rounded-2xl">
                  <Scale className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-gray-900">Body Mass Index (BMI)</h3>
                    <Badge variant="pink" size="sm">
                      System Calculated
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {dashboardSummary.latestBmi.notes || 'Calculated using weight and profile height'}
                  </p>
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-brand-darkPink">
                  {dashboardSummary.latestBmi.valueNumeric.toFixed(1)}
                </span>
                <span className="text-xs font-bold text-gray-500">kg/m²</span>
              </div>
            </div>
          )}

          {/* Blood Pressure Overview Trend Chart */}
          <VitalTrendChart
            trendData={trendData}
            isLoading={trendLoading}
            selectedPeriod={selectedPeriod}
            onPeriodChange={setSelectedPeriod}
          />
        </div>
      )}

      {/* Tab Content: SPECIFIC VITAL */}
      {activeTab !== 'OVERVIEW' && (
        <div className="space-y-6">
          <VitalTrendChart
            trendData={trendData}
            isLoading={trendLoading}
            selectedPeriod={selectedPeriod}
            onPeriodChange={setSelectedPeriod}
          />
        </div>
      )}

      {/* Measurement History Table */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
          <div>
            <h3 className="text-base font-bold text-gray-900">
              {activeTab === 'OVERVIEW' ? 'Recent Measurement History' : `${tabs.find((t) => t.key === activeTab)?.label} Logs`}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Chronological log of recorded observations and clinical metadata.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetchVitals()}
            className="flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </Button>
        </div>

        {vitalsLoading ? (
          <div className="py-12 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : !vitalsPage?.content || vitalsPage.content.length === 0 ? (
          <div className="py-12 text-center bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
            <Activity className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-gray-700">No measurements found</p>
            <p className="text-xs text-gray-500 mt-1">
              Click "+ Record Measurement" to add your first reading.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Measurement</th>
                  <th className="py-3 px-4">Value</th>
                  <th className="py-3 px-4">Context / Status</th>
                  <th className="py-3 px-4">Source</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Notes</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {vitalsPage.content.map((vital: VitalResponse) => (
                  <tr key={vital.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-gray-900">
                      {vital.measurementType.replace('_', ' ')}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-extrabold text-gray-900 text-sm">
                        {vital.formattedValue}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {vital.measurementContext ? (
                        <Badge variant="neutral" size="sm" className="capitalize">
                          {vital.measurementContext.toLowerCase().replace('_', ' ')}
                        </Badge>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          vital.source === 'MEDICAL_REPORT'
                            ? 'primary'
                            : vital.source === 'SYSTEM_CALCULATED'
                            ? 'warning'
                            : 'neutral'
                        }
                        size="sm"
                      >
                        {vital.source === 'MEDICAL_REPORT'
                          ? 'Report'
                          : vital.source === 'SYSTEM_CALCULATED'
                          ? 'Calculated'
                          : 'Manual'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-gray-500 whitespace-nowrap">
                      {new Date(vital.measurementTime).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3 px-4 text-gray-500 max-w-xs truncate">
                      {vital.notes || '—'}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setEditingVital(vital)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                          title="Edit measurement"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setVitalToDelete(vital.id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete measurement"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Modal */}
      <RecordVitalModal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        onSuccess={() => {}}
        onSubmit={async (data) => {
          await recordMutation.mutateAsync(data);
        }}
        initialType={modalInitialType}
      />

      {/* Edit Modal */}
      <EditVitalModal
        isOpen={!!editingVital}
        onClose={() => setEditingVital(null)}
        onSuccess={() => {}}
        vital={editingVital}
        onSubmit={async (id, data) => {
          await updateMutation.mutateAsync({ id, data });
        }}
      />

      {/* Delete Confirmation Modal */}
      {vitalToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-gray-100 text-center">
            <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-gray-900">Delete Measurement?</h3>
            <p className="text-xs text-gray-500 mt-1 mb-5">
              This action cannot be undone and will remove this reading from your health timeline and trends.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setVitalToDelete(null)}
                disabled={deleteMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => deleteMutation.mutate(vitalToDelete)}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
