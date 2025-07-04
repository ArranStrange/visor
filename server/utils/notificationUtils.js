const Notification = require("../models/Notification");
const Discussion = require("../models/Discussion");
const User = require("../models/User");

// Helper function to create notifications for discussion replies
const createDiscussionNotifications = async (post, discussion, senderId) => {
  try {
    const notifications = [];

    // Don't create notifications for the user's own actions
    if (senderId === discussion.createdBy.toString()) {
      return notifications;
    }

    // 1. Notify discussion owner (if different from sender)
    if (senderId !== discussion.createdBy.toString()) {
      const ownerNotification = new Notification({
        type: "DISCUSSION_OWNER_REPLY",
        title: "New reply to your discussion",
        message: `Someone replied to your discussion "${discussion.title}"`,
        recipientId: discussion.createdBy,
        senderId: senderId,
        discussionId: discussion._id,
        postId: post._id,
        linkedItem: {
          type: "discussion",
          id: discussion._id,
          title: discussion.title,
        },
      });
      notifications.push(ownerNotification);
    }

    // 2. Notify discussion followers (excluding sender and owner)
    const followersToNotify = discussion.followers.filter(
      (followerId) =>
        followerId.toString() !== senderId &&
        followerId.toString() !== discussion.createdBy.toString()
    );

    for (const followerId of followersToNotify) {
      const followerNotification = new Notification({
        type: "DISCUSSION_REPLY",
        title: "New activity in followed discussion",
        message: `New reply in discussion "${discussion.title}"`,
        recipientId: followerId,
        senderId: senderId,
        discussionId: discussion._id,
        postId: post._id,
        linkedItem: {
          type: "discussion",
          id: discussion._id,
          title: discussion.title,
        },
      });
      notifications.push(followerNotification);
    }

    // Save all notifications
    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    return notifications;
  } catch (error) {
    console.error("Error creating discussion notifications:", error);
    throw error;
  }
};

// Helper function to create notifications for mentions
const createMentionNotifications = async (post, senderId) => {
  try {
    const notifications = [];

    // Process mentions in the post
    if (post.mentions && post.mentions.length > 0) {
      for (const mention of post.mentions) {
        if (mention.type === "user" && mention.refId.toString() !== senderId) {
          const mentionNotification = new Notification({
            type: "MENTION",
            title: "You were mentioned",
            message: `You were mentioned in a post`,
            recipientId: mention.refId,
            senderId: senderId,
            discussionId: post.discussionId,
            postId: post._id,
            linkedItem: {
              type: "post",
              id: post._id,
              title: "Post with mention",
            },
          });
          notifications.push(mentionNotification);
        }
      }
    }

    // Save all mention notifications
    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    return notifications;
  } catch (error) {
    console.error("Error creating mention notifications:", error);
    throw error;
  }
};

// Main function to create notifications for a new post
const createPostNotifications = async (post, discussion, senderId) => {
  try {
    // Create discussion notifications (replies to owner and followers)
    const discussionNotifications = await createDiscussionNotifications(
      post,
      discussion,
      senderId
    );

    // Create mention notifications
    const mentionNotifications = await createMentionNotifications(
      post,
      senderId
    );

    return {
      discussionNotifications,
      mentionNotifications,
      total: discussionNotifications.length + mentionNotifications.length,
    };
  } catch (error) {
    console.error("Error creating post notifications:", error);
    throw error;
  }
};

// Helper function to create follow notifications
const createFollowNotification = async (followerId, followedId) => {
  try {
    const follower = await User.findById(followerId);
    const followed = await User.findById(followedId);

    if (!follower || !followed) {
      throw new Error("User not found");
    }

    const notification = new Notification({
      type: "FOLLOW",
      title: "New follower",
      message: `${follower.username} started following you`,
      recipientId: followedId,
      senderId: followerId,
      linkedItem: {
        type: "user",
        id: followerId,
        title: follower.username,
      },
    });

    await notification.save();
    return notification;
  } catch (error) {
    console.error("Error creating follow notification:", error);
    throw error;
  }
};

// Helper function to create like notifications
const createLikeNotification = async (likerId, postId, discussionId) => {
  try {
    const liker = await User.findById(likerId);
    const post = await DiscussionPost.findById(postId);
    const discussion = await Discussion.findById(discussionId);

    if (!liker || !post || !discussion) {
      throw new Error("Required data not found");
    }

    // Don't create notification if user likes their own post
    if (likerId === post.author.toString()) {
      return null;
    }

    const notification = new Notification({
      type: "LIKE",
      title: "New like",
      message: `${liker.username} liked your post`,
      recipientId: post.author,
      senderId: likerId,
      discussionId: discussionId,
      postId: postId,
      linkedItem: {
        type: "post",
        id: postId,
        title: "Liked post",
      },
    });

    await notification.save();
    return notification;
  } catch (error) {
    console.error("Error creating like notification:", error);
    throw error;
  }
};

module.exports = {
  createPostNotifications,
  createFollowNotification,
  createLikeNotification,
  createDiscussionNotifications,
  createMentionNotifications,
};
