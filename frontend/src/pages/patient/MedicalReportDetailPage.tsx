import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { reportApi } from '../../api/reportApi';
import {
  MedicalReportDetail,
  MedicalReportParameter,
  UpdateParameterRequest,
  CreateParameterRequest,
} from '../../types/report';
import { ParameterTable } from '../../components/reports/ParameterTable';
import { EditParameterModal } from '../../components/reports/EditParameterModal';
import { AddParameterModal } from '../../components/reports/AddParameterModal';
import { DocumentPreviewModal } from '../../components/reports/DocumentPreviewModal';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import {
  FileText,
  ArrowLeft,
  Download,
  Eye,
  ShieldCheck,
  Trash2,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  FileCheck,
  Loader2,
  Sparkles,
} from 'lucide-react';

export const MedicalReportDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [report, setReport] = useState<MedicalReportDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedParameter, setSelectedParameter] = useState<MedicalReportParameter | null>(null);

  // Actions loading state
  const [isVerifying, setIsVerifying] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  const fetchReportDetail = async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await reportApi.getReportById(id);
      setReport(response.data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load report details.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReportDetail();
  }, [id]);

  const handleVerifyReport = async () => {
    if (!id) return;
    setIsVerifying(true);
    try {
      const res = await reportApi.verifyReport(id);
      if (res.data) {
        setReport(res.data);
      }
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to verify report');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDeleteReport = async () => {
    if (!id) return;
    setIsDeleting(true);
    try {
      await reportApi.deleteReport(id);
      navigate('/patient/reports');
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to delete report');
      setIsDeleting(false);
      setShowConfirmDelete(false);
    }
  };

  const handleDownload = () => {
    if (!id || !report) return;
    reportApi.downloadReportFile(id, report.originalFileName);
  };

  const handleEditParameter = (param: MedicalReportParameter) => {
    setSelectedParameter(param);
    setIsEditModalOpen(true);
  };

  const handleSaveParameter = async (parameterId: string, data: UpdateParameterRequest) => {
    if (!id) return;
    const res = await reportApi.updateParameter(id, parameterId, data);
    if (res.data && report) {
      setReport({
        ...report,
        parameters: report.parameters.map((p) => (p.id === parameterId ? res.data : p)),
      });
    }
  };

  const handleAddParameter = async (data: CreateParameterRequest) => {
    if (!id) return;
    const res = await reportApi.addParameter(id, data);
    if (res.data && report) {
      setReport({
        ...report,
        parameters: [...report.parameters, res.data],
      });
    }
  };

  const handleCopyText = () => {
    if (report?.extractedText) {
      navigator.clipboard.writeText(report.extractedText);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '—';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return '—';
    try {
      return new Date(isoString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 text-center space-y-3">
        <Spinner size="lg" className="text-primary mx-auto" />
        <p className="text-sm font-semibold text-charcoal">Loading medical document details...</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="p-8 bg-surface rounded-2xl border border-softBorder text-center space-y-4 max-w-lg mx-auto mt-12">
        <div className="w-12 h-12 rounded-2xl bg-red-100 text-brandRed mx-auto flex items-center justify-center">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-charcoal">Report Not Found</h2>
        <p className="text-xs text-muted">{error || 'This medical report does not exist or you do not have permission to view it.'}</p>
        <Link to="/patient/reports">
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to Medical Reports
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/patient/reports"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-muted hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Reports</span>
        </Link>
      </div>

      {/* Main Header Card */}
      <Card className="p-6 bg-surface border border-softBorder rounded-2xl shadow-xs space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-orange-100 text-primary flex items-center justify-center shrink-0 shadow-xs">
              <FileText className="w-7 h-7" />
            </div>
            <div className="space-y-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-charcoal tracking-tight break-all">
                  {report.originalFileName}
                </h1>
                <Badge variant="primary" size="sm">
                  {report.reportTypeLabel}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-muted pt-1">
                <span>Uploaded: <strong className="text-charcoal">{formatDate(report.uploadedAt)}</strong></span>
                <span>•</span>
                <span>Size: <strong className="text-charcoal">{formatFileSize(report.fileSize)}</strong></span>
                <span>•</span>
                <span>Format: <strong className="text-charcoal">{report.fileType}</strong></span>
              </div>
            </div>
          </div>

          {/* Status Badges */}
          <div className="flex flex-wrap items-center gap-2.5">
            {report.processingStatus === 'PROCESSED' ? (
              <Badge variant="success" size="md" className="gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Processing Complete</span>
              </Badge>
            ) : report.processingStatus === 'PROCESSING' ? (
              <Badge variant="primary" size="md" className="gap-1.5">
                <Loader2 className="w-4 h-4 text-primary animate-spin" />
                <span>Processing Document</span>
              </Badge>
            ) : (
              <Badge variant="danger" size="md" className="gap-1.5">
                <AlertCircle className="w-4 h-4 text-brandRed" />
                <span>Processing Failed</span>
              </Badge>
            )}

            {report.verificationStatus === 'PATIENT_VERIFIED' ? (
              <Badge variant="success" size="md" className="gap-1.5 bg-emerald-50 text-emerald-800 border-emerald-200">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Patient Verified</span>
              </Badge>
            ) : report.verificationStatus === 'DOCTOR_REVIEWED' ? (
              <Badge variant="pink" size="md" className="gap-1.5">
                <FileCheck className="w-4 h-4 text-brandPink" />
                <span>Doctor Reviewed</span>
              </Badge>
            ) : (
              <Badge variant="warning" size="md" className="gap-1.5">
                <AlertCircle className="w-4 h-4 text-warning" />
                <span>Awaiting Patient Verification</span>
              </Badge>
            )}
          </div>
        </div>

        {/* Quick Actions Bar */}
        <div className="pt-4 border-t border-softBorder flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsPreviewOpen(true)}
              className="font-bold shadow-xs"
              leftIcon={<Eye className="w-4 h-4" />}
            >
              View Document
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="font-bold border-orange-200 text-charcoal hover:bg-orange-50"
              leftIcon={<Download className="w-4 h-4 text-primary" />}
            >
              Download Original
            </Button>

            {report.verificationStatus === 'NOT_VERIFIED' && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleVerifyReport}
                isLoading={isVerifying}
                className="font-bold border-emerald-300 text-emerald-700 bg-emerald-50/50 hover:bg-emerald-100"
                leftIcon={<ShieldCheck className="w-4 h-4 text-emerald-600" />}
              >
                Verify All Parameters
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!showConfirmDelete ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowConfirmDelete(true)}
                className="text-brandRed hover:bg-red-50 font-bold"
                leftIcon={<Trash2 className="w-4 h-4" />}
              >
                Delete Report
              </Button>
            ) : (
              <div className="flex items-center gap-2 bg-red-50 p-1.5 rounded-xl border border-red-200">
                <span className="text-xs font-semibold text-brandRed px-1">Permanently delete?</span>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleDeleteReport}
                  isLoading={isDeleting}
                  className="py-1 px-2.5 text-xs font-bold"
                >
                  Confirm Delete
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowConfirmDelete(false)}
                  className="py-1 px-2 text-xs"
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Extracted Parameters Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-charcoal flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Extracted Clinical Parameters
            </h2>
            <p className="text-xs text-muted">
              Structured metrics parsed from the document. Verify or edit any value to keep your health timeline accurate.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            className="font-bold border-orange-200 text-primary hover:bg-orange-50"
            leftIcon={<PlusCircle className="w-4 h-4" />}
          >
            Add Parameter
          </Button>
        </div>

        <ParameterTable
          parameters={report.parameters || []}
          onEditParameter={handleEditParameter}
        />
      </div>

      {/* Extracted Document Text Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-charcoal flex items-center gap-2">
              <FileText className="w-5 h-5 text-brandPink" />
              Document Text Stream
            </h2>
            <p className="text-xs text-muted">
              Raw text extracted from the document stream for clinical reference.
            </p>
          </div>

          {report.extractedText && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyText}
              className="text-xs py-1 px-3 border-orange-200"
              leftIcon={copiedText ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            >
              {copiedText ? 'Copied' : 'Copy Text'}
            </Button>
          )}
        </div>

        <Card className="p-5 bg-surface border border-softBorder rounded-2xl">
          {report.extractedText ? (
            <pre className="text-xs text-charcoal/90 font-mono whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto bg-stone-50 p-4 rounded-xl border border-softBorder">
              {report.extractedText}
            </pre>
          ) : (
            <div className="py-8 text-center text-xs text-muted">
              No text stream available for this document format.
            </div>
          )}
        </Card>
      </div>

      {/* Modals */}
      <DocumentPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        reportId={report.id}
        filename={report.originalFileName}
        fileType={report.fileType}
      />

      <EditParameterModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedParameter(null);
        }}
        parameter={selectedParameter}
        onSave={handleSaveParameter}
      />

      <AddParameterModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddParameter}
      />
    </div>
  );
};
