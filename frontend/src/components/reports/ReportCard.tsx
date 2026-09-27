import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MedicalReport } from '../../types/report';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Download,
  Trash2,
  ExternalLink,
  Loader2,
  FileCheck,
} from 'lucide-react';

interface ReportCardProps {
  report: MedicalReport;
  onDelete: (id: string) => Promise<void>;
  onVerify: (id: string) => Promise<void>;
  onDownload: (id: string, filename: string) => Promise<void>;
}

export const ReportCard: React.FC<ReportCardProps> = ({
  report,
  onDelete,
  onVerify,
  onDownload,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  const getProcessingBadge = () => {
    switch (report.processingStatus) {
      case 'PROCESSED':
        return (
          <Badge variant="success" size="sm" className="gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Processed</span>
          </Badge>
        );
      case 'PROCESSING':
        return (
          <Badge variant="primary" size="sm" className="gap-1">
            <Loader2 className="w-3 h-3 text-primary animate-spin" />
            <span>Processing</span>
          </Badge>
        );
      case 'FAILED':
        return (
          <Badge variant="danger" size="sm" className="gap-1">
            <AlertCircle className="w-3 h-3 text-brandRed" />
            <span>Processing Failed</span>
          </Badge>
        );
      default:
        return (
          <Badge variant="neutral" size="sm" className="gap-1">
            <Clock className="w-3 h-3 text-muted" />
            <span>Uploaded</span>
          </Badge>
        );
    }
  };

  const getVerificationBadge = () => {
    switch (report.verificationStatus) {
      case 'PATIENT_VERIFIED':
        return (
          <Badge variant="success" size="sm" className="gap-1 bg-emerald-50 text-emerald-800 border-emerald-200">
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            <span>Patient Verified</span>
          </Badge>
        );
      case 'DOCTOR_REVIEWED':
        return (
          <Badge variant="pink" size="sm" className="gap-1">
            <FileCheck className="w-3 h-3 text-brandPink" />
            <span>Doctor Reviewed</span>
          </Badge>
        );
      default:
        return (
          <Badge variant="warning" size="sm" className="gap-1">
            <AlertCircle className="w-3 h-3 text-warning" />
            <span>Unverified</span>
          </Badge>
        );
    }
  };

  const handleVerify = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsVerifying(true);
    try {
      await onVerify(report.id);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDownloading(true);
    try {
      await onDownload(report.id, report.originalFileName);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDeleting(true);
    try {
      await onDelete(report.id);
    } finally {
      setIsDeleting(false);
      setShowConfirmDelete(false);
    }
  };

  return (
    <Card className="p-5 hover:border-primary/40 hover:shadow-cardHover transition-all flex flex-col justify-between bg-surface border border-softBorder rounded-2xl relative">
      {/* Top Details */}
      <div className="space-y-3.5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-primary flex items-center justify-center shrink-0 shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <Link
                to={`/patient/reports/${report.id}`}
                className="font-bold text-sm text-charcoal hover:text-primary transition-colors line-clamp-1 block"
                title={report.originalFileName}
              >
                {report.originalFileName}
              </Link>
              <div className="flex items-center gap-2 mt-1 text-xs text-muted">
                <span>{report.reportTypeLabel}</span>
                <span>•</span>
                <span>{formatFileSize(report.fileSize)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-softBorder/60">
          {getProcessingBadge()}
          {getVerificationBadge()}
        </div>

        {/* Extraction Summary */}
        <div className="text-xs text-muted flex items-center justify-between pt-1">
          <span>Uploaded: <strong className="text-charcoal font-semibold">{formatDate(report.uploadedAt)}</strong></span>
          <span>
            <strong className="text-primary font-bold">{report.parameterCount}</strong> metrics extracted
          </span>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-4 mt-3 border-t border-softBorder flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownload}
            isLoading={isDownloading}
            className="text-muted hover:text-charcoal px-2"
            title="Download original file"
          >
            <Download className="w-4 h-4" />
          </Button>

          {report.verificationStatus === 'NOT_VERIFIED' && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleVerify}
              isLoading={isVerifying}
              className="text-xs py-1 px-2.5 border-orange-200 text-primary hover:bg-orange-50 font-bold"
              leftIcon={<ShieldCheck className="w-3.5 h-3.5" />}
            >
              Verify
            </Button>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {!showConfirmDelete ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowConfirmDelete(true);
              }}
              className="text-muted hover:text-brandRed px-2"
              title="Delete report"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          ) : (
            <div className="flex items-center gap-1 bg-red-50 p-1 rounded-lg border border-red-200">
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-[11px] font-bold text-brandRed hover:underline px-1.5 py-0.5"
              >
                {isDeleting ? 'Deleting...' : 'Confirm'}
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowConfirmDelete(false);
                }}
                className="text-[11px] text-muted hover:text-charcoal px-1"
              >
                Cancel
              </button>
            </div>
          )}

          <Link to={`/patient/reports/${report.id}`}>
            <Button
              variant="primary"
              size="sm"
              className="text-xs py-1 px-3 shadow-xs font-bold"
              rightIcon={<ExternalLink className="w-3.5 h-3.5" />}
            >
              View
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
};
