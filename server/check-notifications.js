const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/User");
const Notification = require("./models/Notification");

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI;

const checkNotifications = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    // Check all users
    const users = await User.find();
    console.log(`\n📊 Total users: ${users.length}`);
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.username} (ID: ${user._id})`);
    });

    // Check all notifications
    const notifications = await Notification.find();
    console.log(`\n📧 Total notifications: ${notifications.length}`);

    if (notifications.length > 0) {
      console.log("\n📋 Notification details:");
      notifications.forEach((notification, index) => {
        console.log(`${index + 1}. Type: ${notification.type}`);
        console.log(`   Title: ${notification.title}`);
        console.log(`   Recipient: ${notification.recipientId}`);
        console.log(`   Read: ${notification.isRead}`);
        console.log(`   Created: ${notification.createdAt}`);
        console.log("");
      });
    }

    // Check for INFO type notifications specifically
    const infoNotifications = await Notification.find({ type: "INFO" });
    console.log(`\nℹ️  INFO notifications: ${infoNotifications.length}`);

    if (infoNotifications.length > 0) {
      console.log("\n📋 INFO notification details:");
      infoNotifications.forEach((notification, index) => {
        console.log(`${index + 1}. Title: ${notification.title}`);
        console.log(`   Message: ${notification.message}`);
        console.log(`   Recipient: ${notification.recipientId}`);
        console.log(`   Read: ${notification.isRead}`);
        console.log("");
      });
    }

    // Check for your specific user's notifications
    const yourUsername = "arran"; // Change this to your username
    const yourUser = await User.findOne({ username: yourUsername });

    if (yourUser) {
      console.log(`\n👤 Your user: ${yourUser.username} (ID: ${yourUser._id})`);

      const yourNotifications = await Notification.find({
        recipientId: yourUser._id,
      });
      console.log(`📧 Your notifications: ${yourNotifications.length}`);

      if (yourNotifications.length > 0) {
        console.log("\n📋 Your notification details:");
        yourNotifications.forEach((notification, index) => {
          console.log(`${index + 1}. Type: ${notification.type}`);
          console.log(`   Title: ${notification.title}`);
          console.log(`   Message: ${notification.message}`);
          console.log(`   Read: ${notification.isRead}`);
          console.log(`   Created: ${notification.createdAt}`);
          console.log("");
        });
      }
    } else {
      console.log(`\n❌ User '${yourUsername}' not found`);
    }
  } catch (error) {
    console.error("Error checking notifications:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
};

checkNotifications();
