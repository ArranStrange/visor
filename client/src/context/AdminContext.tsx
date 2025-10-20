import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";

interface AdminContextType {
  isAdmin: boolean;
  loading: boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
};

interface AdminProviderProps {
  children: React.ReactNode;
}

export const AdminProvider: React.FC<AdminProviderProps> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      console.log("AdminContext - User:", user);
      console.log("AdminContext - User isAdmin:", user?.isAdmin);
      const adminStatus = user?.isAdmin || false;
      console.log("AdminContext - Setting isAdmin to:", adminStatus);
      setIsAdmin(adminStatus);
      setLoading(false);
    }
  }, [user, authLoading]);

  const value = {
    isAdmin,
    loading,
  };

  return (
    <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
  );
};
