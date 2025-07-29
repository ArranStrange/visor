const mongoose = require("mongoose");
require("dotenv").config();

async function migrateEmailVerification() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    const db = mongoose.connection.db;
    const users = db.collection("users");

    console.log("Updating existing users with email verification fields...");

    const result = await users.updateMany(
      { emailVerified: { $exists: false } },
      {
        $set: {
          emailVerified: false,
          verificationToken: null,
          tokenExpiry: null,
        },
      }
    );

    console.log(`Updated ${result.modifiedCount} users`);
    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

migrateEmailVerification();
