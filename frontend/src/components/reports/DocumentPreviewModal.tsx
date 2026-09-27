import React, { useState, useEffect } from 'react';
import { reportApi } from '../../api/reportApi';
import { Button } from '../ui/Button';
import { Spinner } from '../ui/Spinner';
import { X, Download, FileText, AlertCircle } from 'lucide-react';

interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportId: string;
  filename: string;
  fileType: string;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  isOpen,
  onClose,
  reportId,
  filename,
  fileType,
}) => {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [contentType, setContentType] = useState<string>('application/pdf');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let activeUrl: string | null = null;

    if (isOpen && reportId) {
      setIsLoading(true);
      setError(null);

      reportApi
        .getFileBlobUrl(reportId)
        .then((res) => {
          activeUrl = res.url;
          setBlobUrl(res.url);
          setContentType(res.contentType || fileType);
        })
        .catch((err) => {
          setError(err?.response?.data?.message || 'Could not load document preview securely.');
        })
        .finally(() => {
          setIsLoading(false);
        });
    }

    return () => {
      if (activeUrl) {
        window.URL.revokeObjectURL(activeUrl);
      }
    };
  }, [isOpen, reportId, fileType]);

  if (!isOpen) return null;

  const handleDownload = () => {
    reportApi.downloadReportFile(reportId, filename);
  };

  const isPdf = contentType.includes('pdf') || filename.toLowerCase().endsWith('.pdf');
  const isImage = contentType.includes('image') || /\.(png|jpg|jpeg)$/i.test(filename);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-charcoal-900/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-surface rounded-2xl border border-softBorder shadow-elevated w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-softBorder flex items-center justify-between bg-surface shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-orange-100 text-primary flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-charcoal truncate" title={filename}>
                {filename}
              </h2>
              <p className="text-xs text-muted">Secure Encrypted Preview</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="text-xs py-1.5 px-3 border-orange-200 text-charcoal hover:bg-orange-50 font-bold"
              leftIcon={<Download className="w-4 h-4 text-primary" />}
            >
              Download
            </Button>
            <button
              onClick={onClose}
              className="text-muted hover:text-charcoal p-1.5 rounded-lg hover:bg-orange-50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-stone-100/70 relative overflow-hidden flex items-center justify-center p-4">
          {isLoading && (
            <div className="text-center space-y-3">
              <Spinner size="lg" className="text-primary mx-auto" />
              <p className="text-xs font-semibold text-charcoal">Decrypting and streaming document...</p>
            </div>
          )}

          {error && (
            <div className="max-w-md p-6 bg-surface rounded-2xl border border-softBorder text-center space-y-3 shadow-card">
              <div className="w-12 h-12 rounded-2xl bg-red-100 text-brandRed mx-auto flex items-center justify-center">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-charcoal">Unable to Preview Document</h3>
              <p className="text-xs text-muted">{error}</p>
              <Button size="sm" variant="primary" onClick={handleDownload} leftIcon={<Download className="w-4 h-4" />}>
                Download File Directly
              </Button>
            </div>
          )}

          {!isLoading && !error && blobUrl && (
            <>
              {isPdf ? (
                <iframe
                  src={`${blobUrl}#toolbar=1&navpanes=0`}
                  title={filename}
                  className="w-full h-full rounded-xl border border-softBorder bg-surface shadow-sm"
                />
              ) : isImage ? (
                <div className="w-full h-full flex items-center justify-center overflow-auto p-4">
                  <img
                    src={blobUrl}
                    alt={filename}
                    className="max-h-full max-w-full object-contain rounded-xl shadow-card"
                  />
                </div>
              ) : (
                <div className="text-center space-y-3 p-6 bg-surface rounded-2xl border border-softBorder">
                  <FileText className="w-12 h-12 text-primary mx-auto" />
                  <p className="text-sm font-bold text-charcoal">Preview not supported for this file format</p>
                  <Button size="sm" variant="primary" onClick={handleDownload} leftIcon={<Download className="w-4 h-4" />}>
                    Download File
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
