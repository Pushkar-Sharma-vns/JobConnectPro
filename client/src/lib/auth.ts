import { type User } from "@shared/schema";

// Token management
export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
};

export const setAuthToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('token', token);
};

export const removeAuthToken = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('token');
};

// Token validation
export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch {
    return true;
  }
};

// Auth headers
export const getAuthHeaders = (): Record<string, string> => {
  const token = getAuthToken();
  if (!token || isTokenExpired(token)) {
    return {};
  }
  
  return {
    'Authorization': `Bearer ${token}`,
  };
};

// User data extraction from token
export const getUserFromToken = (token: string): { userId: number } | null => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return { userId: payload.userId };
  } catch {
    return null;
  }
};

// Role-based access control
export const hasRole = (user: User | null, roles: string[]): boolean => {
  if (!user) return false;
  return roles.includes(user.role);
};

export const isCandidate = (user: User | null): boolean => {
  return hasRole(user, ['candidate']);
};

export const isCompany = (user: User | null): boolean => {
  return hasRole(user, ['company']);
};

export const isAgency = (user: User | null): boolean => {
  return hasRole(user, ['agency']);
};

export const isRecruiter = (user: User | null): boolean => {
  return hasRole(user, ['company', 'agency']);
};

// Auth status check
export const isAuthenticated = (): boolean => {
  const token = getAuthToken();
  return !!(token && !isTokenExpired(token));
};

// Session management
export const clearAuthSession = (): void => {
  removeAuthToken();
};

// Role display utilities
export const getRoleDisplayName = (role: string): string => {
  const roleMap: Record<string, string> = {
    candidate: 'Job Seeker',
    company: 'Company',
    agency: 'Agency/College',
  };
  return roleMap[role] || role;
};

export const getDashboardPath = (role: string): string => {
  const pathMap: Record<string, string> = {
    candidate: '/candidate-dashboard',
    company: '/company-dashboard',
    agency: '/agency-dashboard',
  };
  return pathMap[role] || '/';
};

// Validation helpers
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  
  if (password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Permission helpers
export const canCreateJobs = (user: User | null): boolean => {
  return hasRole(user, ['company', 'agency']);
};

export const canViewCandidates = (user: User | null): boolean => {
  return hasRole(user, ['company', 'agency']);
};

export const canManageCandidatePool = (user: User | null): boolean => {
  return hasRole(user, ['agency']);
};

export const canApplyToJobs = (user: User | null): boolean => {
  return hasRole(user, ['candidate']);
};

// Redirect helpers
export const getRedirectPath = (user: User | null): string => {
  if (!user) return '/';
  return getDashboardPath(user.role);
};
