import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { adminApi } from '../../api/adminApi';
import { DoctorProfile, User } from '../../types';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { LoadingState } from '../../components/feedback/LoadingState';
import { Link } from 'react-router-dom';
import {
  UserCheck,
  FileText,
  CheckCircle2,
  XCircle,
  Users,
  Clock,
  ArrowRight,
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [pendingDoctors, setPendingDoctors] = useState<DoctorProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [usersRes, docsRes] = await Promise.all([
        adminApi.getAllUsers(),
        adminApi.getDoctors('PENDING_VERIFICATION'),
      ]);
      setUsers(usersRes.data);
      setPendingDoctors(docsRes.data);
    } catch (err) {
      console.error('Failed to load admin dashboard data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleVerifyDoctor = async (doctorId: string, approve: boolean) => {
    setActionLoading(doctorId);
    setMessage(null);
    try {
      await adminApi.verifyDoctor({
        doctorProfileId: doctorId,
        status: approve ? 'VERIFIED' : 'REJECTED',
        rejectionReason: approve ? undefined : 'Medical credentials or license could not be verified by Admin.',
      });
      setMessage({
        type: 'success',
        text: `Doctor registration successfully ${approve ? 'VERIFIED' : 'REJECTED'}.`,
      });
      await loadData();
    } catch {
      setMessage({ type: 'danger', text: 'Action failed. Please try again.' });
    } finally {
      setActionLoading(null);
    }
  };

  if (isLoading) {
    return <LoadingState message="Loading Administrator Console..." subMessage="Fetching governance metrics" />;
  }

  const patientCount = users.filter((u) => u.roles.some((r) => r.includes('PATIENT'))).length;
  const doctorCount = users.filter((u) => u.roles.some((r) => r.includes('DOCTOR'))).length;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#7F1D1D] via-rose-900 to-[#18201B] text-white rounded-3xl p-6 sm:p-8 shadow-warmLg border border-rose-800/40">
        <div className="absolute top-0 right-0 w-[400px] h-[300px] bg-gradient-to-br from-amber-400/20 via-rose-400/20 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                System Administration
              </h1>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-400/30 text-rose-200 border border-rose-400/40">
                ROLE: ADMIN
              </span>
            </div>
            <p className="text-sm text-rose-100 max-w-2xl leading-relaxed">
              Authenticated as <strong className="text-white underline decoration-amber-400">{user?.email}</strong> • Health Buddy System Governance & Clinical Decision Oversight.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link to="/admin/audit-logs">
              <Button size="md" className="bg-surface/20 text-white hover:bg-surface/30 border border-white/20 backdrop-blur-sm font-semibold" leftIcon={<FileText className="w-4 h-4" />}>
                View Audit Logs
              </Button>
            </Link>
            <Link to="/admin/users">
              <Button size="md" className="bg-amber-400 text-charcoal hover:bg-amber-300 font-bold border-none shadow-md" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Manage Users
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {message && (
        <Alert variant={message.type} onClose={() => setMessage(null)} className="shadow-xs">
          {message.text}
        </Alert>
      )}

      {/* Admin Identity Card & Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 border-l-4 border-l-primary flex items-center justify-between shadow-subtle hover:shadow-cardHover transition-all">
          <div>
            <span className="text-[11px] font-extrabold text-muted uppercase tracking-wider">Total Users</span>
            <div className="text-3xl font-black text-charcoal mt-1">{users.length}</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-primary-50 flex items-center justify-center text-primary">
            <Users className="w-6 h-6" />
          </div>
        </Card>

        <Card className="p-5 border-l-4 border-l-emerald-500 flex items-center justify-between shadow-subtle hover:shadow-cardHover transition-all">
          <div>
            <span className="text-[11px] font-extrabold text-muted uppercase tracking-wider">Patients</span>
            <div className="text-3xl font-black text-charcoal mt-1">{patientCount}</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-800 font-black text-base shadow-xs">
            P
          </div>
        </Card>

        <Card className="p-5 border-l-4 border-l-amber-500 flex items-center justify-between shadow-subtle hover:shadow-cardHover transition-all">
          <div>
            <span className="text-[11px] font-extrabold text-muted uppercase tracking-wider">Doctors (All)</span>
            <div className="text-3xl font-black text-charcoal mt-1">{doctorCount}</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-800 font-black text-base shadow-xs">
            D
          </div>
        </Card>

        <Card className="p-5 border-l-4 border-l-rose-500 flex items-center justify-between shadow-subtle hover:shadow-cardHover transition-all">
          <div>
            <span className="text-[11px] font-extrabold text-muted uppercase tracking-wider">Pending Verification</span>
            <div className="text-3xl font-black text-rose-600 mt-1">{pendingDoctors.length}</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600">
            <Clock className="w-6 h-6" />
          </div>
        </Card>
      </div>

      {/* Doctor Verification Workflow Panel */}
      <Card className="p-6 space-y-4 shadow-subtle border-softBorder">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-softBorder pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shadow-xs">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-charcoal">Doctor Licensure Verification Queue</h2>
              <p className="text-xs text-muted">
                Review and approve healthcare practitioners before granting clinical privileges
              </p>
            </div>
          </div>
          <Badge variant="warning" className="self-start sm:self-auto font-bold">{pendingDoctors.length} Pending</Badge>
        </div>

        {pendingDoctors.length === 0 ? (
          <div className="py-10 text-center text-xs text-muted">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            No doctors currently pending verification. All medical accounts are up to date.
          </div>
        ) : (
          <div className="divide-y divide-softBorder">
            {pendingDoctors.map((doc) => (
              <div key={doc.id} className="py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <strong className="text-charcoal font-bold">{doc.fullName}</strong>
                    <span className="text-xs text-muted">({doc.email})</span>
                  </div>
                  <div className="text-xs text-muted flex flex-wrap gap-x-4 gap-y-1">
                    <span>Specialty: <strong className="text-charcoal font-semibold">{doc.specialization}</strong></span>
                    <span>Degree: <strong className="text-charcoal font-semibold">{doc.qualification}</strong></span>
                    <span>License: <strong className="font-mono bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-amber-900 font-bold">{doc.licenseNumber}</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                  <Button
                    size="sm"
                    variant="primary"
                    isLoading={actionLoading === doc.id}
                    onClick={() => handleVerifyDoctor(doc.id, true)}
                    leftIcon={<CheckCircle2 className="w-4 h-4" />}
                    className="font-bold shadow-xs"
                  >
                    Approve & Verify
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    isLoading={actionLoading === doc.id}
                    onClick={() => handleVerifyDoctor(doc.id, false)}
                    leftIcon={<XCircle className="w-4 h-4" />}
                    className="font-bold shadow-xs"
                  >
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
