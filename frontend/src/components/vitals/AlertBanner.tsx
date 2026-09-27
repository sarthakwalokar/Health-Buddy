import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { AlertSeverity, HealthAlertResponse } from '../../types/vital';
import { Badge } from '../ui/Badge';

interface AlertBannerProps {
  alerts: HealthAlertResponse[];
  onAcknowledge: (alertId: string) => Promise<void>;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({ alerts, onAcknowledge }) => {
  if (!alerts || alerts.length === 0) return null;

  const getSeverityMeta = (severity: AlertSeverity) => {
    switch (severity) {
      case 'EMERGENCY':
        return {
          icon: ShieldAlert,
          bg: 'bg-red-50',
          border: 'border-red-300',
          textColor: 'text-red-900',
          badgeVariant: 'danger' as const,
        };
      case 'HIGH':
        return {
          icon: AlertTriangle,
          bg: 'bg-orange-50',
          border: 'border-orange-200',
          textColor: 'text-orange-950',
          badgeVariant: 'warning' as const,
        };
      case 'MEDIUM':
        return {
          icon: AlertCircle,
          bg: 'bg-amber-50/60',
          border: 'border-amber-200',
          textColor: 'text-amber-950',
          badgeVariant: 'amber' as const,
        };
      default:
        return {
          icon: AlertCircle,
          bg: 'bg-orange-50/30',
          border: 'border-orange-200',
          textColor: 'text-orange-950',
          badgeVariant: 'neutral' as const,
        };
    }
  };

  return (
    <div className="space-y-3 mb-6">
      {alerts.map((alert) => {
        const meta = getSeverityMeta(alert.severity);
        const Icon = meta.icon;

        return (
          <div
            key={alert.id}
            className={`p-4 rounded-2xl border ${meta.bg} ${meta.border} shadow-sm transition-all animate-fadeIn`}
            role="alert"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-white/80 shadow-xs mt-0.5">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className={`text-sm font-bold ${meta.textColor}`}>{alert.title}</h4>
                    <Badge variant={meta.badgeVariant} size="sm">
                      {alert.severity} NOTICE
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-700 mt-1 leading-relaxed">{alert.message}</p>
                  <p className="text-[10px] text-gray-500 mt-2">
                    Rule-based informational notice • Not a clinical diagnosis • Consult your doctor for medical assessment
                  </p>
                </div>
              </div>

              {alert.status !== 'ACKNOWLEDGED' && (
                <button
                  onClick={() => onAcknowledge(alert.id)}
                  className="px-3 py-1.5 bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 rounded-xl text-xs font-semibold text-gray-700 shadow-xs transition-all shrink-0 flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Acknowledge</span>
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
