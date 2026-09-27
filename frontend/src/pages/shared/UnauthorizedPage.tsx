import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { ShieldAlert, Home, LogOut } from 'lucide-react';

export const UnauthorizedPage: React.FC = () => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const getRoleDashboard = () => {
    if (role === 'PATIENT') return '/patient/dashboard';
    if (role === 'DOCTOR') return '/doctor/dashboard';
    if (role === 'ADMIN') return '/admin/dashboard';
    return '/login';
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 sm:p-6 lg:p-8">
      <Card className="max-w-lg w-full p-8 text-center shadow-elevated border-danger/30">
        <div className="w-16 h-16 rounded-3xl bg-danger-light text-danger flex items-center justify-center mx-auto mb-5">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-danger-light text-danger text-xs font-semibold mb-3">
          <span>HTTP 403 • FORBIDDEN</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal tracking-tight">
          Access Denied
        </h1>

        <p className="text-sm text-muted mt-2 max-w-md mx-auto leading-relaxed">
          You do not have the required role privileges to access this clinical resource. Your attempt has been logged for security audit purposes.
        </p>

        {user && (
          <div className="my-6 p-4 rounded-xl bg-background border border-softBorder text-xs text-left space-y-1.5">
            <div className="flex justify-between">
              <span className="text-muted">Authenticated User:</span>
              <span className="font-semibold text-charcoal">{user.email}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted">Current Role:</span>
              <Badge variant={role === 'ADMIN' ? 'danger' : role === 'DOCTOR' ? 'warning' : 'primary'} size="sm">
                {role}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Security Policy:</span>
              <span className="text-danger font-semibold">Strict Role Isolation Active</span>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link to={getRoleDashboard()} className="w-full sm:w-auto">
            <Button size="md" className="w-full" leftIcon={<Home className="w-4 h-4" />}>
              Back to My {role || 'User'} Portal
            </Button>
          </Link>

          <Button
            variant="outline"
            size="md"
            className="w-full sm:w-auto text-danger border-softBorder"
            onClick={handleLogout}
            leftIcon={<LogOut className="w-4 h-4" />}
          >
            Switch Account
          </Button>
        </div>
      </Card>
    </div>
  );
};
