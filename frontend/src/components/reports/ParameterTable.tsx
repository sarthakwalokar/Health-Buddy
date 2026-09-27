import React from 'react';
import { MedicalReportParameter } from '../../types/report';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Edit2, ShieldCheck, AlertCircle, FileText, Cpu, UserCheck } from 'lucide-react';

interface ParameterTableProps {
  parameters: MedicalReportParameter[];
  onEditParameter: (param: MedicalReportParameter) => void;
  onVerifyParameter?: (paramId: string) => Promise<void>;
}

export const ParameterTable: React.FC<ParameterTableProps> = ({
  parameters,
  onEditParameter,
}) => {
  if (!parameters || parameters.length === 0) {
    return (
      <div className="p-8 text-center bg-surface border border-softBorder rounded-2xl">
        <div className="w-12 h-12 rounded-2xl bg-orange-100 text-primary mx-auto flex items-center justify-center mb-3">
          <FileText className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-charcoal">No Structured Parameters Extracted</h3>
        <p className="text-xs text-muted max-w-md mx-auto mt-1">
          No specific lab metrics were automatically parsed from this document. You can manually add clinical parameters below or view the extracted text.
        </p>
      </div>
    );
  }

  const getSourceBadge = (source: string) => {
    switch (source) {
      case 'PDF_TEXT':
        return (
          <Badge variant="primary" size="sm" className="gap-1 bg-orange-50 text-orange-800 border-orange-200">
            <FileText className="w-3 h-3 text-primary" />
            <span>PDF Text</span>
          </Badge>
        );
      case 'OCR':
        return (
          <Badge variant="pink" size="sm" className="gap-1 bg-pink-50 text-brandPink border-pink-200">
            <Cpu className="w-3 h-3 text-brandPink" />
            <span>OCR</span>
          </Badge>
        );
      case 'MANUAL':
        return (
          <Badge variant="neutral" size="sm" className="gap-1">
            <UserCheck className="w-3 h-3 text-muted" />
            <span>Manual Entry</span>
          </Badge>
        );
      default:
        return <Badge variant="neutral" size="sm">{source}</Badge>;
    }
  };

  const getConfidenceIndicator = (confidence?: number) => {
    if (confidence === undefined || confidence === null) return <span className="text-muted text-xs">—</span>;
    const pct = Math.round(confidence * 100);
    const colorClass = pct >= 90 ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : pct >= 70 ? 'text-amber-700 bg-amber-50 border-amber-200' : 'text-rose-700 bg-rose-50 border-rose-200';
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold border ${colorClass}`}>
        {pct}% confidence
      </span>
    );
  };

  return (
    <div className="overflow-x-auto rounded-2xl border border-softBorder bg-surface shadow-xs">
      <table className="min-w-full divide-y divide-softBorder text-left text-xs">
        <thead className="bg-orange-50/40 text-charcoal font-bold uppercase tracking-wider text-[11px]">
          <tr>
            <th scope="col" className="px-5 py-3.5">Parameter</th>
            <th scope="col" className="px-5 py-3.5">Value & Unit</th>
            <th scope="col" className="px-5 py-3.5">Reference Range</th>
            <th scope="col" className="px-5 py-3.5">Confidence</th>
            <th scope="col" className="px-5 py-3.5">Source</th>
            <th scope="col" className="px-5 py-3.5">Verification</th>
            <th scope="col" className="px-5 py-3.5 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-softBorder/60 bg-surface">
          {parameters.map((param) => (
            <tr key={param.id} className="hover:bg-orange-50/20 transition-colors">
              {/* Parameter Name */}
              <td className="px-5 py-3.5 whitespace-nowrap">
                <div className="font-bold text-sm text-charcoal">{param.parameterName}</div>
                {param.parameterCode && (
                  <div className="text-[11px] text-muted font-mono">{param.parameterCode}</div>
                )}
              </td>

              {/* Value & Unit */}
              <td className="px-5 py-3.5 whitespace-nowrap">
                <div className="font-extrabold text-sm text-charcoal flex items-center gap-1.5">
                  <span>{param.valueText}</span>
                  {param.unit && <span className="text-xs font-normal text-muted">{param.unit}</span>}
                </div>
                {param.correctedByPatient && param.originalValueText && (
                  <div className="text-[11px] text-brandPink font-medium">
                    (Corrected from: {param.originalValueText})
                  </div>
                )}
              </td>

              {/* Reference Range */}
              <td className="px-5 py-3.5 whitespace-nowrap text-muted font-medium">
                {param.referenceRange || 'Not specified'}
              </td>

              {/* Confidence */}
              <td className="px-5 py-3.5 whitespace-nowrap">
                {getConfidenceIndicator(param.extractionConfidence)}
              </td>

              {/* Source */}
              <td className="px-5 py-3.5 whitespace-nowrap">
                {getSourceBadge(param.source)}
              </td>

              {/* Verification Status */}
              <td className="px-5 py-3.5 whitespace-nowrap">
                {param.patientVerified ? (
                  <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-xs">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-amber-700 font-bold text-xs">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    Unverified
                  </span>
                )}
              </td>

              {/* Action: Edit / Correct */}
              <td className="px-5 py-3.5 whitespace-nowrap text-right">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEditParameter(param)}
                  className="px-2.5 py-1 text-xs font-bold border-orange-200 text-charcoal hover:bg-orange-50"
                  leftIcon={<Edit2 className="w-3.5 h-3.5 text-primary" />}
                >
                  Edit / Correct
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
