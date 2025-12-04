import { useMutation } from "@apollo/client";
import { CREATE_NOTIFICATION } from "@gql/mutations/notifications";
import {
  NotificationType,
  CreateNotificationInput,
} from "types/notifications";
import { Discussion, DiscussionPost } from "types/discussions";

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
    const usersToNotify = new Set<string>();

    if (discussion.createdBy.id !== post.userId) {
      usersToNotify.add(discussion.createdBy.id);
    }

    discussion.followers.forEach((follower) => {
      if (follower.id !== post.userId) {
        usersToNotify.add(follower.id);
      }
    });

    const notificationPromises = Array.from(usersToNotify).map((userId) => {
      const isOwner = userId === discussion.createdBy.id;

      const notificationInput: CreateNotificationInput = {
        type: isOwner
          ? NotificationType.DISCUSSION_OWNER_REPLY
          : NotificationType.DISCUSSION_REPLY,
        title: isOwner
          ? `${post.username} replied to your discussion`
          : `${post.username} replied to a discussion you're following`,
        message:
          post.content.length > 100
            ? `${post.content.substring(0, 100)}...`
            : post.content,
        recipientId: userId,
        senderId: post.userId,
        discussionId: discussion.id,
        postId: post.timestamp,
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
        title: `${post.username} mentioned you in a discussion`,
        message:
          post.content.length > 100
            ? `${post.content.substring(0, 100)}...`
            : post.content,
        recipientId: userId,
        senderId: post.userId,
        discussionId: discussion.id,
        postId: post.timestamp,
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
