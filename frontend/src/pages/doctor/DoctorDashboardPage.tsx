import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { doctorApi } from '../../api/doctorApi';
import { DoctorProfile } from '../../types';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { LoadingState } from '../../components/feedback/LoadingState';
import { Link } from 'react-router-dom';
import {
  Stethoscope,
  ShieldCheck,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  ArrowRight,
  FileCheck,
} from 'lucide-react';

export const DoctorDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<DoctorProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await doctorApi.getDashboard();
        setProfile(res.data);
      } catch (err) {
        console.error('Failed to load doctor dashboard', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadProfile();
  }, []);

  if (isLoading) {
    return <LoadingState message="Loading Doctor Portal..." subMessage="Authenticating clinical credentials" />;
  }

  const verificationStatus = profile?.verificationStatus || user?.verificationStatus || 'PENDING_VERIFICATION';

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return (
          <Badge variant="success" size="md" className="gap-1 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" /> VERIFIED DOCTOR
          </Badge>
        );
      case 'PENDING_VERIFICATION':
        return (
          <Badge variant="warning" size="md" className="gap-1 font-semibold">
            <Clock className="w-3.5 h-3.5" /> PENDING VERIFICATION
          </Badge>
        );
      case 'REJECTED':
        return (
          <Badge variant="danger" size="md" className="gap-1 font-semibold">
            <XCircle className="w-3.5 h-3.5" /> VERIFICATION REJECTED
          </Badge>
        );
      case 'SUSPENDED':
        return (
          <Badge variant="danger" size="md" className="gap-1 font-semibold">
            <AlertTriangle className="w-3.5 h-3.5" /> ACCOUNT SUSPENDED
          </Badge>
        );
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome & Verification Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-800 via-primary-dark to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-warmLg border border-emerald-700/40">
        {/* Warm Ambient Glow Overlay */}
        <div className="absolute top-0 right-0 w-[400px] h-[300px] bg-gradient-to-br from-amber-400/20 via-primary-light/20 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Welcome, Dr. {user?.fullName?.split(' ')[0] || 'Practitioner'}
              </h1>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                ROLE: DOCTOR
              </span>
              {getStatusBadge(verificationStatus)}
            </div>
            <p className="text-sm text-emerald-100 max-w-2xl leading-relaxed">
              Clinical Decision Support & Tele-Connectivity Provider Dashboard. Access verified patient histories, decision recommendations, and tele-consultations.
            </p>
          </div>

          <Link to="/doctor/profile">
            <Button size="md" className="bg-amber-400 text-charcoal hover:bg-amber-300 font-bold border-none shadow-md" rightIcon={<ArrowRight className="w-4 h-4" />}>
              View License Details
            </Button>
          </Link>
        </div>
      </div>

      {/* Verification Status Context Alert */}
      {verificationStatus === 'PENDING_VERIFICATION' && (
        <Alert variant="warning" title="Clinical Credential Verification Pending" className="shadow-xs">
          Your doctor registration is recorded with status{' '}
          <strong className="font-semibold">PENDING_VERIFICATION</strong>. While pending, you have access to your credentials portal and system telemetry. Full clinical decision support and tele-consultation modules will be unlocked upon Admin verification.
        </Alert>
      )}

      {verificationStatus === 'VERIFIED' && (
        <Alert variant="success" title="Medical Credentials Verified" className="shadow-xs">
          Your medical license has been verified by the Health Buddy Administration. Full clinical decision tools and tele-connectivity pipelines are active.
        </Alert>
      )}

      {verificationStatus === 'REJECTED' && (
        <Alert variant="danger" title="Licensure Verification Unsuccessful" className="shadow-xs">
          Your credentials could not be verified by the admin. Reason:{' '}
          {profile?.rejectionReason || 'Please review your medical registration number.'}
        </Alert>
      )}

      {/* Doctor Identity & Medical Profile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 space-y-4 shadow-subtle border-softBorder bg-surface hover:shadow-cardHover transition-all">
          <div className="flex items-center gap-3 border-b border-softBorder pb-4">
            <div className="w-11 h-11 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-800 shadow-xs">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-charcoal">Doctor Identity & Licensure</h2>
              <p className="text-xs text-muted">Verified Healthcare Practitioner Metadata</p>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-1.5 border-b border-softBorder">
              <span className="text-muted">Doctor Name:</span>
              <strong className="text-charcoal font-semibold">{user?.fullName}</strong>
            </div>

            <div className="flex justify-between py-1.5 border-b border-softBorder">
              <span className="text-muted">Email:</span>
              <strong className="text-charcoal font-semibold">{user?.email}</strong>
            </div>

            <div className="flex justify-between py-1.5 border-b border-softBorder">
              <span className="text-muted">Specialization:</span>
              <span className="text-charcoal font-semibold text-primary-dark">{profile?.specialization || 'Not specified'}</span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-softBorder">
              <span className="text-muted">Qualifications:</span>
              <span className="text-charcoal font-medium">{profile?.qualification || 'Not specified'}</span>
            </div>

            <div className="flex justify-between py-1.5">
              <span className="text-muted">Medical License No:</span>
              <span className="font-mono text-xs px-2.5 py-0.5 rounded-lg bg-amber-50 text-amber-900 border border-amber-200 font-bold">
                {profile?.licenseNumber || 'PENDING'}
              </span>
            </div>
          </div>
        </Card>

        {/* Clinical Framework Readiness */}
        <Card className="p-6 space-y-4 bg-gradient-to-br from-surface to-amber-50/30 border border-softBorder shadow-subtle">
          <div className="flex items-center gap-3 border-b border-softBorder pb-4">
            <div className="w-11 h-11 rounded-2xl bg-primary-100 flex items-center justify-center text-primary-dark shadow-xs">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-charcoal">Phase 1 - Phase 3 Foundation</h2>
              <p className="text-xs text-muted">Role Isolation & Clinical Safety Safeguards</p>
            </div>
          </div>

          <div className="text-xs text-muted space-y-2.5 leading-relaxed">
            <p className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
              <span>Access to <code className="px-1.5 py-0.5 rounded bg-surface border border-softBorder text-primary-dark font-semibold">/api/v1/doctor/**</code> authorized by <code className="px-1.5 py-0.5 rounded bg-surface border border-softBorder text-primary-dark font-semibold">ROLE_DOCTOR</code>.</span>
            </p>
            <p className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
              <span>Strict zero-trust ownership prevents accessing personal patient files without consultation relationship.</span>
            </p>
            <p className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
              <span>Clinical provenance badges (Patient reported, Doctor reviewed, AI generated) enforced on all medical entries.</span>
            </p>
          </div>

          <div className="pt-2 flex items-center gap-2 text-xs font-bold text-primary-dark">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span>Zero Trust Role Boundary Enforced</span>
          </div>
        </Card>
      </div>
    </div>
  );
};
