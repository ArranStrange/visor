import { useMutation } from "@apollo/client";
import { CREATE_NOTIFICATION } from "../graphql/mutations/notifications";
import {
  NotificationType,
  CreateNotificationInput,
} from "../types/notifications";
import { Discussion, DiscussionPost } from "../types/discussions";

export const useCreateNotification = () => {
  const [createNotification] = useMutation(CREATE_NOTIFICATION);

  return createNotification;
};

export const createDiscussionReplyNotification = async (
  createNotification: any,
  post: DiscussionPost,
  discussion: Discussion,
  linkedItem?: { type: string; id: string; title: string; slug?: string }
) => {
  try {
    // Get all users who should be notified
    const usersToNotify = new Set<string>();

    // Add discussion owner
    if (discussion.createdBy.id !== post.author.id) {
      usersToNotify.add(discussion.createdBy.id);
    }

    // Add all followers of the discussion
    discussion.followers.forEach((follower) => {
      if (follower.id !== post.author.id) {
        usersToNotify.add(follower.id);
      }
    });

    // Create notifications for each user
    const notificationPromises = Array.from(usersToNotify).map((userId) => {
      const isOwner = userId === discussion.createdBy.id;

      const notificationInput: CreateNotificationInput = {
        type: isOwner
          ? NotificationType.DISCUSSION_OWNER_REPLY
          : NotificationType.DISCUSSION_REPLY,
        title: isOwner
          ? `${post.author.username} replied to your discussion`
          : `${post.author.username} replied to a discussion you're following`,
        message:
          post.content.length > 100
            ? `${post.content.substring(0, 100)}...`
            : post.content,
        recipientId: userId,
        senderId: post.author.id,
        discussionId: discussion.id,
        postId: post.id,
        linkedItem,
      };

      return createNotification({
        variables: { input: notificationInput },
      });
    });

    await Promise.all(notificationPromises);
  } catch (error) {
    console.error("Error creating discussion reply notifications:", error);
  }
};

export const createMentionNotification = async (
  createNotification: any,
  post: DiscussionPost,
  discussion: Discussion,
  mentionedUserIds: string[]
) => {
  try {
    const notificationPromises = mentionedUserIds.map((userId) => {
      const notificationInput: CreateNotificationInput = {
        type: NotificationType.MENTION,
        title: `${post.author.username} mentioned you in a discussion`,
        message:
          post.content.length > 100
            ? `${post.content.substring(0, 100)}...`
            : post.content,
        recipientId: userId,
        senderId: post.author.id,
        discussionId: discussion.id,
        postId: post.id,
      };

      return createNotification({
        variables: { input: notificationInput },
      });
    });

    await Promise.all(notificationPromises);
  } catch (error) {
    console.error("Error creating mention notifications:", error);
  }
};
