import { useAuth } from "../context/AuthContext";

export const useIsAdmin = (): boolean => {
  const { user } = useAuth();
  return user?.isAdmin ?? false;
};
