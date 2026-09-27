import React, { useState, useEffect } from 'react';
import { patientApi } from '../../api/patientApi';
import { PatientProfile } from '../../types';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { LoadingState } from '../../components/feedback/LoadingState';
import { ErrorState } from '../../components/feedback/ErrorState';
import { User, Heart, Phone, Calendar, Save, ShieldCheck } from 'lucide-react';

export const PatientProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');

  const fetchProfile = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await patientApi.getProfile();
      const data = response.data;
      setProfile(data);
      setDateOfBirth(data.dateOfBirth || '');
      setGender(data.gender || '');
      setBloodGroup(data.bloodGroup || '');
      setEmergencyContactName(data.emergencyContactName || '');
      setEmergencyContactPhone(data.emergencyContactPhone || '');
    } catch {
      setError('Unable to load patient profile from secure backend.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await patientApi.updateProfile({
        dateOfBirth: dateOfBirth || undefined,
        gender: gender || undefined,
        bloodGroup: bloodGroup || undefined,
        emergencyContactName: emergencyContactName || undefined,
        emergencyContactPhone: emergencyContactPhone || undefined,
      });
      setProfile(response.data);
      setSuccessMessage('Patient profile successfully updated.');
    } catch {
      setError('Failed to update patient profile.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <LoadingState message="Retrieving patient records..." subMessage="Querying secure patient vault" />;
  }

  if (error && !profile) {
    return <ErrorState message={error} onRetry={fetchProfile} />;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-charcoal">Patient Health Profile</h1>
          <p className="text-xs text-muted">
            Manage your personal clinical emergency contacts and demographic attributes
          </p>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-100 text-primary-dark text-xs font-semibold">
          <ShieldCheck className="w-4 h-4" />
          <span>Strict Ownership Verified</span>
        </div>
      </div>

      {successMessage && (
        <Alert variant="success" onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      )}

      {error && (
        <Alert variant="danger" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <Card className="p-6 space-y-4">
          <h3 className="font-bold text-base text-charcoal border-b border-softBorder pb-3 flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            <span>Basic Identity (Read-Only)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Full Name" value={profile?.fullName || ''} disabled />
            <Input label="Email Address" value={profile?.email || ''} disabled />
            <Input label="Phone" value={profile?.phone || 'Not provided'} disabled />
            <Input label="Registered Since" value={profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : ''} disabled />
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <h3 className="font-bold text-base text-charcoal border-b border-softBorder pb-3 flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary" />
            <span>Health & Clinical Demographics</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Date of Birth"
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              leftIcon={<Calendar className="w-4 h-4" />}
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-charcoal tracking-wide uppercase">
                Gender
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="block w-full rounded-lg border border-softBorder bg-surface px-3.5 py-2.5 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-charcoal tracking-wide uppercase">
                Blood Group
              </label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="block w-full rounded-lg border border-softBorder bg-surface px-3.5 py-2.5 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="">Select blood group</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <h3 className="font-bold text-base text-charcoal border-b border-softBorder pb-3 flex items-center gap-2">
            <Phone className="w-5 h-5 text-primary" />
            <span>Emergency Contact</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Emergency Contact Name"
              type="text"
              placeholder="e.g. John Doe (Spouse)"
              value={emergencyContactName}
              onChange={(e) => setEmergencyContactName(e.target.value)}
            />

            <Input
              label="Emergency Contact Phone"
              type="tel"
              placeholder="+1 (555) 999-0000"
              value={emergencyContactPhone}
              onChange={(e) => setEmergencyContactPhone(e.target.value)}
            />
          </div>
        </Card>

        <div className="flex justify-end">
          <Button
            type="submit"
            size="md"
            isLoading={isSaving}
            leftIcon={<Save className="w-4 h-4" />}
          >
            Save Profile Changes
          </Button>
        </div>
      </form>
    </div>
  );
};
