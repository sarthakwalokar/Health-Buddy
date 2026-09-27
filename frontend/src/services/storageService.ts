/**
 * Storage Service for Health Buddy
 * 
 * Security Tradeoff Note:
 * In Single Page Applications without a SameSite=Strict HTTP-only BFF (Backend-for-Frontend) cookie gateway,
 * storing refresh tokens in localStorage allows persistent authenticated sessions across page reloads.
 * To mitigate token exposure risks:
 * 1. Access tokens are kept short-lived (15 min).
 * 2. Only minimal identity claims (userId, role) exist in tokens — no medical/clinical records or credentials.
 * 3. All tokens are immediately cleared on logout or unauthorized response (401).
 * 4. Token rotation is enforced on password changes.
 */

const ACCESS_TOKEN_KEY = 'hb_access_token';
const REFRESH_TOKEN_KEY = 'hb_refresh_token';
const USER_KEY = 'hb_user_profile';

export const storageService = {
  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  setAccessToken(token: string): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  },

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  setRefreshToken(token: string): void {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  },

  getUser<T = unknown>(): T | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },

  setUser(user: unknown): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  clearAuth(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};
