import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { type User } from "@shared/schema";
import { 
  getAuthToken, 
  setAuthToken, 
  removeAuthToken, 
  isTokenExpired,
  clearAuthSession 
} from "@/lib/auth";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refetchUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is authenticated and fetch user data
  const { data: userData, isLoading, refetch } = useQuery({
    queryKey: ['/api/auth/me'],
    queryFn: async () => {
      const token = getAuthToken();
      if (!token || isTokenExpired(token)) {
        throw new Error('No valid token');
      }

      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user');
      }

      const data = await response.json();
      return data.user;
    },
    retry: false,
    enabled: !!getAuthToken() && !isTokenExpired(getAuthToken() || ''),
  });

  // Update authentication state when user data changes
  useEffect(() => {
    if (userData) {
      setUser(userData);
      setIsAuthenticated(true);
    } else {
      setUser(null);
      setIsAuthenticated(false);
    }
  }, [userData]);

  // Check token validity on mount
  useEffect(() => {
    const token = getAuthToken();
    if (token && isTokenExpired(token)) {
      clearAuthSession();
      setUser(null);
      setIsAuthenticated(false);
    }
  }, []);

  const loginMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const response = await apiRequest('POST', '/api/auth/login', { email, password });
      return response.json();
    },
    onSuccess: (data) => {
      setAuthToken(data.token);
      setUser(data.user);
      setIsAuthenticated(true);
      // Invalidate and refetch user query
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
    },
    onError: (error) => {
      clearAuthSession();
      throw error;
    },
  });

  const login = async (email: string, password: string): Promise<void> => {
    await loginMutation.mutateAsync({ email, password });
  };

  const logout = (): void => {
    clearAuthSession();
    setUser(null);
    setIsAuthenticated(false);
    // Clear all queries from cache
    queryClient.clear();
  };

  const refetchUser = (): void => {
    refetch();
  };

  const contextValue: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    setUser,
    login,
    logout,
    refetchUser,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Hook for role-based access control
export function useRequireAuth(requiredRoles?: string[]) {
  const { user, isAuthenticated, isLoading } = useAuth();

  const hasAccess = !requiredRoles || (user && requiredRoles.includes(user.role));
  
  return {
    user,
    isAuthenticated,
    isLoading,
    hasAccess,
  };
}

// Hook for checking specific permissions
export function usePermissions() {
  const { user } = useAuth();

  return {
    canCreateJobs: user?.role === 'company' || user?.role === 'agency',
    canViewCandidates: user?.role === 'company' || user?.role === 'agency',
    canManageCandidatePool: user?.role === 'agency',
    canApplyToJobs: user?.role === 'candidate',
    isCandidate: user?.role === 'candidate',
    isCompany: user?.role === 'company',
    isAgency: user?.role === 'agency',
    isRecruiter: user?.role === 'company' || user?.role === 'agency',
  };
}
