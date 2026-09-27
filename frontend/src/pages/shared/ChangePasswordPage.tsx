import React, { useState } from 'react';
import { authApi } from '../../api/authApi';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { KeyRound, Lock, CheckCircle2 } from 'lucide-react';
import { AxiosError } from 'axios';
import { ErrorResponse } from '../../types';

export const ChangePasswordPage: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword !== confirmNewPassword) {
      setError('New password and confirmation do not match.');
      return;
    }

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long.');
      return;
    }

    setIsLoading(true);
    try {
      await authApi.changePassword({
        currentPassword,
        newPassword,
        confirmNewPassword,
      });

      setSuccess('Your password has been changed successfully. Existing sessions have been rotated.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err) {
      const axiosErr = err as AxiosError<ErrorResponse>;
      if (axiosErr.response?.data?.message) {
        setError(axiosErr.response.data.message);
      } else {
        setError('Failed to change password. Please check your current password.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-charcoal">Account Security</h1>
        <p className="text-xs text-muted">
          Update your password to keep your healthcare account secure
        </p>
      </div>

      {success && (
        <Alert variant="success" onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {error && (
        <Alert variant="danger" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Current Password"
            type="password"
            placeholder="••••••••"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            leftIcon={<Lock className="w-4 h-4 text-muted" />}
            required
          />

          <Input
            label="New Password"
            type="password"
            placeholder="••••••••"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            leftIcon={<KeyRound className="w-4 h-4 text-muted" />}
            helperText="Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 symbol"
            required
          />

          <Input
            label="Confirm New Password"
            type="password"
            placeholder="••••••••"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            leftIcon={<KeyRound className="w-4 h-4 text-muted" />}
            required
          />

          <Button
            type="submit"
            className="w-full mt-2"
            isLoading={isLoading}
            rightIcon={<CheckCircle2 className="w-4 h-4" />}
          >
            Update Password
          </Button>
        </form>
      </Card>
    </div>
  );
};
