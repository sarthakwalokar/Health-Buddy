import React, { useEffect, useState } from 'react';
import { doctorApi } from '../../api/doctorApi';
import { DoctorProfile } from '../../types';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { LoadingState } from '../../components/feedback/LoadingState';
import { ErrorState } from '../../components/feedback/ErrorState';
import { Stethoscope, ShieldAlert } from 'lucide-react';

export const DoctorProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<DoctorProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await doctorApi.getProfile();
      setProfile(res.data);
    } catch {
      setError('Unable to fetch doctor profile.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (isLoading) {
    return <LoadingState message="Loading Doctor Credentials..." />;
  }

  if (error || !profile) {
    return <ErrorState message={error || 'Profile not found'} onRetry={fetchProfile} />;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-charcoal">Doctor Credentials & License</h1>
          <p className="text-xs text-muted">
            Official practitioner registration registered with Health Buddy Medical Registry
          </p>
        </div>
        <Badge
          variant={profile.verificationStatus === 'VERIFIED' ? 'success' : 'warning'}
          size="md"
        >
          {profile.verificationStatus}
        </Badge>
      </div>

      <Card className="p-6 space-y-4">
        <h3 className="font-bold text-base text-charcoal border-b border-softBorder pb-3 flex items-center gap-2">
          <Stethoscope className="w-5 h-5 text-primary" />
          <span>Professional Practitioner Details</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Doctor Full Name" value={profile.fullName} disabled />
          <Input label="Official Email" value={profile.email} disabled />
          <Input label="Phone" value={profile.phone || 'Not provided'} disabled />
          <Input label="Specialization" value={profile.specialization} disabled />
          <Input label="Medical Qualifications" value={profile.qualification} disabled />
          <Input label="License / Registration No." value={profile.licenseNumber} disabled />
        </div>
      </Card>

      <Card className="p-6 space-y-4 bg-background border-dashed border-softBorder">
        <h3 className="font-bold text-base text-charcoal border-b border-softBorder pb-3 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-primary" />
          <span>Verification Audit Record</span>
        </h3>

        <div className="text-sm space-y-2">
          <div className="flex justify-between py-1">
            <span className="text-muted">Verification Status:</span>
            <strong className="text-charcoal font-semibold">{profile.verificationStatus}</strong>
          </div>
          {profile.verifiedAt && (
            <div className="flex justify-between py-1">
              <span className="text-muted">Verified At:</span>
              <span className="text-charcoal">{new Date(profile.verifiedAt).toLocaleString()}</span>
            </div>
          )}
          {profile.rejectionReason && (
            <div className="p-3 rounded-lg bg-danger-light text-danger text-xs">
              <strong>Rejection Details:</strong> {profile.rejectionReason}
            </div>
          )}
          <div className="flex justify-between py-1">
            <span className="text-muted">Account Registered:</span>
            <span className="text-charcoal">{new Date(profile.createdAt).toLocaleString()}</span>
          </div>
        </div>
      </Card>
    </div>
  );
};
