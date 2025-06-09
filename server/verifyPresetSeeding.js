const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Preset = require("./models/Preset");
const Image = require("./models/Image");
const FilmSim = require("./models/FilmSim");
const Tag = require("./models/Tag");

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/visor";

async function verifyPresetSeeding() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Get all presets with their sample images
    const presets = await Preset.find()
      .populate("sampleImages")
      .populate("filmSim")
      .populate("tags");

    console.log("\n📸 Presets and their sample images:");
    console.log("==================================");

    for (const preset of presets) {
      console.log(`\n🎨 ${preset.title} (${preset.slug})`);
      console.log(`Description: ${preset.description}`);
      console.log(`Film Simulation: ${preset.filmSim?.name || "None"}`);
      console.log(`Tags: ${preset.tags.map((t) => t.displayName).join(", ")}`);
      console.log(`Sample Images: ${preset.sampleImages.length}`);

      for (const image of preset.sampleImages) {
        console.log(`  - Image URL: ${image.url}`);
        console.log(`    Caption: ${image.caption}`);
        console.log(`    Associated with: ${image.associatedWith.kind}`);
      }
    }

    // Get all images and verify their associations
    const images = await Image.find()
      .populate("associatedWith.item")
      .populate("tags");

    console.log("\n🖼️ All Preset Images and their associations:");
    console.log("========================================");

    for (const image of images) {
      if (image.associatedWith.kind === "Preset") {
        console.log(`\nImage: ${image.url}`);
        console.log(`Caption: ${image.caption}`);
        console.log(`Associated with: ${image.associatedWith.kind}`);
        console.log(`Preset: ${image.associatedWith.item?.title}`);
        console.log(`Tags: ${image.tags.map((t) => t.displayName).join(", ")}`);
      }
    }

    console.log("\n✅ Verification complete");
    process.exit();
  } catch (err) {
    console.error("❌ Error verifying preset seeding:", err);
    process.exit(1);
  }
}

verifyPresetSeeding();
