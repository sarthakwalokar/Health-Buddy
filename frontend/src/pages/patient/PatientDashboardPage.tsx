import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Link } from 'react-router-dom';
import { reportApi } from '../../api/reportApi';
import { getVitalsDashboardSummary, getHealthAlerts } from '../../api/vitalApi';
import { medicationApi } from '../../api/medicationApi';
import { MedicalReport } from '../../types/report';
import { VitalDashboardSummaryResponse, HealthAlertResponse } from '../../types/vital';
import { TodayMedicationsSummaryResponse } from '../../types/medication';
import { TodayMedicationsWidget } from '../../components/medications/TodayMedicationsWidget';
import {
  User,
  Mail,
  Phone,
  Calendar,
  Lock,
  ArrowRight,
  ShieldCheck,
  Heart,
  ShieldAlert,
  Sparkles,
  FileText,
  Upload,
  Activity,
  Droplet,
  Wind,
  Scale,
  Plus,
  AlertTriangle,
  Pill
} from 'lucide-react';

export const PatientDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [recentReports, setRecentReports] = useState<MedicalReport[]>([]);
  const [vitalsSummary, setVitalsSummary] = useState<VitalDashboardSummaryResponse | null>(null);
  const [todayMedSummary, setTodayMedSummary] = useState<TodayMedicationsSummaryResponse | null>(null);
  const [activeAlerts, setActiveAlerts] = useState<HealthAlertResponse[]>([]);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [vitalsLoading, setVitalsLoading] = useState(true);
  const [medsLoading, setMedsLoading] = useState(true);

  const fetchTodayMeds = () => {
    medicationApi
      .getTodayDoses()
      .then((res: TodayMedicationsSummaryResponse) => setTodayMedSummary(res))
      .catch(() => setTodayMedSummary(null))
      .finally(() => setMedsLoading(false));
  };

  useEffect(() => {
    reportApi
      .getMyReports()
      .then((res) => {
        setRecentReports(res.data?.slice(0, 3) || []);
      })
      .catch(() => {
        setRecentReports([]);
      })
      .finally(() => {
        setReportsLoading(false);
      });

    getVitalsDashboardSummary()
      .then((res) => {
        setVitalsSummary(res);
      })
      .catch(() => {
        setVitalsSummary(null);
      })
      .finally(() => {
        setVitalsLoading(false);
      });

    getHealthAlerts('UNREAD', 0, 3)
      .then((res) => {
        setActiveAlerts(res.content || []);
      })
      .catch(() => {
        setActiveAlerts([]);
      });

    fetchTodayMeds();
  }, []);

  const handleMarkDoseTaken = async (doseId: string) => {
    await medicationApi.markDoseTaken(doseId);
    fetchTodayMeds();
  };

  const handleMarkDoseSkipped = async (doseId: string) => {
    await medicationApi.markDoseSkipped(doseId);
    fetchTodayMeds();
  };

  const formatRelativeTime = (isoString?: string) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  const hasAnyVitals =
    vitalsSummary?.vitals && Object.keys(vitalsSummary.vitals).length > 0;

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto pb-12 animate-fadeIn">
      {/* Radiant Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-dark via-primary to-brandPink p-6 sm:p-8 lg:p-10 text-white shadow-xl shadow-primary/15 border border-primary-light/30">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute right-40 bottom-0 -mb-10 w-48 h-48 rounded-full bg-pink-400/20 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold tracking-wide border border-white/20">
                <Sparkles className="w-3.5 h-3.5 text-orange-200" />
                HEALTH BUDDY PATIENT PORTAL
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-pink-400/20 text-pink-100 text-xs font-medium border border-pink-300/30">
                <ShieldCheck className="w-3.5 h-3.5" />
                Encrypted Vault
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
              Welcome back, {user?.fullName || 'Patient'}
            </h1>
            <p className="text-sm sm:text-base text-orange-50 leading-relaxed font-medium">
              Your comprehensive personal healthcare hub with health monitoring, medical report extraction, and vital trends tracking.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <Link to="/patient/vitals" className="w-full sm:w-auto">
              <Button
                size="md"
                className="w-full sm:w-auto bg-white text-primary-dark hover:bg-orange-50 shadow-md font-bold"
                leftIcon={<Activity className="w-4 h-4 text-primary" />}
              >
                Health Monitoring
              </Button>
            </Link>
            <Link to="/patient/reports" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="md"
                className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white border-white/30 backdrop-blur-md font-bold"
                leftIcon={<Upload className="w-4 h-4" />}
              >
                Medical Reports
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Active Safety Notice Alert (if unread alerts exist) */}
      {activeAlerts.length > 0 && (
        <div className="p-4 bg-orange-50 border border-orange-200 rounded-2xl flex items-start justify-between gap-4 shadow-sm animate-fadeIn">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-orange-100 text-primary mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-gray-900">
                  {activeAlerts[0].title}
                </h3>
                <Badge variant="warning" size="sm">
                  {activeAlerts[0].severity}
                </Badge>
              </div>
              <p className="text-xs text-gray-700 mt-1 max-w-3xl">
                {activeAlerts[0].message}
              </p>
            </div>
          </div>
          <Link to="/patient/vitals">
            <Button size="sm" variant="outline" className="border-orange-300 text-primary text-xs shrink-0">
              Review Notices
            </Button>
          </Link>
        </div>
      )}

      {/* Health Overview / Vitals Snapshot Section */}
      <Card className="p-6 sm:p-7 space-y-5 bg-surface border border-softBorder shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-softBorder pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-100 flex items-center justify-center text-primary border border-orange-200">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-base text-charcoal">Your Health Overview</h2>
              <p className="text-xs text-muted font-medium">Latest recorded vital measurements & physiological baselines</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link to="/patient/vitals">
              <Button variant="outline" size="sm" className="font-bold border-orange-200 text-primary hover:bg-orange-50" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                View All Vitals & Trends
              </Button>
            </Link>
          </div>
        </div>

        {vitalsLoading ? (
          <div className="py-8 text-center text-xs text-muted">Loading your vitals...</div>
        ) : !hasAnyVitals ? (
          <div className="py-8 text-center bg-gray-50/60 rounded-xl border border-dashed border-gray-200 p-6 space-y-2">
            <Activity className="w-8 h-8 text-gray-400 mx-auto" />
            <p className="text-sm font-bold text-gray-800">Start recording your health measurements.</p>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              Track your blood pressure, heart rate, glucose, weight, and oxygen levels to monitor changes over time.
            </p>
            <Link to="/patient/vitals" className="inline-block mt-2">
              <Button size="sm" variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
                Record Your First Vital
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* Blood Pressure */}
            {vitalsSummary?.vitals?.BLOOD_PRESSURE && (
              <div className="p-4 rounded-xl bg-orange-50/40 border border-orange-100">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                  <span className="font-medium flex items-center gap-1">
                    <Activity className="w-3.5 h-3.5 text-primary" /> Blood Pressure
                  </span>
                </div>
                <div className="text-lg font-black text-gray-900 mt-1">
                  {vitalsSummary.vitals.BLOOD_PRESSURE.latestReading?.formattedValue}
                </div>
                <div className="text-[10px] text-gray-500 mt-1">
                  {vitalsSummary.vitals.BLOOD_PRESSURE.statusNote}
                </div>
              </div>
            )}

            {/* Heart Rate */}
            {vitalsSummary?.vitals?.HEART_RATE && (
              <div className="p-4 rounded-xl bg-pink-50/40 border border-pink-100">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                  <span className="font-medium flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 text-brandPink" /> Heart Rate
                  </span>
                </div>
                <div className="text-lg font-black text-gray-900 mt-1">
                  {vitalsSummary.vitals.HEART_RATE.latestReading?.formattedValue}
                </div>
                <div className="text-[10px] text-gray-500 mt-1">
                  {vitalsSummary.vitals.HEART_RATE.statusNote}
                </div>
              </div>
            )}

            {/* Blood Glucose */}
            {vitalsSummary?.vitals?.BLOOD_GLUCOSE && (
              <div className="p-4 rounded-xl bg-orange-50/30 border border-orange-100">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                  <span className="font-medium flex items-center gap-1">
                    <Droplet className="w-3.5 h-3.5 text-primary-deep" /> Blood Glucose
                  </span>
                </div>
                <div className="text-lg font-black text-gray-900 mt-1">
                  {vitalsSummary.vitals.BLOOD_GLUCOSE.latestReading?.formattedValue}
                </div>
                <div className="text-[10px] text-gray-500 mt-1">
                  {vitalsSummary.vitals.BLOOD_GLUCOSE.statusNote}
                </div>
              </div>
            )}

            {/* SpO2 */}
            {vitalsSummary?.vitals?.SPO2 && (
              <div className="p-4 rounded-xl bg-blue-50/40 border border-blue-100">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                  <span className="font-medium flex items-center gap-1">
                    <Wind className="w-3.5 h-3.5 text-blue-600" /> SpO2 Oxygen
                  </span>
                </div>
                <div className="text-lg font-black text-gray-900 mt-1">
                  {vitalsSummary.vitals.SPO2.latestReading?.formattedValue}
                </div>
                <div className="text-[10px] text-gray-500 mt-1">
                  {vitalsSummary.vitals.SPO2.statusNote}
                </div>
              </div>
            )}

            {/* Weight */}
            {vitalsSummary?.vitals?.WEIGHT && (
              <div className="p-4 rounded-xl bg-emerald-50/40 border border-emerald-100">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                  <span className="font-medium flex items-center gap-1">
                    <Scale className="w-3.5 h-3.5 text-emerald-600" /> Weight
                  </span>
                </div>
                <div className="text-lg font-black text-gray-900 mt-1">
                  {vitalsSummary.vitals.WEIGHT.latestReading?.formattedValue}
                </div>
                <div className="text-[10px] text-gray-500 mt-1">
                  {vitalsSummary.vitals.WEIGHT.statusNote}
                </div>
              </div>
            )}

            {/* BMI */}
            {vitalsSummary?.latestBmi && (
              <div className="p-4 rounded-xl bg-purple-50/40 border border-purple-100">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                  <span className="font-medium flex items-center gap-1">
                    <Scale className="w-3.5 h-3.5 text-purple-600" /> BMI (Calculated)
                  </span>
                </div>
                <div className="text-lg font-black text-gray-900 mt-1">
                  {vitalsSummary.latestBmi.valueNumeric.toFixed(1)} <span className="text-xs font-normal text-gray-500">kg/m²</span>
                </div>
                <div className="text-[10px] text-gray-500 mt-1">
                  From profile height & weight
                </div>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Today's Medications Interactive Section */}
      <TodayMedicationsWidget
        summary={todayMedSummary}
        isLoading={medsLoading}
        onMarkTaken={handleMarkDoseTaken}
        onMarkSkipped={handleMarkDoseSkipped}
      />

      {/* Domain Quick Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="p-6 flex flex-col justify-between space-y-4 bg-gradient-to-br from-white via-white to-pink-50/40 border-pink-200/60 hover:border-brandPink-300 hover:shadow-card transition-all duration-200">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-white shadow-xs">
              <Pill className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-charcoal">Medications & Schedules</h3>
              <p className="text-xs sm:text-sm text-muted mt-1 leading-relaxed">
                Track active prescriptions, set intake reminder alarms, and monitor dose adherence.
              </p>
            </div>
          </div>
          <Link to="/patient/medications">
            <span className="text-xs sm:text-sm font-bold text-brandPink hover:text-brandPink-dark inline-flex items-center gap-1.5 transition-colors">
              Manage Medications <ArrowRight className="w-4 h-4" />
            </span>
          </Link>
        </Card>

        <Card className="p-6 flex flex-col justify-between space-y-4 bg-gradient-to-br from-white via-white to-orange-50/40 border-orange-200/60 hover:border-primary-300 hover:shadow-card transition-all duration-200">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center text-primary shadow-xs">
              <Activity className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-charcoal">Health Monitoring & Vitals</h3>
              <p className="text-xs sm:text-sm text-muted mt-1 leading-relaxed">
                Log Blood Pressure, Heart Rate, Glucose, and SpO2 with time-series trends and change detection.
              </p>
            </div>
          </div>
          <Link to="/patient/vitals">
            <span className="text-xs sm:text-sm font-bold text-primary hover:text-primary-dark inline-flex items-center gap-1.5 transition-colors">
              Open Vitals Hub <ArrowRight className="w-4 h-4" />
            </span>
          </Link>
        </Card>

        <Card className="p-6 flex flex-col justify-between space-y-4 bg-gradient-to-br from-white via-white to-pink-50/40 border-pink-200/60 hover:border-brandPink-300 hover:shadow-card transition-all duration-200">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-pink-100 flex items-center justify-center text-brandPink shadow-xs">
              <FileText className="w-6 h-6 text-brandPink" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-charcoal">Medical Reports</h3>
              <p className="text-xs sm:text-sm text-muted mt-1 leading-relaxed">
                Upload and organize lab reports, prescriptions, and radiology files with automated parameter extraction.
              </p>
            </div>
          </div>
          <Link to="/patient/reports">
            <span className="text-xs sm:text-sm font-bold text-brandPink hover:text-brandPink-dark inline-flex items-center gap-1.5 transition-colors">
              Manage Documents <ArrowRight className="w-4 h-4" />
            </span>
          </Link>
        </Card>

        <Card className="p-6 flex flex-col justify-between space-y-4 bg-gradient-to-br from-white via-white to-orange-50/30 border-orange-200/50 hover:border-primary-300 hover:shadow-card transition-all duration-200">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center text-primary shadow-xs">
              <ShieldAlert className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-charcoal">Medical History Vault</h3>
              <p className="text-xs sm:text-sm text-muted mt-1 leading-relaxed">
                Track diagnosed conditions, allergen sensitivities, past surgeries, and family medical backgrounds.
              </p>
            </div>
          </div>
          <Link to="/patient/medical-history">
            <span className="text-xs sm:text-sm font-bold text-primary hover:text-primary-dark inline-flex items-center gap-1.5 transition-colors">
              View History Vault <ArrowRight className="w-4 h-4" />
            </span>
          </Link>
        </Card>
      </div>

      {/* Recent Medical Reports Section */}
      <Card className="p-6 sm:p-7 space-y-4 bg-surface border border-softBorder shadow-xs">
        <div className="flex items-center justify-between border-b border-softBorder pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-100 flex items-center justify-center text-primary border border-orange-200">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-base text-charcoal">Recent Medical Reports</h2>
              <p className="text-xs text-muted font-medium">Your latest uploaded and processed medical files</p>
            </div>
          </div>

          <Link to="/patient/reports">
            <Button variant="outline" size="sm" className="font-bold border-orange-200 text-primary hover:bg-orange-50" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              View All Reports
            </Button>
          </Link>
        </div>

        {reportsLoading ? (
          <div className="py-6 text-center text-xs text-muted">Loading recent reports...</div>
        ) : recentReports.length === 0 ? (
          <div className="py-6 text-center space-y-2">
            <p className="text-xs text-muted">No reports uploaded yet.</p>
            <Link to="/patient/reports">
              <Button size="sm" variant="primary" leftIcon={<Upload className="w-3.5 h-3.5" />}>
                Upload Your First Report
              </Button>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-softBorder/60">
            {recentReports.map((report) => (
              <div key={report.id} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-orange-50 text-primary flex items-center justify-center shrink-0 border border-orange-200">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <Link
                      to={`/patient/reports/${report.id}`}
                      className="text-xs font-bold text-charcoal hover:text-primary transition-colors truncate block"
                    >
                      {report.originalFileName}
                    </Link>
                    <div className="text-[11px] text-muted flex items-center gap-2 mt-0.5">
                      <span>{report.reportTypeLabel}</span>
                      <span>•</span>
                      <span>{formatRelativeTime(report.uploadedAt)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {report.verificationStatus === 'PATIENT_VERIFIED' ? (
                    <Badge variant="success" size="sm" className="bg-emerald-50 text-emerald-800 border-emerald-200">
                      Patient Verified
                    </Badge>
                  ) : report.processingStatus === 'PROCESSED' ? (
                    <Badge variant="primary" size="sm">
                      Processed
                    </Badge>
                  ) : (
                    <Badge variant="warning" size="sm">
                      {report.processingStatusLabel}
                    </Badge>
                  )}

                  <Link to={`/patient/reports/${report.id}`}>
                    <Button variant="ghost" size="sm" className="px-2 py-1 text-xs">
                      View
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Account Identity & Security Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 sm:p-7 space-y-5">
          <div className="flex items-center justify-between border-b border-softBorder pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-orange-50 flex items-center justify-center text-primary border border-orange-200">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-extrabold text-base text-charcoal">Patient Identity Record</h2>
                <p className="text-xs text-muted font-medium">JWT Claims & Verification Details</p>
              </div>
            </div>
            <Badge variant="primary" size="sm">
              ACTIVE
            </Badge>
          </div>

          <div className="space-y-3.5 text-sm">
            <div className="flex items-center justify-between py-2 border-b border-softBorder/80">
              <span className="text-muted font-medium flex items-center gap-2">
                <User className="w-4 h-4 text-primary" /> Full Name:
              </span>
              <strong className="text-charcoal font-bold">{user?.fullName}</strong>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-softBorder/80">
              <span className="text-muted font-medium flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary" /> Email Address:
              </span>
              <strong className="text-charcoal font-bold">{user?.email}</strong>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-softBorder/80">
              <span className="text-muted font-medium flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary" /> Contact Phone:
              </span>
              <span className="text-charcoal font-semibold">{user?.phone || 'Not provided'}</span>
            </div>

            <div className="flex items-center justify-between py-2">
              <span className="text-muted font-medium flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" /> Account Registered:
              </span>
              <span className="text-charcoal font-semibold">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : 'Active'}
              </span>
            </div>
          </div>
        </Card>

        {/* Clinical Privacy & Zero-Trust Governance */}
        <Card className="p-6 sm:p-7 space-y-5 bg-gradient-to-br from-surface via-white to-pink-50/30 border-pink-200/50">
          <div className="flex items-center gap-3 border-b border-softBorder pb-4">
            <div className="w-10 h-10 rounded-2xl bg-pink-100/80 flex items-center justify-center text-brandPink border border-pink-200">
              <ShieldCheck className="w-5 h-5 text-brandPink" />
            </div>
            <div>
              <h2 className="font-extrabold text-base text-charcoal">Clinical Privacy & Safety</h2>
              <p className="text-xs text-muted font-medium">HIPAA Principles & Role Isolation</p>
            </div>
          </div>

          <div className="text-xs sm:text-sm text-muted space-y-3 leading-relaxed">
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-orange-100 text-primary font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                ✓
              </span>
              <p>
                <strong className="text-charcoal font-bold">Zero Cross-Patient Access:</strong> All health records and uploaded documents are strictly scoped to your authenticated credentials.
              </p>
            </div>

            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-orange-100 text-primary font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                ✓
              </span>
              <p>
                <strong className="text-charcoal font-bold">Rule-Based Change Detection:</strong> Physiological trends and alerts encourage proactive clinical discussion without autonomous medical diagnosis.
              </p>
            </div>

            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-orange-100 text-primary font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                ✓
              </span>
              <p>
                <strong className="text-charcoal font-bold">Audit Protected:</strong> Every vital logged, parameter edited, and document processed is recorded in the PostgreSQL clinical audit trail.
              </p>
            </div>
          </div>

          <div className="pt-2">
            <div className="p-3 bg-white rounded-xl border border-orange-200 flex items-center gap-2.5 text-xs text-primary-dark font-bold shadow-xs">
              <Lock className="w-4 h-4 text-primary" />
              <span>Strict Ownership & Encrypted Vault Active</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
