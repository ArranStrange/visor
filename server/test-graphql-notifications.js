const mongoose = require("mongoose");
const dotenv = require("dotenv");
const { ApolloServer } = require("apollo-server-express");
const { mergeTypeDefs, mergeResolvers } = require("@graphql-tools/merge");

// Import your schema and resolvers
const mainTypeDefs = require("./schema/typeDefs");
const presetTypeDefs = require("./schema/typeDefs/preset");
const filmSimTypeDefs = require("./schema/typeDefs/filmSim");
const listTypeDefs = require("./schema/typeDefs/list");
const tagTypeDefs = require("./schema/typeDefs/tag");
const userTypeDefs = require("./schema/typeDefs/user");
const discussionTypeDefs = require("./schema/typeDefs/discussion");
const notificationTypeDefs = require("./schema/typeDefs/notification");

const mainResolvers = require("./schema/resolvers");
const presetResolvers = require("./schema/resolvers/preset");
const filmSimResolvers = require("./schema/resolvers/filmSim");
const listResolvers = require("./schema/resolvers/list");
const tagResolvers = require("./schema/resolvers/tag");
const userResolvers = require("./schema/resolvers/user");
const discussionResolvers = require("./schema/resolvers/discussion");
const notificationResolvers = require("./schema/resolvers/notification");

const typeDefs = mergeTypeDefs([
  mainTypeDefs,
  presetTypeDefs,
  filmSimTypeDefs,
  listTypeDefs,
  tagTypeDefs,
  userTypeDefs,
  discussionTypeDefs,
  notificationTypeDefs,
]);

const resolvers = mergeResolvers([
  mainResolvers,
  presetResolvers,
  filmSimResolvers,
  listResolvers,
  tagResolvers,
  userResolvers,
  discussionResolvers,
  notificationResolvers,
]);

dotenv.config();

const testGraphQLNotifications = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Create Apollo Server for testing
    const server = new ApolloServer({
      typeDefs,
      resolvers,
      context: async () => {
        // Mock user context for testing
        const User = require("./models/User");
        const user = await User.findOne({ username: "arran" });
        return {
          user: user ? { ...user.toObject(), id: user._id } : null,
        };
      },
    });

    await server.start();

    // Test queries
    const userId = "6848094fb0de38f66d970ac9"; // arran's user ID

    console.log("\n🧪 Testing GraphQL Notification Queries...");

    // Test 1: Get unread count
    console.log("\n1. Testing getUnreadNotificationsCount...");
    const unreadCountResult = await server.executeOperation({
      query: `
        query GetUnreadCount($userId: ID!) {
          getUnreadNotificationsCount(userId: $userId)
        }
      `,
      variables: { userId },
    });

    if (unreadCountResult.errors) {
      console.error(
        "❌ Error in unread count query:",
        unreadCountResult.errors
      );
    } else {
      console.log(
        "✅ Unread count:",
        unreadCountResult.data.getUnreadNotificationsCount
      );
    }

    // Test 2: Get notifications
    console.log("\n2. Testing getNotifications...");
    const notificationsResult = await server.executeOperation({
      query: `
        query GetNotifications($userId: ID!, $page: Int, $limit: Int) {
          getNotifications(userId: $userId, page: $page, limit: $limit) {
            notifications {
              id
              type
              title
              message
              isRead
              createdAt
              recipientId
            }
            totalCount
            hasNextPage
            hasPreviousPage
            unreadCount
          }
        }
      `,
      variables: { userId, page: 1, limit: 10 },
    });

    if (notificationsResult.errors) {
      console.error(
        "❌ Error in notifications query:",
        notificationsResult.errors
      );
    } else {
      const data = notificationsResult.data.getNotifications;
      console.log("✅ Total notifications:", data.totalCount);
      console.log("✅ Unread count:", data.unreadCount);
      console.log("✅ Notifications found:", data.notifications.length);

      if (data.notifications.length > 0) {
        console.log("\n📋 First notification:");
        console.log("   Type:", data.notifications[0].type);
        console.log("   Title:", data.notifications[0].title);
        console.log("   Message:", data.notifications[0].message);
        console.log("   Read:", data.notifications[0].isRead);
      }
    }

    // Test 3: Mark notification as read
    if (notificationsResult.data?.getNotifications?.notifications?.length > 0) {
      const firstNotificationId =
        notificationsResult.data.getNotifications.notifications[0].id;

      console.log("\n3. Testing markNotificationRead...");
      const markReadResult = await server.executeOperation({
        query: `
          mutation MarkNotificationRead($input: MarkNotificationReadInput!) {
            markNotificationRead(input: $input) {
              id
              isRead
              updatedAt
            }
          }
        `,
        variables: {
          input: { notificationId: firstNotificationId },
        },
      });

      if (markReadResult.errors) {
        console.error("❌ Error in mark read mutation:", markReadResult.errors);
      } else {
        console.log(
          "✅ Marked notification as read:",
          markReadResult.data.markNotificationRead.isRead
        );
      }
    }

    console.log("\n🎉 GraphQL notification tests completed!");
  } catch (error) {
    console.error("❌ Test failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
};

testGraphQLNotifications();
