import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { LogIn, Mail, Lock, KeyRound } from 'lucide-react';
import { AxiosError } from 'axios';
import { ErrorResponse } from '../../types';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await login({ email, password });
      
      // Strict role-based navigation from backend authority response
      if (response.role === 'PATIENT') {
        navigate('/patient/dashboard', { replace: true });
      } else if (response.role === 'DOCTOR') {
        navigate('/doctor/dashboard', { replace: true });
      } else if (response.role === 'ADMIN') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch (err) {
      const axiosErr = err as AxiosError<ErrorResponse>;
      if (axiosErr.response?.data?.message) {
        setError(axiosErr.response.data.message);
      } else {
        setError('Invalid email or password. Please verify your credentials.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fillQuickCredentials = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };

  return (
    <Card className="w-full p-6 sm:p-8 shadow-warmLg border-softBorder bg-surface/95 backdrop-blur-md relative overflow-hidden">
      {/* Decorative top accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-amber-500 to-emerald-500" />

      <div className="text-center space-y-2 mb-6 pt-1">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-100 via-emerald-100 to-amber-100 text-primary-dark mx-auto flex items-center justify-center shadow-subtle ring-4 ring-primary-50">
          <LogIn className="w-7 h-7 text-primary" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-charcoal tracking-tight">Sign In to Health Buddy</h2>
        <p className="text-xs text-muted">
          Enter your credentials to access your clinical & patient portal
        </p>
      </div>

      {error && (
        <Alert variant="danger" className="mb-5 shadow-xs" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email Address"
          type="email"
          name="email"
          placeholder="doctor@healthbuddy.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          leftIcon={<Mail className="w-4 h-4 text-primary" />}
          required
        />

        <Input
          label="Password"
          type="password"
          name="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          leftIcon={<Lock className="w-4 h-4 text-primary" />}
          required
        />

        <Button
          type="submit"
          className="w-full mt-2 font-bold shadow-glow"
          size="lg"
          isLoading={isLoading}
          rightIcon={<LogIn className="w-4 h-4" />}
        >
          Sign In to Portal
        </Button>
      </form>

      {/* Quick Test Credentials Helper */}
      <div className="mt-6 pt-5 border-t border-softBorder">
        <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-amber-900 uppercase tracking-wider mb-2.5">
          <KeyRound className="w-3.5 h-3.5 text-amber-600" />
          <span>Quick Fill Demo Credentials</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => fillQuickCredentials('admin@healthbuddy.com', 'Admin@HealthBuddy2026!')}
            className="p-2 rounded-xl bg-rose-50 text-rose-700 text-[11px] font-bold hover:bg-rose-100 transition-all text-center border border-rose-200 shadow-xs active:scale-95"
          >
            Admin
          </button>
          <button
            type="button"
            onClick={() => fillQuickCredentials('patient.test@healthbuddy.com', 'Password@123')}
            className="p-2 rounded-xl bg-emerald-50 text-primary-dark text-[11px] font-bold hover:bg-emerald-100 transition-all text-center border border-emerald-200 shadow-xs active:scale-95"
          >
            Patient
          </button>
          <button
            type="button"
            onClick={() => fillQuickCredentials('doctor.test@healthbuddy.com', 'Password@123')}
            className="p-2 rounded-xl bg-amber-50 text-amber-800 text-[11px] font-bold hover:bg-amber-100 transition-all text-center border border-amber-200 shadow-xs active:scale-95"
          >
            Doctor
          </button>
        </div>
      </div>

      <div className="mt-6 pt-4 text-center text-xs text-muted border-t border-softBorder space-y-2">
        <p>
          Need a Patient Account?{' '}
          <Link to="/register/patient" className="text-primary font-bold hover:underline">
            Register as Patient
          </Link>
        </p>
        <p>
          Are you a Healthcare Provider?{' '}
          <Link to="/register/doctor" className="text-amber-700 font-bold hover:underline">
            Register as Doctor
          </Link>
        </p>
      </div>
    </Card>
  );
};
