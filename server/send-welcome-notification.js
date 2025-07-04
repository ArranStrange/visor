const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/User");
const Notification = require("./models/Notification");

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI;

const WELCOME_TITLE = "Welcome to VISOR!";
const WELCOME_MESSAGE =
  "Thanks for joining VISOR, the community for film simulation and preset sharing, discussion, and discovery. Explore, create, and connect with other photography enthusiasts!";

const sendWelcomeNotifications = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    const users = await User.find();
    if (!users.length) {
      console.log("No users found.");
      return;
    }

    const notifications = users.map((user) => ({
      type: "INFO",
      title: WELCOME_TITLE,
      message: WELCOME_MESSAGE,
      recipientId: user._id,
      isRead: false,
    }));

    await Notification.insertMany(notifications);
    console.log(`Sent welcome notification to ${users.length} users.`);
  } catch (error) {
    console.error("Error sending welcome notifications:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
};

sendWelcomeNotifications();
