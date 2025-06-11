const mongoose = require("mongoose");
const dotenv = require("dotenv");
const FilmSim = require("./models/FilmSim");
const Image = require("./models/Image");

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/visor";

async function verifySeeding() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Get all film simulations with their sample images
    const filmSims = await FilmSim.find().populate("sampleImages");

    console.log("\n📸 Film Simulations and their sample images:");
    console.log("==========================================");

    for (const sim of filmSims) {
      console.log(`\n🎞️ ${sim.name} (${sim.slug})`);
      console.log(`Description: ${sim.description}`);
      console.log(`Sample Images: ${sim.sampleImages.length}`);

      for (const image of sim.sampleImages) {
        console.log(`  - Image URL: ${image.url}`);
        console.log(`    Caption: ${image.caption}`);
        console.log(`    Associated with: ${image.associatedWith.kind}`);
      }
    }

    // Get all images and verify their associations
    const images = await Image.find().populate("associatedWith.item");

    console.log("\n🖼️ All Images and their associations:");
    console.log("==================================");

    for (const image of images) {
      console.log(`\nImage: ${image.url}`);
      console.log(`Caption: ${image.caption}`);
      console.log(`Associated with: ${image.associatedWith.kind}`);
      if (image.associatedWith.item) {
        console.log(`Item name: ${image.associatedWith.item.name}`);
      }
    }

    console.log("\n✅ Verification complete");
    process.exit();
  } catch (err) {
    console.error("❌ Error verifying seeding:", err);
    process.exit(1);
  }
}

verifySeeding();
