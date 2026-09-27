import React, { useEffect, useState } from 'react';
import { adminApi } from '../../api/adminApi';
import { User } from '../../types';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { LoadingState } from '../../components/feedback/LoadingState';
import { Power } from 'lucide-react';

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await adminApi.getAllUsers();
      setUsers(res.data);
    } catch {
      setMessage({ type: 'danger', text: 'Failed to load user registry.' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (userId: string, currentEnabled: boolean) => {
    setActionLoading(userId);
    setMessage(null);
    try {
      await adminApi.toggleUserStatus(userId, !currentEnabled);
      setMessage({
        type: 'success',
        text: `User account has been ${!currentEnabled ? 'enabled' : 'disabled'}.`,
      });
      await fetchUsers();
    } catch {
      setMessage({ type: 'danger', text: 'Failed to change user account status.' });
    } finally {
      setActionLoading(null);
    }
  };

  if (isLoading) {
    return <LoadingState message="Loading System User Registry..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-charcoal">Platform User Management</h1>
          <p className="text-xs text-muted">
            All registered Patients, Doctors, and Administrators in the Health Buddy registry
          </p>
        </div>
        <Badge variant="primary">{users.length} Registered Accounts</Badge>
      </div>

      {message && (
        <Alert variant={message.type} onClose={() => setMessage(null)}>
          {message.text}
        </Alert>
      )}

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-background border-b border-softBorder text-xs text-muted uppercase">
              <tr>
                <th className="px-6 py-3.5">User Identity</th>
                <th className="px-6 py-3.5">Assigned Roles</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Registered</th>
                <th className="px-6 py-3.5 text-right">Account Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-softBorder">
              {users.map((u) => {
                const primaryRole = u.roles[0]?.replace('ROLE_', '') || 'PATIENT';
                const isDoc = primaryRole === 'DOCTOR';

                return (
                  <tr key={u.id} className="hover:bg-charcoal-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-charcoal">{u.fullName}</div>
                      <div className="text-xs text-muted">{u.email}</div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Badge
                          variant={
                            primaryRole === 'ADMIN'
                              ? 'danger'
                              : primaryRole === 'DOCTOR'
                              ? 'warning'
                              : 'primary'
                          }
                          size="sm"
                        >
                          {primaryRole}
                        </Badge>
                        {isDoc && u.verificationStatus && (
                          <Badge
                            variant={u.verificationStatus === 'VERIFIED' ? 'success' : 'warning'}
                            size="sm"
                          >
                            {u.verificationStatus}
                          </Badge>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                          u.enabled ? 'text-primary-dark' : 'text-danger'
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            u.enabled ? 'bg-primary' : 'bg-danger'
                          }`}
                        />
                        {u.enabled ? 'Active' : 'Disabled'}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-xs text-muted">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>

                    <td className="px-6 py-4 text-right">
                      {primaryRole !== 'ADMIN' && (
                        <Button
                          variant={u.enabled ? 'outline' : 'secondary'}
                          size="sm"
                          isLoading={actionLoading === u.id}
                          onClick={() => handleToggleStatus(u.id, u.enabled)}
                          leftIcon={<Power className="w-3.5 h-3.5" />}
                        >
                          {u.enabled ? 'Disable' : 'Enable'}
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
