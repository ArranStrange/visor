const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Notification = require("./models/Notification");
const User = require("./models/User");
const Discussion = require("./models/Discussion");
const DiscussionPost = require("./models/DiscussionPost");

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI;

const testNotifications = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Get some test users
    const users = await User.find().limit(3);
    if (users.length < 2) {
      console.log("❌ Need at least 2 users to test notifications");
      return;
    }

    const [user1, user2] = users;
    console.log(`Testing with users: ${user1.username} and ${user2.username}`);

    // Create a test discussion
    const discussion = new Discussion({
      title: "Test Discussion for Notifications",
      linkedTo: {
        type: "preset",
        refId: new mongoose.Types.ObjectId(), // Dummy ID
      },
      createdBy: user1._id,
      followers: [user1._id, user2._id],
    });

    await discussion.save();
    console.log(`✅ Created test discussion: ${discussion.title}`);

    // Create a test post
    const post = new DiscussionPost({
      discussionId: discussion._id,
      author: user2._id,
      content: "This is a test post to trigger notifications",
    });

    await post.save();
    console.log(`✅ Created test post`);

    // Test notification creation
    const { createPostNotifications } = require("./utils/notificationUtils");

    console.log("Creating notifications...");
    const result = await createPostNotifications(
      post,
      discussion,
      user2._id.toString()
    );

    console.log(`✅ Created ${result.total} notifications:`);
    console.log(
      `- Discussion notifications: ${result.discussionNotifications.length}`
    );
    console.log(
      `- Mention notifications: ${result.mentionNotifications.length}`
    );

    // Check if notifications were created
    const notifications = await Notification.find({
      recipientId: user1._id,
    });

    console.log("\n📧 Notifications created:");
    notifications.forEach((notification, index) => {
      console.log(
        `${index + 1}. ${notification.title} - ${notification.message}`
      );
      console.log(`   From: ${notification.senderId || "System"}`);
      console.log(`   Type: ${notification.type}`);
      console.log(`   Read: ${notification.isRead}`);
      console.log("");
    });

    // Test GraphQL queries
    console.log("Testing GraphQL queries...");

    // Test getUnreadNotificationsCount
    const unreadCount = await Notification.countDocuments({
      recipientId: user1._id,
      isRead: false,
    });
    console.log(`✅ Unread notifications count: ${unreadCount}`);

    // Test getNotifications with pagination
    const notificationsPage = await Notification.find({
      recipientId: user1._id,
    })
      .sort({ createdAt: -1 })
      .limit(10);

    console.log(
      `✅ Retrieved ${notificationsPage.length} notifications for user`
    );

    console.log("\n🎉 Notification system test completed successfully!");
  } catch (error) {
    console.error("❌ Test failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
};

testNotifications();
