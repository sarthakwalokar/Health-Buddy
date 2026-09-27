import React, { useState, useRef } from 'react';
import { ReportType } from '../../types/report';
import { Button } from '../ui/Button';
import { X, Upload, AlertCircle, CheckCircle2 } from 'lucide-react';

interface UploadReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File, reportType: ReportType, notes?: string) => Promise<void>;
  isUploading: boolean;
}

export const UploadReportModal: React.FC<UploadReportModalProps> = ({
  isOpen,
  onClose,
  onUpload,
  isUploading,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [reportType, setReportType] = useState<ReportType>('LAB_REPORT');
  const [notes, setNotes] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const validateAndSetFile = (file: File) => {
    setErrorMessage(null);
    const validExtensions = ['pdf', 'png', 'jpg', 'jpeg'];
    const extension = file.name.split('.').pop()?.toLowerCase() || '';

    if (!validExtensions.includes(extension)) {
      setErrorMessage('Invalid file format. Please upload a PDF, PNG, JPG, or JPEG file.');
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setErrorMessage('File size exceeds the 20MB limit.');
      return;
    }

    setSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMessage('Please select a file to upload.');
      return;
    }
    try {
      await onUpload(selectedFile, reportType, notes);
      handleClose();
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.message || 'Failed to upload report. Please try again.');
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setNotes('');
    setReportType('LAB_REPORT');
    setErrorMessage(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-surface rounded-2xl border border-softBorder shadow-elevated w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-softBorder flex items-center justify-between bg-gradient-to-r from-orange-50/50 to-pink-50/30">
          <div>
            <h2 className="text-lg font-bold text-charcoal flex items-center gap-2">
              <Upload className="w-5 h-5 text-primary" />
              Upload Medical Report
            </h2>
            <p className="text-xs text-muted mt-0.5">Securely store documents and extract structured health metrics</p>
          </div>
          <button
            onClick={handleClose}
            disabled={isUploading}
            className="text-muted hover:text-charcoal p-1.5 rounded-lg hover:bg-surface transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-brandRed/20 rounded-xl text-xs text-brandRed flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* File Dropzone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
              dragActive
                ? 'border-primary bg-orange-50/60 scale-[1.01]'
                : selectedFile
                ? 'border-emerald-300 bg-emerald-50/30'
                : 'border-orange-200 hover:border-primary/60 hover:bg-orange-50/30 bg-surface'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={handleFileChange}
              className="hidden"
            />

            {selectedFile ? (
              <div className="flex items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="text-left overflow-hidden">
                  <p className="text-sm font-bold text-charcoal truncate max-w-xs">{selectedFile.name}</p>
                  <p className="text-xs text-muted">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Click to change file
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-orange-100 text-primary mx-auto flex items-center justify-center shadow-xs">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-charcoal">
                    Click to browse or drag and drop document
                  </p>
                  <p className="text-xs text-muted mt-1">
                    Supports PDF, PNG, JPG, JPEG (up to 20MB)
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Report Category */}
          <div>
            <label className="block text-xs font-bold text-charcoal mb-1.5 uppercase tracking-wide">
              Document Category
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as ReportType)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-softBorder text-sm bg-surface text-charcoal focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
            >
              <option value="LAB_REPORT">Lab Report (Blood, Urine, Panel)</option>
              <option value="PRESCRIPTION">Prescription / Medication Order</option>
              <option value="IMAGING_REPORT">Imaging / Radiology (X-Ray, MRI, CT)</option>
              <option value="DISCHARGE_SUMMARY">Discharge Summary</option>
              <option value="PATHOLOGY_REPORT">Pathology / Biopsy Report</option>
              <option value="OTHER">Other Medical Document</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-charcoal mb-1.5 uppercase tracking-wide">
              Optional Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Annual health checkup with Dr. Sharma"
              rows={2}
              className="w-full px-3.5 py-2 rounded-xl border border-softBorder text-sm bg-surface text-charcoal focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all resize-none"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClose}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isUploading}
              disabled={!selectedFile || isUploading}
              leftIcon={<Upload className="w-4 h-4" />}
            >
              Upload & Process
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
