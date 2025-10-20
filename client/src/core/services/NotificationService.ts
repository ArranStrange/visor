import { INotificationService } from "../interfaces";
import { ApolloClient } from "@apollo/client";
import {
  GET_UNREAD_NOTIFICATIONS_COUNT,
  GET_NOTIFICATIONS,
} from "../../graphql/queries/notifications";
import {
  MARK_NOTIFICATION_READ,
  MARK_ALL_NOTIFICATIONS_READ,
} from "../../graphql/mutations/notifications";

export class GraphQLNotificationService implements INotificationService {
  constructor(private apolloClient: ApolloClient<any>) {}

  async getUnreadCount(): Promise<number> {
    const result = await this.apolloClient.query({
      query: GET_UNREAD_NOTIFICATIONS_COUNT,
      fetchPolicy: "network-only",
    });
    return result.data.getUnreadNotificationsCount || 0;
  }

  async getNotifications(page: number, limit: number): Promise<any[]> {
    const result = await this.apolloClient.query({
      query: GET_NOTIFICATIONS,
      variables: { page, limit },
      fetchPolicy: "network-only",
    });
    return result.data.getNotifications?.notifications || [];
  }

  async markAsRead(notificationId: string): Promise<void> {
    await this.apolloClient.mutate({
      mutation: MARK_NOTIFICATION_READ,
      variables: { input: { notificationId } },
    });
  }

  async markAllAsRead(): Promise<void> {
    await this.apolloClient.mutate({
      mutation: MARK_ALL_NOTIFICATIONS_READ,
      variables: { input: { userId: this.getCurrentUserId() } },
    });
  }

  private getCurrentUserId(): string {
    // This should be injected or retrieved from auth service
    const userData = localStorage.getItem("user");
    if (userData) {
      const user = JSON.parse(userData);
      return user.id;
    }
    throw new Error("User not authenticated");
  }
}
