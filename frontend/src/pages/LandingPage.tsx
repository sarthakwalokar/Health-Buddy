import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { systemApi } from '../api/systemApi';
import { SystemStatus } from '../types/system';
import { Header } from '../layouts/Header';
import { Footer } from '../layouts/Footer';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import {
  Activity,
  ShieldCheck,
  Stethoscope,
  Lock,
  ArrowRight,
  CheckCircle2,
  FileText,
  HeartPulse,
  Pill,
  Bot,
  Shield,
  FileSpreadsheet,
  AlertTriangle,
  Heart,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { isAuthenticated, role } = useAuth();
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [statusLoading, setStatusLoading] = useState(true);

  useEffect(() => {
    systemApi
      .getStatus()
      .then((data) => {
        setSystemStatus(data);
      })
      .catch(() => {
        setSystemStatus({
          status: 'DOWN',
          api: 'DOWN',
          database: 'DOWN',
          timestamp: new Date().toISOString(),
        });
      })
      .finally(() => {
        setStatusLoading(false);
      });
  }, []);

  const getDashboardLink = () => {
    if (role === 'PATIENT') return '/patient/dashboard';
    if (role === 'DOCTOR') return '/doctor/dashboard';
    if (role === 'ADMIN') return '/admin/dashboard';
    return '/login';
  };

  const isOperational = systemStatus?.status === 'OPERATIONAL';

  return (
    <div className="min-h-screen flex flex-col bg-surface text-charcoal relative overflow-hidden">
      <Header />

      {/* Hero Ambient Warm Lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[450px] bg-gradient-to-b from-orange-100/40 via-pink-100/30 to-transparent rounded-full blur-3xl pointer-events-none -z-0" />
      <div className="absolute top-[500px] right-[-100px] w-[500px] h-[500px] bg-pink-100/25 rounded-full blur-3xl pointer-events-none -z-0" />

      {/* ==================================================
          1. HERO SECTION
          ================================================== */}
      <section className="relative z-10 overflow-hidden py-16 lg:py-24 border-b border-softBorder bg-gradient-to-b from-surface via-warm-surface/50 to-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* System Availability Capsule */}
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-surface border border-orange-200 text-charcoal text-xs font-bold shadow-xs">
                {statusLoading ? (
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-400 animate-ping inline-block" />
                ) : isOperational ? (
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block ring-4 ring-emerald-100" />
                ) : (
                  <span className="w-2.5 h-2.5 rounded-full bg-brandRed inline-block ring-4 ring-red-100" />
                )}
                <span>
                  System Status: {isOperational ? (
                    <strong className="text-emerald-700 font-extrabold">Operational</strong>
                  ) : (
                    <strong className="text-brandRed font-extrabold">Service Temporarily Unavailable</strong>
                  )}
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-charcoal tracking-tight leading-[1.12]">
                Your Health.{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-orange-600 to-brandPink">
                  Connected.
                </span>{' '}
                Understood.
              </h1>

              <p className="text-base sm:text-lg text-muted max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Health Buddy helps individuals organize their health information, monitor health trends, connect with their personal doctors, and receive AI-assisted explanations while keeping clinical decisions with qualified healthcare professionals.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-3">
                {isAuthenticated ? (
                  <Link to={getDashboardLink()} className="w-full sm:w-auto">
                    <Button size="lg" className="w-full sm:w-auto shadow-glow font-bold" rightIcon={<ArrowRight className="w-5 h-5" />}>
                      Go to {role} Dashboard
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link to="/register/patient" className="w-full sm:w-auto">
                      <Button size="lg" className="w-full sm:w-auto shadow-glow font-bold" leftIcon={<ShieldCheck className="w-5 h-5" />}>
                        Get Started
                      </Button>
                    </Link>
                    <a href="#features" className="w-full sm:w-auto">
                      <Button size="lg" variant="outline" className="w-full sm:w-auto border-orange-200 bg-surface text-charcoal hover:bg-orange-50/60 font-bold" rightIcon={<ArrowRight className="w-5 h-5 text-primary" />}>
                        Explore Platform
                      </Button>
                    </a>
                  </>
                )}
              </div>

              {/* Trust & Principle Badges */}
              <div className="pt-6 flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 text-xs text-muted">
                <div className="flex items-center gap-1.5 font-semibold text-charcoal">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  <span>Patient-Owned Vault</span>
                </div>
                <div className="flex items-center gap-1.5 font-semibold text-charcoal">
                  <Lock className="w-4 h-4 text-brandPink" />
                  <span>Encrypted Documents</span>
                </div>
                <div className="flex items-center gap-1.5 font-semibold text-charcoal">
                  <Stethoscope className="w-4 h-4 text-orange-600" />
                  <span>Doctor Reviewable</span>
                </div>
              </div>
            </div>

            {/* Right Hero Visual Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md bg-surface p-6 rounded-3xl border border-orange-200/80 shadow-elevated space-y-5">
                {/* Floating Visual Elements */}
                <div className="flex items-center justify-between border-b border-softBorder pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-orange-100 flex items-center justify-center text-primary">
                      <Activity className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-charcoal">Health Hub Preview</div>
                      <div className="text-xs text-muted">Real-time Encrypted Telemetry</div>
                    </div>
                  </div>
                  <Badge variant="success" size="sm">Active Vault</Badge>
                </div>

                {/* Sample Document Metric Card */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-orange-50/60 to-pink-50/40 border border-orange-200/70 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-charcoal flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-primary" />
                      Comprehensive Lab Profile
                    </span>
                    <Badge variant="primary" size="sm">Processed</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 bg-surface rounded-xl border border-softBorder">
                      <div className="text-muted text-[11px]">Hemoglobin</div>
                      <div className="font-extrabold text-sm text-charcoal">14.2 g/dL</div>
                      <div className="text-[10px] text-emerald-700 font-bold">Normal Range</div>
                    </div>
                    <div className="p-2.5 bg-surface rounded-xl border border-softBorder">
                      <div className="text-muted text-[11px]">Fasting Glucose</div>
                      <div className="font-extrabold text-sm text-charcoal">92 mg/dL</div>
                      <div className="text-[10px] text-emerald-700 font-bold">Optimal</div>
                    </div>
                  </div>
                </div>

                {/* AI Assistant Insight Simulation */}
                <div className="p-3.5 bg-surface rounded-2xl border border-pink-200/70 space-y-1.5 shadow-xs">
                  <div className="flex items-center gap-2 text-xs font-bold text-brandPink">
                    <Bot className="w-4 h-4 text-brandPink" />
                    <span>AI Report Explainer</span>
                  </div>
                  <p className="text-xs text-muted leading-relaxed">
                    "Your blood glucose and hemoglobin are in healthy reference ranges. Consult your clinician for formal medical interpretation."
                  </p>
                </div>

                {/* Privacy Badge Footer */}
                <div className="flex items-center justify-between text-[11px] text-muted pt-2 border-t border-softBorder">
                  <span className="flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5 text-primary" /> Zero-Trust Role Isolation
                  </span>
                  <span className="font-bold text-primary">100% Patient Control</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          2. PLATFORM FEATURES
          ================================================== */}
      <section id="features" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-block px-3.5 py-1 rounded-full bg-orange-100 text-primary-dark text-xs font-extrabold uppercase tracking-wide">
            Platform Capabilities
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-charcoal tracking-tight">
            Designed for Individuals, Empowered by Clinicians
          </h2>
          <p className="text-sm sm:text-base text-muted leading-relaxed">
            Every feature in Health Buddy is built around patient ownership, medical accuracy, zero-trust security, and seamless doctor collaboration.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Feature 1: Health Profile */}
          <Card className="p-6 bg-surface border border-softBorder hover:border-primary/40 hover:shadow-cardHover transition-all rounded-2xl space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-orange-100 text-primary flex items-center justify-center">
              <Heart className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-charcoal">Health Profile</h3>
            <p className="text-xs text-muted leading-relaxed">
              Consolidate physical demographics, blood group, emergency contacts, vital stats, and lifestyle factors in one secure health vault.
            </p>
          </Card>

          {/* Feature 2: Medical Reports */}
          <Card className="p-6 bg-surface border border-softBorder hover:border-primary/40 hover:shadow-cardHover transition-all rounded-2xl space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-pink-100 text-brandPink flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-charcoal">Medical Reports</h3>
            <p className="text-xs text-muted leading-relaxed">
              Upload PDF and image lab reports with automated text extraction, structured parameter parsing, and patient verification.
            </p>
          </Card>

          {/* Feature 3: Health Monitoring */}
          <Card className="p-6 bg-surface border border-softBorder hover:border-primary/40 hover:shadow-cardHover transition-all rounded-2xl space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-orange-100 text-primary flex items-center justify-center">
              <HeartPulse className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-charcoal">Health Monitoring</h3>
            <p className="text-xs text-muted leading-relaxed">
              Track clinical metrics and health goals over time with chronological milestones and trend visualization.
            </p>
          </Card>

          {/* Feature 4: Medication Tracking */}
          <Card className="p-6 bg-surface border border-softBorder hover:border-primary/40 hover:shadow-cardHover transition-all rounded-2xl space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-pink-100 text-brandPink flex items-center justify-center">
              <Pill className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-charcoal">Medication Tracking</h3>
            <p className="text-xs text-muted leading-relaxed">
              Organize prescriptions and medication schedules with dosage instructions and allergy contraindication warnings.
            </p>
          </Card>

          {/* Feature 5: Doctor Connectivity */}
          <Card className="p-6 bg-surface border border-softBorder hover:border-primary/40 hover:shadow-cardHover transition-all rounded-2xl space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-orange-100 text-primary flex items-center justify-center">
              <Stethoscope className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-charcoal">Doctor Connectivity</h3>
            <p className="text-xs text-muted leading-relaxed">
              Connect with verified licensed clinicians to share records and clinical timelines under explicit patient authorization.
            </p>
          </Card>

          {/* Feature 6: Tele-Consultation */}
          <Card className="p-6 bg-surface border border-softBorder hover:border-primary/40 hover:shadow-cardHover transition-all rounded-2xl space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-pink-100 text-brandPink flex items-center justify-center">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-charcoal">Tele-Consultation</h3>
            <p className="text-xs text-muted leading-relaxed">
              Remote clinical consultations supported by integrated medical history, document review, and real-time decision support.
            </p>
          </Card>

          {/* Feature 7: AI Health Assistant */}
          <Card className="p-6 bg-surface border border-softBorder hover:border-primary/40 hover:shadow-cardHover transition-all rounded-2xl space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-orange-100 text-primary flex items-center justify-center">
              <Bot className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-charcoal">AI Health Explainer</h3>
            <p className="text-xs text-muted leading-relaxed">
              Receive patient-friendly explanations of complex medical reports and trends, always strictly advisory without autonomous diagnosis.
            </p>
          </Card>

          {/* Feature 8: Privacy & Consent */}
          <Card className="p-6 bg-surface border border-softBorder hover:border-primary/40 hover:shadow-cardHover transition-all rounded-2xl space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-pink-100 text-brandPink flex items-center justify-center">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-charcoal">Privacy & Consent</h3>
            <p className="text-xs text-muted leading-relaxed">
              Consent-driven data sharing where patients decide exactly which medical documents and parameters their doctor can access.
            </p>
          </Card>
        </div>
      </section>

      {/* ==================================================
          3. HOW IT WORKS
          ================================================== */}
      <section id="how-it-works" className="py-20 bg-warm-surface/60 border-y border-softBorder relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <div className="inline-block px-3.5 py-1 rounded-full bg-pink-100 text-brandPink-dark text-xs font-extrabold uppercase tracking-wide">
              Workflow Overview
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-charcoal tracking-tight">
              How Health Buddy Works
            </h2>
            <p className="text-sm sm:text-base text-muted leading-relaxed">
              A simple, secure 5-step journey to organized and actionable personal health information.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <div className="p-5 bg-surface rounded-2xl border border-softBorder shadow-xs space-y-3 text-center">
              <div className="w-10 h-10 rounded-full bg-primary text-white font-black text-sm flex items-center justify-center mx-auto">
                1
              </div>
              <h3 className="font-bold text-sm text-charcoal">Build Your Profile</h3>
              <p className="text-xs text-muted leading-relaxed">
                Enter your demographics, baseline vitals, emergency contacts, and allergies.
              </p>
            </div>

            <div className="p-5 bg-surface rounded-2xl border border-softBorder shadow-xs space-y-3 text-center">
              <div className="w-10 h-10 rounded-full bg-primary text-white font-black text-sm flex items-center justify-center mx-auto">
                2
              </div>
              <h3 className="font-bold text-sm text-charcoal">Organize Reports</h3>
              <p className="text-xs text-muted leading-relaxed">
                Upload PDFs and lab scans to automatically extract structured metrics.
              </p>
            </div>

            <div className="p-5 bg-surface rounded-2xl border border-softBorder shadow-xs space-y-3 text-center">
              <div className="w-10 h-10 rounded-full bg-primary text-white font-black text-sm flex items-center justify-center mx-auto">
                3
              </div>
              <h3 className="font-bold text-sm text-charcoal">Monitor Health</h3>
              <p className="text-xs text-muted leading-relaxed">
                Track lab trends, chronic conditions, and personal wellness goals over time.
              </p>
            </div>

            <div className="p-5 bg-surface rounded-2xl border border-softBorder shadow-xs space-y-3 text-center">
              <div className="w-10 h-10 rounded-full bg-primary text-white font-black text-sm flex items-center justify-center mx-auto">
                4
              </div>
              <h3 className="font-bold text-sm text-charcoal">Connect With Doctor</h3>
              <p className="text-xs text-muted leading-relaxed">
                Share authorized records with licensed clinicians for informed consultations.
              </p>
            </div>

            <div className="p-5 bg-surface rounded-2xl border border-softBorder shadow-xs space-y-3 text-center">
              <div className="w-10 h-10 rounded-full bg-primary text-white font-black text-sm flex items-center justify-center mx-auto">
                5
              </div>
              <h3 className="font-bold text-sm text-charcoal">Understand Insights</h3>
              <p className="text-xs text-muted leading-relaxed">
                Receive clear AI-assisted summaries to discuss during your next appointment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          4. FOR PATIENTS & FOR DOCTORS
          ================================================== */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* For Patients Card */}
          <Card id="for-patients" className="p-8 bg-gradient-to-br from-surface to-orange-50/40 border border-orange-200/80 rounded-3xl space-y-6 shadow-xs">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-orange-100 text-primary flex items-center justify-center shadow-xs">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-black text-charcoal">For Patients</h3>
                <Badge variant="primary" size="sm">Patient Portal</Badge>
              </div>
              <p className="text-sm text-muted leading-relaxed">
                Take complete ownership of your medical history and clinical documents in a secure, intuitive environment.
              </p>
            </div>

            <ul className="space-y-3 text-xs sm:text-sm text-charcoal font-medium">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>Upload and store all medical documents (PDFs, scans, prescriptions)</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>Automated parameter extraction with review and correction tools</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>Unified clinical health timeline across all historical events</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>Consent-controlled data sharing with your personal healthcare team</span>
              </li>
            </ul>

            <div className="pt-2">
              <Link to="/register/patient">
                <Button variant="primary" size="md" className="w-full sm:w-auto font-bold shadow-xs">
                  Create Patient Account
                </Button>
              </Link>
            </div>
          </Card>

          {/* For Doctors Card */}
          <Card id="for-doctors" className="p-8 bg-gradient-to-br from-surface to-pink-50/40 border border-pink-200/80 rounded-3xl space-y-6 shadow-xs">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-pink-100 text-brandPink flex items-center justify-center shadow-xs">
                <Stethoscope className="w-6 h-6" />
              </div>
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-black text-charcoal">For Doctors</h3>
                <Badge variant="pink" size="sm">Doctor Portal</Badge>
              </div>
              <p className="text-sm text-muted leading-relaxed">
                Clinical decision support tools and verified patient tele-connectivity designed to enhance practice efficiency.
              </p>
            </div>

            <ul className="space-y-3 text-xs sm:text-sm text-charcoal font-medium">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-brandPink shrink-0 mt-0.5" />
                <span>Verified medical licensure and credential management</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-brandPink shrink-0 mt-0.5" />
                <span>Structured patient health telemetry and lab trends review</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-brandPink shrink-0 mt-0.5" />
                <span>Tele-consultation connectivity with patient-shared health vaults</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-brandPink shrink-0 mt-0.5" />
                <span>Clinical safety checks, allergy warnings, and provenance tracking</span>
              </li>
            </ul>

            <div className="pt-2">
              <Link to="/register/doctor">
                <Button variant="pink" size="md" className="w-full sm:w-auto font-bold shadow-xs">
                  Register as Doctor
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>

      {/* ==================================================
          5. SECURITY & PRIVACY PRINCIPLES
          ================================================== */}
      <section id="security" className="py-20 bg-warm-surface/50 border-y border-softBorder relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <div className="inline-block px-3.5 py-1 rounded-full bg-orange-100 text-primary-dark text-xs font-extrabold uppercase tracking-wide">
              Enterprise Trust
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-charcoal tracking-tight">
              Security & Privacy Architecture
            </h2>
            <p className="text-sm sm:text-base text-muted leading-relaxed">
              Built from the ground up on zero-trust principles, cryptographic role isolation, and complete patient data ownership.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 bg-surface border border-softBorder rounded-2xl space-y-3">
              <div className="w-10 h-10 rounded-xl bg-orange-100 text-primary flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-charcoal">Role-Based Access Isolation</h3>
              <p className="text-xs text-muted leading-relaxed">
                Strict domain boundaries between Patients, Doctors, and Administrators enforced via stateless JWT filters and method security.
              </p>
            </Card>

            <Card className="p-6 bg-surface border border-softBorder rounded-2xl space-y-3">
              <div className="w-10 h-10 rounded-xl bg-pink-100 text-brandPink flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-charcoal">Patient Ownership & Consent</h3>
              <p className="text-xs text-muted leading-relaxed">
                Zero cross-patient access. Medical files and clinical parameters are cryptographically verified and only accessible by authorized owners.
              </p>
            </Card>

            <Card className="p-6 bg-surface border border-softBorder rounded-2xl space-y-3">
              <div className="w-10 h-10 rounded-xl bg-orange-100 text-primary flex items-center justify-center">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-charcoal">Immutable Audit Logging</h3>
              <p className="text-xs text-muted leading-relaxed">
                Every sensitive document upload, view, download, edit, and deletion is recorded in an immutable PostgreSQL audit trail.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* ==================================================
          6. AI ASSISTANCE & CLINICAL DISCLAIMER
          ================================================== */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-orange-50/70 via-white to-pink-50/50 border border-orange-200/80 shadow-card">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-100 text-brandPink text-xs font-bold">
              <Bot className="w-4 h-4 text-brandPink" />
              <span>AI-Assisted Health Explanations</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-charcoal tracking-tight">
              Translating Complex Medical Documents into Plain English
            </h2>

            <p className="text-sm text-muted leading-relaxed">
              Our AI capabilities help summarize health parameters, explain medical terminology, and illustrate longitudinal health trends so you feel empowered during medical consultations.
            </p>

            <div className="p-4 bg-orange-50 rounded-2xl border border-orange-200 text-xs text-charcoal space-y-1">
              <div className="font-bold text-primary flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-primary" />
                <span>Important Clinical Notice</span>
              </div>
              <p className="text-muted leading-relaxed">
                AI-generated information is strictly educational and informational. It is not a medical diagnosis and does not replace professional medical advice, clinical diagnosis, or treatment recommendations from qualified healthcare professionals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          7. CALL TO ACTION (CTA)
          ================================================== */}
      <section className="py-20 bg-gradient-to-r from-primary via-primary-dark to-brandPink text-white relative z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
            Take Control of Your Health Information Today.
          </h2>
          <p className="text-base sm:text-lg text-orange-100 max-w-2xl mx-auto leading-relaxed">
            Join thousands of individuals and doctors using Health Buddy for organized medical records, clear lab insights, and connected care.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link to="/register/patient" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto bg-white text-primary-dark hover:bg-orange-50 font-bold shadow-lg">
                Create Patient Account
              </Button>
            </Link>
            <Link to="/login" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white border-white/30 backdrop-blur-md font-bold">
                Doctor Login
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
