const Notification = require("../../models/Notification");
const User = require("../../models/User");
const Discussion = require("../../models/Discussion");
const DiscussionPost = require("../../models/DiscussionPost");

const notificationResolvers = {
  Query: {
    getNotifications: async (_, { userId, page = 1, limit = 20 }, { user }) => {
      try {
        // Ensure user is authenticated
        if (!user) {
          throw new Error("Not authenticated");
        }

        const authenticatedUserId = user.id;
        const skip = (page - 1) * limit;

        // Get notifications with pagination using authenticated user ID
        const notifications = await Notification.find({
          recipientId: authenticatedUserId,
        })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit);

        // Get total count
        const totalCount = await Notification.countDocuments({
          recipientId: authenticatedUserId,
        });

        // Get unread count
        const unreadCount = await Notification.countDocuments({
          recipientId: authenticatedUserId,
          isRead: false,
        });

        const hasNextPage = skip + notifications.length < totalCount;
        const hasPreviousPage = page > 1;

        return {
          notifications,
          totalCount,
          hasNextPage,
          hasPreviousPage,
          unreadCount,
        };
      } catch (error) {
        throw new Error(`Failed to fetch notifications: ${error.message}`);
      }
    },

    getUnreadNotificationsCount: async (_, { userId }, { user }) => {
      try {
        // Ensure user is authenticated
        if (!user) {
          throw new Error("Not authenticated");
        }

        const authenticatedUserId = user.id;

        const count = await Notification.countDocuments({
          recipientId: authenticatedUserId,
          isRead: false,
        });

        return count;
      } catch (error) {
        throw new Error(`Failed to fetch unread count: ${error.message}`);
      }
    },

    getNotificationById: async (_, { id }, { user }) => {
      try {
        // Ensure user is authenticated
        if (!user) {
          throw new Error("Not authenticated");
        }

        const notification = await Notification.findById(id);

        if (!notification) {
          throw new Error("Notification not found");
        }

        // Ensure user can only access their own notifications
        if (user.id.toString() !== notification.recipientId.toString()) {
          throw new Error("Unauthorized access to notification");
        }

        return notification;
      } catch (error) {
        throw new Error(`Failed to fetch notification: ${error.message}`);
      }
    },
  },

  Mutation: {
    markNotificationRead: async (_, { input }, { user }) => {
      try {
        // Ensure user is authenticated
        if (!user) {
          throw new Error("Not authenticated");
        }

        const { notificationId } = input;

        const notification = await Notification.findById(notificationId);

        if (!notification) {
          throw new Error("Notification not found");
        }

        // Ensure user can only mark their own notifications as read
        if (user.id.toString() !== notification.recipientId.toString()) {
          throw new Error("Unauthorized access to notification");
        }

        notification.isRead = true;
        await notification.save();

        return notification;
      } catch (error) {
        throw new Error(
          `Failed to mark notification as read: ${error.message}`
        );
      }
    },

    markAllNotificationsRead: async (_, { input }, { user }) => {
      try {
        // Ensure user is authenticated
        if (!user) {
          throw new Error("Not authenticated");
        }

        const authenticatedUserId = user.id;

        const result = await Notification.updateMany(
          { recipientId: authenticatedUserId, isRead: false },
          { isRead: true }
        );

        return {
          success: true,
          updatedCount: result.modifiedCount,
        };
      } catch (error) {
        throw new Error(
          `Failed to mark all notifications as read: ${error.message}`
        );
      }
    },

    deleteNotification: async (_, { input }, { user }) => {
      try {
        // Ensure user is authenticated
        if (!user) {
          throw new Error("Not authenticated");
        }

        const { notificationId } = input;

        const notification = await Notification.findById(notificationId);

        if (!notification) {
          throw new Error("Notification not found");
        }

        // Ensure user can only delete their own notifications
        if (user.id.toString() !== notification.recipientId.toString()) {
          throw new Error("Unauthorized access to notification");
        }

        await Notification.findByIdAndDelete(notificationId);

        return {
          success: true,
          deletedId: notificationId,
        };
      } catch (error) {
        throw new Error(`Failed to delete notification: ${error.message}`);
      }
    },

    createNotification: async (_, { input }, { user }) => {
      try {
        // This mutation is for internal use, so we'll allow it without strict user checks
        // but we should validate the input data
        const {
          type,
          title,
          message,
          recipientId,
          senderId,
          discussionId,
          postId,
          linkedItem,
        } = input;

        // Validate that recipient exists
        const recipient = await User.findById(recipientId);
        if (!recipient) {
          throw new Error("Recipient not found");
        }

        // Validate that sender exists if provided
        if (senderId) {
          const sender = await User.findById(senderId);
          if (!sender) {
            throw new Error("Sender not found");
          }
        }

        // Validate that discussion exists if provided
        if (discussionId) {
          const discussion = await Discussion.findById(discussionId);
          if (!discussion) {
            throw new Error("Discussion not found");
          }
        }

        // Validate that post exists if provided
        if (postId) {
          const post = await DiscussionPost.findById(postId);
          if (!post) {
            throw new Error("Post not found");
          }
        }

        // Don't create notification if sender is the same as recipient
        if (
          input.senderId &&
          input.senderId.toString() === input.recipientId.toString()
        ) {
          throw new Error("Cannot create notification for self");
        }

        const notification = new Notification({
          type,
          title,
          message,
          recipientId,
          senderId,
          discussionId,
          postId,
          linkedItem,
        });

        await notification.save();

        return notification;
      } catch (error) {
        throw new Error(`Failed to create notification: ${error.message}`);
      }
    },
  },

  Notification: {
    sender: async (parent) => {
      if (!parent.senderId) return null;
      return await User.findById(parent.senderId).select("id username avatar");
    },

    discussion: async (parent) => {
      if (!parent.discussionId) return null;
      return await Discussion.findById(parent.discussionId).select("id title");
    },

    post: async (parent) => {
      if (!parent.postId) return null;
      return await DiscussionPost.findById(parent.postId).select("id content");
    },
  },
};

module.exports = notificationResolvers;
