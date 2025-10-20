import {
  IAuthService,
  IStorageService,
  INavigationService,
} from "../interfaces";

export class AuthService implements IAuthService {
  constructor(
    private storageService: IStorageService,
    private navigationService: INavigationService
  ) {}

  login(token: string, user: any): void {
    this.storageService.setItem("visor_token", token);
    this.storageService.setItem("user", JSON.stringify(user));
  }

  logout(): void {
    this.storageService.removeItem("visor_token");
    this.storageService.removeItem("user");
    this.navigationService.navigate("/login");
  }

  getCurrentUser(): any | null {
    const userData = this.storageService.getItem("user");
    const token = this.storageService.getItem("visor_token");

    if (!userData || !token) {
      this.clearAuth();
      return null;
    }

    try {
      return JSON.parse(userData);
    } catch (error) {
      console.error("Error parsing stored user:", error);
      this.clearAuth();
      return null;
    }
  }

  isAuthenticated(): boolean {
    return (
      !!this.getCurrentUser() && !!this.storageService.getItem("visor_token")
    );
  }

  updateUser(updates: Partial<any>): void {
    const currentUser = this.getCurrentUser();
    if (currentUser) {
      const updatedUser = { ...currentUser, ...updates };
      this.storageService.setItem("user", JSON.stringify(updatedUser));
    }
  }

  private clearAuth(): void {
    this.storageService.removeItem("visor_token");
    this.storageService.removeItem("user");
  }
}
