import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Activity, ShieldCheck, LogOut, KeyRound, Menu, Heart } from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

interface HeaderProps {
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { user, role, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getDashboardPath = () => {
    if (role === 'PATIENT') return '/patient/dashboard';
    if (role === 'DOCTOR') return '/doctor/dashboard';
    if (role === 'ADMIN') return '/admin/dashboard';
    return '/';
  };

  return (
    <header className="sticky top-0 z-30 bg-surface/95 backdrop-blur-md border-b border-softBorder transition-all duration-200 shadow-subtle">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Mobile Sidebar Toggle & Logo */}
        <div className="flex items-center gap-3">
          {isAuthenticated && (
            <button
              onClick={onToggleSidebar}
              className="p-2 -ml-2 rounded-xl text-charcoal hover:bg-orange-50 hover:text-primary md:hidden transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <Link to={isAuthenticated ? getDashboardPath() : '/'} className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-dark via-primary to-brandPink flex items-center justify-center text-white shadow-md shadow-primary/20 group-hover:scale-105 transition-transform duration-200">
              <Activity className="w-5 h-5 stroke-[2.3]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg text-charcoal tracking-tight">Health Buddy</span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-gradient-to-r from-orange-50 to-pink-50 text-brandPink border border-pink-200">
                  <Heart className="w-3 h-3 text-brandPink" />
                  Healthcare Platform
                </span>
              </div>
              <p className="text-[11px] text-muted -mt-0.5 hidden sm:block font-medium">
                Clinical Decision Support & Tele-Connectivity
              </p>
            </div>
          </Link>
        </div>

        {/* User Status / Actions */}
        <div className="flex items-center gap-3">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <div className="hidden md:flex flex-col items-end text-right">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-charcoal">{user.fullName}</span>
                  <Badge variant={role === 'ADMIN' ? 'danger' : role === 'DOCTOR' ? 'pink' : 'primary'} size="sm">
                    {role}
                  </Badge>
                </div>
                <span className="text-xs text-muted font-medium">{user.email}</span>
              </div>

              {role === 'PATIENT' && (
                <Link to="/patient/vitals">
                  <button className="p-2 rounded-xl text-muted hover:text-primary hover:bg-orange-50 transition-colors relative" title="Health Notices & Alerts">
                    <Activity className="w-4 h-4 text-primary" />
                  </button>
                </Link>
              )}

              <Link to="/change-password">
                <button className="p-2 rounded-xl text-muted hover:text-charcoal hover:bg-orange-50 transition-colors hidden sm:inline-flex" title="Change Password">
                  <KeyRound className="w-4 h-4" />
                </button>
              </Link>

              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="text-brandRed hover:bg-red-50 hover:border-red-200 border-softBorder"
                leftIcon={<LogOut className="w-4 h-4" />}
              >
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link to="/register/patient">
                <Button variant="primary" size="sm" leftIcon={<ShieldCheck className="w-4 h-4" />}>
                  Register Patient
                </Button>
              </Link>
              <Link to="/register/doctor" className="hidden sm:inline-block">
                <Button variant="outline" size="sm">
                  Doctor Portal
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
