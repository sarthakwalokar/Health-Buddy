import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authApi } from '../../api/authApi';
import { storageService } from '../../services/storageService';
import {
  AuthResponse,
  DoctorRegisterPayload,
  LoginPayload,
  PatientRegisterPayload,
  RoleType,
  User,
} from '../../types';

interface AuthContextType {
  user: User | null;
  role: RoleType | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<AuthResponse>;
  registerPatient: (payload: PatientRegisterPayload) => Promise<AuthResponse>;
  registerDoctor: (payload: DoctorRegisterPayload) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => storageService.getUser<User>());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const getPrimaryRole = useCallback((userObj: User | null): RoleType | null => {
    if (!userObj || !userObj.roles || userObj.roles.length === 0) return null;
    const roleStr = userObj.roles[0].replace('ROLE_', '').toUpperCase();
    if (roleStr === 'PATIENT' || roleStr === 'DOCTOR' || roleStr === 'ADMIN') {
      return roleStr as RoleType;
    }
    return null;
  }, []);

  const [role, setRole] = useState<RoleType | null>(() => getPrimaryRole(storageService.getUser<User>()));

  const refreshUser = useCallback(async () => {
    try {
      const token = storageService.getAccessToken();
      if (!token) {
        setUser(null);
        setRole(null);
        setIsLoading(false);
        return;
      }

      const response = await authApi.getCurrentUser();
      const userData = response.data;
      setUser(userData);
      storageService.setUser(userData);
      setRole(getPrimaryRole(userData));
    } catch (err) {
      storageService.clearAuth();
      setUser(null);
      setRole(null);
    } finally {
      setIsLoading(false);
    }
  }, [getPrimaryRole]);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const handleAuthSuccess = (authData: AuthResponse) => {
    storageService.setAccessToken(authData.accessToken);
    storageService.setRefreshToken(authData.refreshToken);

    const partialUser: User = {
      id: authData.userId,
      email: authData.email,
      fullName: authData.fullName,
      roles: [`ROLE_${authData.role}`],
      enabled: true,
      createdAt: new Date().toISOString(),
      verificationStatus: authData.verificationStatus,
    };

    setUser(partialUser);
    storageService.setUser(partialUser);
    setRole(authData.role);
  };

  const login = async (payload: LoginPayload): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      const response = await authApi.login(payload);
      const authData = response.data;
      handleAuthSuccess(authData);
      return authData;
    } finally {
      setIsLoading(false);
    }
  };

  const registerPatient = async (payload: PatientRegisterPayload): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      const response = await authApi.registerPatient(payload);
      const authData = response.data;
      handleAuthSuccess(authData);
      return authData;
    } finally {
      setIsLoading(false);
    }
  };

  const registerDoctor = async (payload: DoctorRegisterPayload): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      const response = await authApi.registerDoctor(payload);
      const authData = response.data;
      handleAuthSuccess(authData);
      return authData;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      const refreshToken = storageService.getRefreshToken();
      await authApi.logout(refreshToken);
    } catch (ignored) {
    } finally {
      storageService.clearAuth();
      setUser(null);
      setRole(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated: !!user && !!storageService.getAccessToken(),
        isLoading,
        login,
        registerPatient,
        registerDoctor,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
