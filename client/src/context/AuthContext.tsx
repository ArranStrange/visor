import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import { useApolloClient } from "@apollo/client";

const TOKEN_KEY = "visor_token";
const USER_KEY = "user";

interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  isAdmin?: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const clearStoredAuth = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

const readStoredUser = (): User | null => {
  const userData = localStorage.getItem(USER_KEY);
  const token = localStorage.getItem(TOKEN_KEY);

  if (!userData || !token) {
    clearStoredAuth();
    return null;
  }

  try {
    return JSON.parse(userData);
  } catch (error) {
    console.error("Error parsing stored user:", error);
    clearStoredAuth();
    return null;
  }
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(readStoredUser);
  const navigate = useNavigate();
  const apolloClient = useApolloClient();

  const login = useCallback(
    function login(token: string, userData: User) {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(userData));
      setUser(userData);
      // Drop any data cached for the previous (or anonymous) session and
      // refetch active queries with the new credentials.
      apolloClient.resetStore().catch(() => {});
    },
    [apolloClient]
  );

  const logout = useCallback(
    function logout() {
      clearStoredAuth();
      setUser(null);
      // Wipe cached data so the next user can't see this session's queries.
      apolloClient.clearStore().catch(() => {});
      navigate("/login");
    },
    [apolloClient, navigate]
  );

  const updateUser = useCallback(function updateUser(updates: Partial<User>) {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      localStorage.setItem(USER_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      isAuthenticated: !!user,
      login,
      logout,
      updateUser,
    }),
    [user, login, logout, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
