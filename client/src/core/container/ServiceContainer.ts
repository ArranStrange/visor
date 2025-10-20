import {
  IAuthService,
  INotificationService,
  IStorageService,
  INavigationService,
} from "../interfaces";
import { AuthService } from "../services/AuthService";
import { LocalStorageService } from "../services/StorageService";
import { ReactRouterNavigationService } from "../services/NavigationService";
import { GraphQLNotificationService } from "../services/NotificationService";
import { PresetRepository } from "../repositories/PresetRepository";
import { FilmSimRepository } from "../repositories/FilmSimRepository";
import { ApolloClient } from "@apollo/client";

export class ServiceContainer {
  private static instance: ServiceContainer;
  private services: Map<string, any> = new Map();

  private constructor() {}

  static getInstance(): ServiceContainer {
    if (!ServiceContainer.instance) {
      ServiceContainer.instance = new ServiceContainer();
    }
    return ServiceContainer.instance;
  }

  register<T>(key: string, service: T): void {
    this.services.set(key, service);
  }

  get<T>(key: string): T {
    const service = this.services.get(key);
    if (!service) {
      throw new Error(`Service ${key} not found`);
    }
    return service;
  }

  // Factory methods for common services
  createAuthService(
    storageService: IStorageService,
    navigationService: INavigationService
  ): IAuthService {
    return new AuthService(storageService, navigationService);
  }

  createNotificationService(
    apolloClient: ApolloClient<any>
  ): INotificationService {
    return new GraphQLNotificationService(apolloClient);
  }

  createPresetRepository(apolloClient: ApolloClient<any>): PresetRepository {
    return new PresetRepository(apolloClient);
  }

  createFilmSimRepository(apolloClient: ApolloClient<any>): FilmSimRepository {
    return new FilmSimRepository(apolloClient);
  }

  // Initialize all services
  initialize(
    apolloClient: ApolloClient<any>,
    navigate: (path: string) => void
  ): void {
    const storageService = new LocalStorageService();
    const navigationService = new ReactRouterNavigationService(navigate);

    this.register("storageService", storageService);
    this.register("navigationService", navigationService);
    this.register(
      "authService",
      this.createAuthService(storageService, navigationService)
    );
    this.register(
      "notificationService",
      this.createNotificationService(apolloClient)
    );
    this.register(
      "presetRepository",
      this.createPresetRepository(apolloClient)
    );
    this.register(
      "filmSimRepository",
      this.createFilmSimRepository(apolloClient)
    );
  }
}
