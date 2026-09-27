import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { ShieldCheck, User, Mail, Phone, Lock, CheckCircle2 } from 'lucide-react';
import { AxiosError } from 'axios';
import { ErrorResponse } from '../../types';

export const PatientRegisterPage: React.FC = () => {
  const { registerPatient } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

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
      await registerPatient({
        fullName,
        email,
        phone: phone || undefined,
        password,
        confirmPassword,
      });

      navigate('/patient/dashboard', { replace: true });
    } catch (err) {
      const axiosErr = err as AxiosError<ErrorResponse>;
      if (axiosErr.response?.data?.validationErrors) {
        setFieldErrors(axiosErr.response.data.validationErrors);
      } else if (axiosErr.response?.data?.message) {
        setGeneralError(axiosErr.response.data.message);
      } else {
        setGeneralError('Registration failed. Please check your inputs.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full p-8 shadow-elevated border-softBorder">
      <div className="text-center space-y-2 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-primary-100 text-primary-dark mx-auto flex items-center justify-center">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold text-charcoal">Create Patient Account</h2>
        <p className="text-xs text-muted">
          Join Health Buddy for personal health records and telemedicine
        </p>
      </div>

      {generalError && (
        <Alert variant="danger" className="mb-5" onClose={() => setGeneralError(null)}>
          {generalError}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Full Legal Name"
          type="text"
          placeholder="Jane Doe"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          leftIcon={<User className="w-4 h-4" />}
          error={fieldErrors.fullName}
          required
        />

        <Input
          label="Email Address"
          type="email"
          placeholder="jane.doe@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          leftIcon={<Mail className="w-4 h-4" />}
          error={fieldErrors.email}
          required
        />

        <Input
          label="Phone Number"
          type="tel"
          placeholder="+1 (555) 234-5678"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          leftIcon={<Phone className="w-4 h-4" />}
          error={fieldErrors.phone}
          helperText="Optional for tele-consultation SMS notifications"
        />

        <Input
          label="Create Password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          leftIcon={<Lock className="w-4 h-4" />}
          error={fieldErrors.password}
          helperText="Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 symbol"
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

        <Button
          type="submit"
          className="w-full mt-2"
          size="md"
          isLoading={isLoading}
          rightIcon={<CheckCircle2 className="w-4 h-4" />}
        >
          Create Account & Sign In
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
