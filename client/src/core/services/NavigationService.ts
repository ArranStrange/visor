import { INavigationService } from "../interfaces";

export class ReactRouterNavigationService implements INavigationService {
  private navigateFunction: ((path: string) => void) | null = null;

  setNavigateFunction(navigate: (path: string) => void): void {
    this.navigateFunction = navigate;
  }

  navigate(path: string): void {
    if (this.navigateFunction) {
      this.navigateFunction(path);
    } else {
      // Fallback to window.location for initial navigation
      window.location.href = path;
    }
  }

  goBack(): void {
    window.history.back();
  }

  replace(path: string): void {
    window.location.replace(path);
  }
}
