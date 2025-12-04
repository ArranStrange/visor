import { useAuth } from "../../../context/AuthContext";
import NotificationBell from "../../../components/layout/NotificationBell";

export function AuthenticatedNotificationBell() {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return null;
  return <NotificationBell />;
}
