import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  LayoutDashboard,
  UserCheck,
  Shield,
  KeyRound,
  FileText,
  HeartPulse,
  Pill,
  Bot,
  Stethoscope,
  User as UserIcon,
  ShieldAlert,
  X,
  Lock,
} from 'lucide-react';
import { cn } from '../utils/cn';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
  const { role } = useAuth();

  const doctorNavItems = [
    { to: '/doctor/dashboard', label: 'Doctor Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { to: '/doctor/profile', label: 'License & Credentials', icon: <UserCheck className="w-4 h-4" /> },
    { to: '/change-password', label: 'Security & Password', icon: <KeyRound className="w-4 h-4" /> },
  ];

  const adminNavItems = [
    { to: '/admin/dashboard', label: 'Admin Console', icon: <Shield className="w-4 h-4" /> },
    { to: '/admin/users', label: 'User Management', icon: <UserCheck className="w-4 h-4" /> },
    { to: '/admin/audit-logs', label: 'Security Audit Logs', icon: <FileText className="w-4 h-4" /> },
    { to: '/change-password', label: 'Change Password', icon: <KeyRound className="w-4 h-4" /> },
  ];

  const sidebarContent = (
    <div className="flex flex-col justify-between h-full p-4 overflow-y-auto">
      <div className="space-y-6">
        {/* Mobile Header with Close Button */}
        <div className="flex items-center justify-between md:hidden pb-2 border-b border-softBorder">
          <div className="text-sm font-bold text-charcoal flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-primary inline-block"></span>
            {role} Navigation
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted hover:text-charcoal hover:bg-orange-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Portal Tag */}
        <div className="px-3.5 py-2.5 bg-gradient-to-r from-orange-50 to-pink-50/50 rounded-xl border border-orange-200/70 hidden md:block">
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-primary-dark">Active Portal</div>
          <div className="text-sm font-bold text-charcoal mt-0.5 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-primary inline-block ring-4 ring-primary/15"></span>
            {role} Portal
          </div>
        </div>

        {role === 'PATIENT' ? (
          <nav className="space-y-4">
            {/* Core Patient Links */}
            <div className="space-y-1">
              <NavLink
                to="/patient/dashboard"
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all duration-150',
                    isActive
                      ? 'bg-primary text-white shadow-sm shadow-primary/25'
                      : 'text-charcoal hover:bg-orange-50/80 hover:text-primary-dark'
                  )
                }
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </NavLink>
            </div>

            {/* My Health Group */}
            <div className="space-y-1">
              <div className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-muted">
                My Health Records
              </div>
              <NavLink
                to="/patient/health-profile"
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150',
                    isActive
                      ? 'bg-primary text-white shadow-sm shadow-primary/25 font-bold'
                      : 'text-charcoal hover:bg-orange-50/80 hover:text-primary-dark'
                  )
                }
              >
                <UserIcon className="w-4 h-4" />
                <span>Health Profile</span>
              </NavLink>

              <NavLink
                to="/patient/medical-history"
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150',
                    isActive
                      ? 'bg-primary text-white shadow-sm shadow-primary/25 font-bold'
                      : 'text-charcoal hover:bg-orange-50/80 hover:text-primary-dark'
                  )
                }
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Medical History</span>
              </NavLink>

              <NavLink
                to="/patient/reports"
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150',
                    isActive
                      ? 'bg-primary text-white shadow-sm shadow-primary/25 font-bold'
                      : 'text-charcoal hover:bg-orange-50/80 hover:text-primary-dark'
                  )
                }
              >
                <FileText className="w-4 h-4" />
                <span>Medical Reports</span>
              </NavLink>
            </div>

            {/* Clinical Services */}
            <div className="space-y-1">
              <div className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-muted">
                Connected Services
              </div>
              <NavLink
                to="/patient/vitals"
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150',
                    isActive
                      ? 'bg-primary text-white shadow-sm shadow-primary/25 font-bold'
                      : 'text-charcoal hover:bg-orange-50/80 hover:text-primary-dark'
                  )
                }
              >
                <HeartPulse className="w-4 h-4" />
                <span>Health Monitoring</span>
              </NavLink>
              <NavLink
                to="/patient/medications"
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150',
                    isActive
                      ? 'bg-primary text-white shadow-sm shadow-primary/25 font-bold'
                      : 'text-charcoal hover:bg-orange-50/80 hover:text-primary-dark'
                  )
                }
              >
                <Pill className="w-4 h-4" />
                <span>Medications & Reminders</span>
              </NavLink>
              <div className="flex items-center justify-between px-3.5 py-2 text-xs text-muted/60 cursor-not-allowed select-none">
                <span className="flex items-center gap-3">
                  <Stethoscope className="w-4 h-4 text-muted/40" />
                  Doctor Connect
                </span>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-stone-100 text-stone-500">Upcoming</span>
              </div>
              <div className="flex items-center justify-between px-3.5 py-2 text-xs text-muted/60 cursor-not-allowed select-none">
                <span className="flex items-center gap-3">
                  <Bot className="w-4 h-4 text-muted/40" />
                  AI Health Assistant
                </span>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-stone-100 text-stone-500">Upcoming</span>
              </div>
            </div>

            {/* Account & Security */}
            <div className="space-y-1 pt-2 border-t border-softBorder">
              <NavLink
                to="/change-password"
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150',
                    isActive
                      ? 'bg-primary text-white shadow-sm shadow-primary/25 font-bold'
                      : 'text-charcoal hover:bg-orange-50/80 hover:text-primary-dark'
                  )
                }
              >
                <KeyRound className="w-4 h-4" />
                <span>Security & Password</span>
              </NavLink>
            </div>
          </nav>
        ) : (
          <nav className="space-y-1">
            {(role === 'DOCTOR' ? doctorNavItems : adminNavItems).map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150',
                    isActive
                      ? 'bg-primary text-white shadow-sm shadow-primary/25 font-bold'
                      : 'text-charcoal hover:bg-orange-50/80 hover:text-primary-dark'
                  )
                }
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        )}
      </div>

      {/* Security & Health Vault Status */}
      <div className="p-3.5 bg-gradient-to-br from-orange-50/80 via-white to-pink-50/50 rounded-2xl border border-orange-200/60 text-xs text-muted space-y-1.5 mt-6 shadow-xs">
        <div className="flex items-center justify-between font-bold text-charcoal text-[11px] uppercase tracking-wider">
          <span className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-primary" />
            Vault Security
          </span>
          <span className="flex items-center gap-1 text-emerald-700 font-extrabold text-[10px]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block"></span>
            ACTIVE
          </span>
        </div>
        <p className="text-[11px] text-muted leading-relaxed font-medium">
          Zero-trust data isolation & encrypted health documents active.
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside className="w-64 lg:w-72 bg-surface border-r border-softBorder min-h-[calc(100vh-4rem)] hidden md:block shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile Slide-Over Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-charcoal/60 backdrop-blur-xs transition-opacity"
            onClick={onClose}
          />
          <div className="relative w-72 max-w-[80vw] bg-surface h-full shadow-2xl border-r border-softBorder z-10 animate-slideRight">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
