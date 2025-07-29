const mongoose = require("mongoose");
require("dotenv").config();

async function migrateToProduction() {
  try {
    console.log("🚀 Starting Production Migration");
    console.log("===============================");

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    const User = require("./models/User");

    // 1. Add email verification fields to existing users
    console.log(
      "\n📧 Step 1: Adding email verification fields to existing users..."
    );

    const result = await User.updateMany(
      { emailVerified: { $exists: false } },
      {
        $set: {
          emailVerified: true, // Mark existing users as verified
          verificationToken: null,
          tokenExpiry: null,
        },
      }
    );

    console.log(
      `✅ Updated ${result.modifiedCount} users with email verification fields`
    );

    // 2. Create indexes for better performance
    console.log("\n📊 Step 2: Creating database indexes...");

    await User.collection.createIndex({ email: 1 }, { unique: true });
    await User.collection.createIndex({ username: 1 }, { unique: true });
    await User.collection.createIndex({ verificationToken: 1 });
    await User.collection.createIndex({ emailVerified: 1 });
    await User.collection.createIndex({ createdAt: -1 });

    console.log("✅ Database indexes created");

    // 3. Validate data integrity
    console.log("\n🔍 Step 3: Validating data integrity...");

    const totalUsers = await User.countDocuments();
    const verifiedUsers = await User.countDocuments({ emailVerified: true });
    const unverifiedUsers = await User.countDocuments({ emailVerified: false });

    console.log(`📊 User Statistics:`);
    console.log(`   Total users: ${totalUsers}`);
    console.log(`   Verified users: ${verifiedUsers}`);
    console.log(`   Unverified users: ${unverifiedUsers}`);

    // 4. Check for duplicate emails
    const duplicateEmails = await User.aggregate([
      { $group: { _id: "$email", count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } },
    ]);

    if (duplicateEmails.length > 0) {
      console.log("⚠️  Warning: Found duplicate emails:");
      duplicateEmails.forEach((dup) => {
        console.log(`   ${dup._id}: ${dup.count} occurrences`);
      });
    } else {
      console.log("✅ No duplicate emails found");
    }

    // 5. Check for duplicate usernames
    const duplicateUsernames = await User.aggregate([
      { $group: { _id: "$username", count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } },
    ]);

    if (duplicateUsernames.length > 0) {
      console.log("⚠️  Warning: Found duplicate usernames:");
      duplicateUsernames.forEach((dup) => {
        console.log(`   ${dup._id}: ${dup.count} occurrences`);
      });
    } else {
      console.log("✅ No duplicate usernames found");
    }

    console.log("\n🎉 Migration completed successfully!");
    console.log("\n📋 Next steps:");
    console.log("   1. Update environment variables for production");
    console.log("   2. Configure SendGrid domain authentication");
    console.log("   3. Set up SSL certificates");
    console.log("   4. Deploy with PM2");
    console.log("   5. Test email verification flow");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("\nDisconnected from MongoDB");
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  migrateToProduction();
}

module.exports = migrateToProduction;
