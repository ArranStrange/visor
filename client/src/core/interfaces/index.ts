// Core interfaces for dependency inversion
export interface IAuthService {
  login(token: string, user: any): void;
  logout(): void;
  getCurrentUser(): any | null;
  isAuthenticated(): boolean;
  updateUser(updates: Partial<any>): void;
}

export interface INotificationService {
  getUnreadCount(): Promise<number>;
  getNotifications(page: number, limit: number): Promise<any[]>;
  markAsRead(notificationId: string): Promise<void>;
  markAllAsRead(): Promise<void>;
}

export interface IDataRepository<T> {
  findAll(filter?: any): Promise<T[]>;
  findById(id: string): Promise<T | null>;
  create(data: Partial<T>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
}

export interface IStorageService {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  clear(): void;
}

export interface INavigationService {
  navigate(path: string): void;
  goBack(): void;
  replace(path: string): void;
}
