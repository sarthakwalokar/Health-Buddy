import React, { useState, useEffect, useMemo } from 'react';
import { reportApi } from '../../api/reportApi';
import { MedicalReport, ReportType } from '../../types/report';
import { ReportCard } from '../../components/reports/ReportCard';
import { UploadReportModal } from '../../components/reports/UploadReportModal';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import {
  FileText,
  Upload,
  Search,
  Filter,
  ShieldCheck,
  CheckCircle2,
  FileSpreadsheet,
  AlertCircle,
} from 'lucide-react';

export const MedicalReportsPage: React.FC = () => {
  const [reports, setReports] = useState<MedicalReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  const fetchReports = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await reportApi.getMyReports();
      setReports(response.data || []);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load medical reports.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleUpload = async (file: File, reportType: ReportType, notes?: string) => {
    setIsUploading(true);
    try {
      await reportApi.uploadReport(file, reportType, notes);
      await fetchReports();
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    await reportApi.deleteReport(id);
    setReports((prev) => prev.filter((r) => r.id !== id));
  };

  const handleVerify = async (id: string) => {
    const res = await reportApi.verifyReport(id);
    if (res.data) {
      setReports((prev) =>
        prev.map((r) => (r.id === id ? { ...r, verificationStatus: 'PATIENT_VERIFIED', verificationStatusLabel: 'Patient Verified' } : r))
      );
    }
  };

  const handleDownload = async (id: string, filename: string) => {
    await reportApi.downloadReportFile(id, filename);
  };

  // Filtered reports
  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const matchesCategory =
        selectedCategory === 'ALL' || report.reportType === selectedCategory;
      const matchesSearch =
        !searchQuery.trim() ||
        report.originalFileName.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        report.reportTypeLabel.toLowerCase().includes(searchQuery.toLowerCase().trim());
      return matchesCategory && matchesSearch;
    });
  }, [reports, selectedCategory, searchQuery]);

  // Statistics calculation
  const totalCount = reports.length;
  const verifiedCount = reports.filter((r) => r.verificationStatus === 'PATIENT_VERIFIED').length;
  const totalParametersExtracted = reports.reduce((acc, r) => acc + (r.parameterCount || 0), 0);

  const categories = [
    { id: 'ALL', label: 'All Documents' },
    { id: 'LAB_REPORT', label: 'Lab Reports' },
    { id: 'PRESCRIPTION', label: 'Prescriptions' },
    { id: 'IMAGING_REPORT', label: 'Imaging' },
    { id: 'PATHOLOGY_REPORT', label: 'Pathology' },
    { id: 'DISCHARGE_SUMMARY', label: 'Discharge Summaries' },
    { id: 'OTHER', label: 'Other' },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-surface p-6 rounded-2xl border border-softBorder shadow-xs">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-primary text-xs font-bold mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
            <span>Encrypted Health Document Vault</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-charcoal tracking-tight">
            Medical Reports
          </h1>
          <p className="text-sm text-muted mt-1 max-w-xl">
            Securely store, organize, and automatically extract clinical parameters from your medical records and lab documents.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            size="md"
            onClick={() => setIsUploadModalOpen(true)}
            className="shadow-glow font-bold"
            leftIcon={<Upload className="w-4 h-4" />}
          >
            Upload Report
          </Button>
        </div>
      </div>

      {/* Summary Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 bg-gradient-to-br from-surface to-orange-50/30 border border-softBorder rounded-2xl">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-orange-100 text-primary flex items-center justify-center shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-charcoal">{totalCount}</div>
              <div className="text-xs text-muted font-medium">Uploaded Documents</div>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-surface to-pink-50/30 border border-softBorder rounded-2xl">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-pink-100 text-brandPink flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-charcoal">{verifiedCount}</div>
              <div className="text-xs text-muted font-medium">Verified by Patient</div>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-surface to-orange-50/30 border border-softBorder rounded-2xl">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-orange-100 text-primary flex items-center justify-center shrink-0">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-charcoal">{totalParametersExtracted}</div>
              <div className="text-xs text-muted font-medium">Extracted Clinical Metrics</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Search & Category Filter Tabs */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface p-4 rounded-2xl border border-softBorder">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reports by filename..."
              className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-softBorder bg-warm-surface/40 text-charcoal placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
            />
          </div>

          {/* Quick Filter Tag Summary */}
          <div className="text-xs text-muted flex items-center gap-1.5 self-center">
            <Filter className="w-3.5 h-3.5 text-primary" />
            <span>Showing <strong>{filteredReports.length}</strong> of <strong>{totalCount}</strong> documents</span>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-surface text-charcoal border border-softBorder hover:bg-orange-50/50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Reports Grid / Empty States */}
      {isLoading ? (
        <div className="py-20 text-center space-y-3">
          <Spinner size="lg" className="text-primary mx-auto" />
          <p className="text-sm font-semibold text-charcoal">Loading medical documents...</p>
        </div>
      ) : error ? (
        <div className="p-8 bg-surface rounded-2xl border border-softBorder text-center space-y-3">
          <AlertCircle className="w-10 h-10 text-brandRed mx-auto" />
          <h3 className="text-base font-bold text-charcoal">Failed to Load Reports</h3>
          <p className="text-xs text-muted max-w-md mx-auto">{error}</p>
          <Button size="sm" variant="primary" onClick={fetchReports}>
            Retry
          </Button>
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="py-16 text-center bg-surface border border-softBorder rounded-3xl p-8 space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-orange-100 text-primary mx-auto flex items-center justify-center shadow-xs">
            <FileText className="w-8 h-8" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-lg font-bold text-charcoal">
              {searchQuery || selectedCategory !== 'ALL'
                ? 'No matching medical reports found'
                : 'No medical reports uploaded yet'}
            </h3>
            <p className="text-xs text-muted">
              {searchQuery || selectedCategory !== 'ALL'
                ? 'Try adjusting your search terms or selecting a different category filter.'
                : 'Upload your lab reports, prescriptions, or imaging files to keep your health information structured and securely accessible.'}
            </p>
          </div>
          <Button
            variant="primary"
            size="md"
            onClick={() => setIsUploadModalOpen(true)}
            className="shadow-glow font-bold"
            leftIcon={<Upload className="w-4 h-4" />}
          >
            Upload Your First Report
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredReports.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              onDelete={handleDelete}
              onVerify={handleVerify}
              onDownload={handleDownload}
            />
          ))}
        </div>
      )}

      {/* Upload Modal */}
      <UploadReportModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handleUpload}
        isUploading={isUploading}
      />
    </div>
  );
};
