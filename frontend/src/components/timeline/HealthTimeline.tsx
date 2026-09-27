import React from 'react';
import { PatientTimelineEvent } from '../../types';
import {
  Calendar,
  Heart,
  ShieldAlert,
  Scissors,
  Users,
  Target,
  Activity,
  CheckCircle2,
  Clock,
  Sparkles,
  Stethoscope,
  UserCheck,
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import { EmptyState } from '../feedback/EmptyState';

interface HealthTimelineProps {
  events: PatientTimelineEvent[];
  isLoading?: boolean;
}

export const HealthTimeline: React.FC<HealthTimelineProps> = ({ events, isLoading }) => {
  if (isLoading) {
    return (
      <div className="space-y-4 py-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-stone-200/80" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-stone-200/80 rounded w-1/4" />
              <div className="h-3 bg-stone-200/80 rounded w-3/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <EmptyState
        title="No health timeline events"
        description="As you record medical conditions, allergies, surgeries, and goals, your chronological health timeline will appear here."
        icon={<Clock className="w-6 h-6 text-muted" />}
      />
    );
  }

  const getEventIcon = (category: string) => {
    switch (category?.toUpperCase()) {
      case 'CONDITION':
        return <Heart className="w-4 h-4 text-primary" />;
      case 'ALLERGY':
        return <ShieldAlert className="w-4 h-4 text-amber-600" />;
      case 'SURGERY':
        return <Scissors className="w-4 h-4 text-stone-700" />;
      case 'FAMILY_HISTORY':
        return <Users className="w-4 h-4 text-teal-600" />;
      case 'HEALTH_GOAL':
        return <Target className="w-4 h-4 text-emerald-700" />;
      case 'LIFESTYLE':
      case 'PROFILE':
      default:
        return <Activity className="w-4 h-4 text-primary" />;
    }
  };

  const getSourceBadge = (source: string) => {
    switch (source) {
      case 'DOCTOR_REVIEWED':
      case 'DOCTOR_REPORTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
            <Stethoscope className="w-3 h-3 text-emerald-700" />
            Doctor reviewed
          </span>
        );
      case 'AI_GENERATED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
            <Sparkles className="w-3 h-3 text-amber-600" />
            AI generated
          </span>
        );
      case 'SYSTEM_GENERATED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-stone-100 text-stone-800 border border-stone-200">
            <CheckCircle2 className="w-3 h-3 text-stone-600" />
            System generated
          </span>
        );
      case 'PATIENT_REPORTED':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-stone-100 text-stone-800 border border-stone-200">
            <UserCheck className="w-3 h-3 text-stone-600" />
            Patient reported
          </span>
        );
    }
  };

  return (
    <div className="relative pl-7 space-y-5 before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-emerald-400 before:via-stone-200 before:to-stone-200">
      {events.map((event) => (
        <div key={event.id} className="relative group">
          {/* Node Icon */}
          <div className="absolute -left-7 top-1.5 w-7 h-7 rounded-xl bg-white border-2 border-primary flex items-center justify-center shadow-sm">
            {getEventIcon(event.category)}
          </div>

          <div className="bg-gradient-to-br from-white to-stone-50/60 rounded-2xl border border-stone-200 p-4 sm:p-5 shadow-subtle hover:border-primary-300 hover:shadow-card transition-all duration-200">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-extrabold text-sm sm:text-base text-charcoal">{event.title}</span>
                <Badge variant="neutral" size="sm">
                  {event.category.replace('_', ' ')}
                </Badge>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {getSourceBadge(event.source)}
                <span className="flex items-center gap-1 text-xs text-muted font-semibold">
                  <Calendar className="w-3.5 h-3.5 text-muted" />
                  {event.eventDate ? new Date(event.eventDate).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  }) : 'Undated'}
                </span>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-muted leading-relaxed font-medium mt-1">{event.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
