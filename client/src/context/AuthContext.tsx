import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  updateAuth: (updates: Partial<User>) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for user data in localStorage on mount
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("visor_token");

    if (storedUser && token) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error("Error parsing stored user:", error);
        localStorage.removeItem("user");
        localStorage.removeItem("visor_token");
        setUser(null);
      }
    } else {
      // If either user data or token is missing, clear both
      localStorage.removeItem("user");
      localStorage.removeItem("visor_token");
      setUser(null);
    }
  }, []);

  const logout = () => {
    localStorage.removeItem("visor_token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  const updateAuth = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
  };

  const isAuthenticated = !!user && !!localStorage.getItem("visor_token");

  return (
    <AuthContext.Provider
      value={{ user, setUser, updateAuth, logout, isAuthenticated }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
