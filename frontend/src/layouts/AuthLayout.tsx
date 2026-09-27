import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Activity, ShieldCheck, HeartPulse } from 'lucide-react';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-gradient-to-b from-[#FAF8F5] via-[#FFFDF9] to-[#F5EFEB] relative overflow-hidden">
      {/* Decorative Warm Ambient Glows */}
      <div className="absolute top-[-120px] left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-br from-primary-light/40 via-amber-200/30 to-rose-200/20 rounded-full blur-3xl pointer-events-none -z-0" />
      <div className="absolute bottom-[-100px] right-[-80px] w-[400px] h-[400px] bg-amber-100/40 rounded-full blur-3xl pointer-events-none -z-0" />

      {/* Top Brand Bar */}
      <header className="relative z-10 px-4 sm:px-8 py-5 max-w-7xl mx-auto w-full flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary via-primary-dark to-primary shadow-glow flex items-center justify-center text-white ring-2 ring-white/80 group-hover:scale-105 transition-all">
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl text-charcoal tracking-tight">Health Buddy</span>
              <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                Secure 256-bit
              </span>
            </div>
            <p className="text-xs text-muted">Clinical Decision Support & Tele-Connectivity</p>
          </div>
        </Link>
        <Link
          to="/"
          className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-dark transition-colors"
        >
          <HeartPulse className="w-4 h-4" />
          <span>Home</span>
        </Link>
      </header>

      {/* Main Centered Auth Form Container */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="w-full max-w-lg">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 p-5 text-center text-xs text-muted border-t border-softBorder/80 bg-surface/60 backdrop-blur-sm flex flex-col sm:flex-row items-center justify-between max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-primary" />
          <span>Zero-Trust Role Isolation • HIPAA & Clinical Decision Support Compliant</span>
        </div>
        <div className="text-[11px] text-muted/80 mt-2 sm:mt-0">
          Health Buddy Platform © 2026
        </div>
      </footer>
    </div>
  );
};
