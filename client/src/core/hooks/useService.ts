import { ServiceContainer } from "../container/ServiceContainer";

export function useService<T>(serviceKey: string): T {
  const container = ServiceContainer.getInstance();
  return container.get<T>(serviceKey);
}

// Specific service hooks for better type safety
export function useAuthService() {
  return useService<import("../interfaces").IAuthService>("authService");
}

export function useNotificationService() {
  return useService<import("../interfaces").INotificationService>(
    "notificationService"
  );
}

export function usePresetRepository() {
  return useService<
    import("../repositories/PresetRepository").PresetRepository
  >("presetRepository");
}

export function useFilmSimRepository() {
  return useService<
    import("../repositories/FilmSimRepository").FilmSimRepository
  >("filmSimRepository");
}
