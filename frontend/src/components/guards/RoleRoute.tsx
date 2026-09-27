import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { RoleType } from '../../types';
import { LoadingState } from '../feedback/LoadingState';

interface RoleRouteProps {
  allowedRoles: RoleType[];
  children: React.ReactNode;
}

export const RoleRoute: React.FC<RoleRouteProps> = ({ allowedRoles, children }) => {
  const { user, role, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <LoadingState message="Checking access permissions..." />
      </div>
    );
  }

  if (!user || !role) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};
