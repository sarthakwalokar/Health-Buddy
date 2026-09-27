import React, { useEffect, useState } from 'react';
import { adminApi } from '../../api/adminApi';
import { AuditLog } from '../../types';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { LoadingState } from '../../components/feedback/LoadingState';
import { ShieldAlert, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';

export const AdminAuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLogs = async (pageNum = 0) => {
    setIsLoading(true);
    try {
      const res = await adminApi.getAuditLogs(pageNum, 15);
      setLogs(res.data.content);
      setTotalPages(res.data.totalPages);
      setTotalElements(res.data.totalElements);
      setPage(res.data.number);
    } catch (err) {
      console.error('Failed to load audit logs', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(0);
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <Badge variant="success" size="sm">SUCCESS</Badge>;
      case 'FORBIDDEN':
      case 'UNAUTHORIZED':
      case 'FAILURE':
        return <Badge variant="danger" size="sm">{status}</Badge>;
      case 'CONFLICT':
      case 'BAD_REQUEST':
        return <Badge variant="warning" size="sm">{status}</Badge>;
      default:
        return <Badge variant="neutral" size="sm">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-charcoal">Security & Event Audit Trail</h1>
          <p className="text-xs text-muted">
            Immutable log recording logins, registrations, unauthorized role access attempts, and administrative actions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="primary">{totalElements} Logged Events</Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchLogs(page)}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh
          </Button>
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        {isLoading ? (
          <LoadingState message="Loading security audit records..." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-background border-b border-softBorder text-xs text-muted uppercase">
                <tr>
                  <th className="px-6 py-3.5">Timestamp</th>
                  <th className="px-6 py-3.5">Action</th>
                  <th className="px-6 py-3.5">User Context</th>
                  <th className="px-6 py-3.5">Resource Path</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-softBorder">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-xs text-muted">
                      No security audit events recorded yet.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => {
                    const isAlert = log.status === 'FORBIDDEN' || log.status === 'UNAUTHORIZED';

                    return (
                      <tr
                        key={log.id}
                        className={`transition-colors ${
                          isAlert ? 'bg-danger-light/30 hover:bg-danger-light/50' : 'hover:bg-charcoal-50/50'
                        }`}
                      >
                        <td className="px-6 py-3.5 text-xs text-muted font-mono whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>

                        <td className="px-6 py-3.5 font-mono text-xs font-semibold text-charcoal">
                          <div className="flex items-center gap-1.5">
                            {isAlert && <ShieldAlert className="w-3.5 h-3.5 text-danger flex-shrink-0" />}
                            <span>{log.action}</span>
                          </div>
                        </td>

                        <td className="px-6 py-3.5 text-xs">
                          <div className="font-semibold text-charcoal">{log.userEmail || 'ANONYMOUS'}</div>
                          {log.ipAddress && (
                            <div className="text-[10px] text-muted font-mono">IP: {log.ipAddress}</div>
                          )}
                        </td>

                        <td className="px-6 py-3.5 font-mono text-xs text-muted max-w-xs truncate">
                          {log.resource}
                        </td>

                        <td className="px-6 py-3.5">{getStatusBadge(log.status)}</td>

                        <td className="px-6 py-3.5 text-xs text-charcoal/80 max-w-sm truncate" title={log.details}>
                          {log.details || '—'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        <div className="px-6 py-3.5 bg-background border-t border-softBorder flex items-center justify-between text-xs text-muted">
          <div>
            Page {page + 1} of {Math.max(1, totalPages)}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 0}
              onClick={() => fetchLogs(page - 1)}
              leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages - 1}
              onClick={() => fetchLogs(page + 1)}
              rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
            >
              Next
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
