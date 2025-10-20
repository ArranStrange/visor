import { INavigationService } from "../interfaces";

export class ReactRouterNavigationService implements INavigationService {
  constructor(private navigate: (path: string) => void) {}

  navigate(path: string): void {
    this.navigate(path);
  }

  goBack(): void {
    window.history.back();
  }

  replace(path: string): void {
    window.location.replace(path);
  }
}
