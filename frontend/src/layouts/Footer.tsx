import React from 'react';
import { Activity, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-surface border-t border-softBorder py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary via-primary-dark to-brandPink flex items-center justify-center text-white shadow-xs">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <span className="font-black text-base text-charcoal tracking-tight">Health Buddy</span>
              <p className="text-xs text-muted">Clinical Decision Support & Tele-Connectivity</p>
            </div>
          </div>

          {/* Nav Links */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-muted">
            <a href="#features" className="hover:text-primary transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-primary transition-colors">How It Works</a>
            <a href="#security" className="hover:text-primary transition-colors">Security</a>
            <a href="#privacy" className="hover:text-primary transition-colors">Privacy Principles</a>
            <a href="#for-patients" className="hover:text-primary transition-colors">For Patients</a>
            <a href="#for-doctors" className="hover:text-primary transition-colors">For Doctors</a>
          </div>
        </div>

        <div className="pt-6 border-t border-softBorder flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted">
          <div className="flex items-center gap-2">
            <span>© {new Date().getFullYear()} Health Buddy. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1 text-primary font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-primary" />
              Zero-Trust Health Architecture
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
