import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { Stethoscope, User, Mail, Phone, Lock, Award, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { AxiosError } from 'axios';
import { ErrorResponse } from '../../types';

export const DoctorRegisterPage: React.FC = () => {
  const { registerDoctor } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [qualification, setQualification] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    setFieldErrors({});

    if (password !== confirmPassword) {
      setFieldErrors({ confirmPassword: 'Passwords do not match' });
      return;
    }

    if (password.length < 8) {
      setFieldErrors({ password: 'Password must be at least 8 characters' });
      return;
    }

    setIsLoading(true);
    try {
      await registerDoctor({
        fullName,
        email,
        phone: phone || undefined,
        password,
        confirmPassword,
        specialization,
        qualification,
        licenseNumber,
      });

      navigate('/doctor/dashboard', { replace: true });
    } catch (err) {
      const axiosErr = err as AxiosError<ErrorResponse>;
      if (axiosErr.response?.data?.validationErrors) {
        setFieldErrors(axiosErr.response.data.validationErrors);
      } else if (axiosErr.response?.data?.message) {
        setGeneralError(axiosErr.response.data.message);
      } else {
        setGeneralError('Doctor registration failed. Please check your credentials.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full p-8 shadow-elevated border-softBorder max-w-lg">
      <div className="text-center space-y-2 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-warning-light text-warning-dark mx-auto flex items-center justify-center">
          <Stethoscope className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold text-charcoal">Doctor Portal Registration</h2>
        <p className="text-xs text-muted">
          Clinical Decision Support & Healthcare Provider Onboarding
        </p>
      </div>

      <Alert variant="warning" className="mb-5 text-xs" title="Verification Notice">
        Registered doctors start with status <strong className="font-semibold">PENDING_VERIFICATION</strong>. Clinical prescription and consultation features are unlocked once credentials are confirmed by System Admin.
      </Alert>

      {generalError && (
        <Alert variant="danger" className="mb-5" onClose={() => setGeneralError(null)}>
          {generalError}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Full Doctor Name"
          type="text"
          placeholder="Dr. Sarah Smith"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          leftIcon={<User className="w-4 h-4" />}
          error={fieldErrors.fullName}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Medical Specialization"
            type="text"
            placeholder="Cardiology / Internal Med"
            value={specialization}
            onChange={(e) => setSpecialization(e.target.value)}
            leftIcon={<Stethoscope className="w-4 h-4" />}
            error={fieldErrors.specialization}
            required
          />

          <Input
            label="Qualifications"
            type="text"
            placeholder="MBBS, MD, FACC"
            value={qualification}
            onChange={(e) => setQualification(e.target.value)}
            leftIcon={<Award className="w-4 h-4" />}
            error={fieldErrors.qualification}
            required
          />
        </div>

        <Input
          label="Medical License / Registration Number"
          type="text"
          placeholder="MED-REG-882390"
          value={licenseNumber}
          onChange={(e) => setLicenseNumber(e.target.value)}
          leftIcon={<ShieldAlert className="w-4 h-4" />}
          error={fieldErrors.licenseNumber}
          helperText="Official state or national medical council license identifier"
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Email Address"
            type="email"
            placeholder="doctor@hospital.org"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail className="w-4 h-4" />}
            error={fieldErrors.email}
            required
          />

          <Input
            label="Phone Number"
            type="tel"
            placeholder="+1 (555) 345-6789"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            leftIcon={<Phone className="w-4 h-4" />}
            error={fieldErrors.phone}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<Lock className="w-4 h-4" />}
            error={fieldErrors.password}
            required
          />

          <Input
            label="Confirm Password"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            leftIcon={<Lock className="w-4 h-4" />}
            error={fieldErrors.confirmPassword}
            required
          />
        </div>

        <Button
          type="submit"
          className="w-full mt-2"
          size="md"
          isLoading={isLoading}
          rightIcon={<CheckCircle2 className="w-4 h-4" />}
        >
          Submit Application & Create Account
        </Button>
      </form>

      <div className="mt-6 pt-4 text-center text-xs text-muted border-t border-softBorder">
        Already registered?{' '}
        <Link to="/login" className="text-primary font-semibold hover:underline">
          Sign In
        </Link>
      </div>
    </Card>
  );
};
