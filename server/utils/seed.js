const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const User = require("../models/User");
const Preset = require("../models/Preset");
const FilmSim = require("../models/FilmSim");
const Tag = require("../models/Tag");
const List = require("../models/List");
const Image = require("../models/Image");

const connectDB = async () => {
  await mongoose.connect(
    process.env.MONGO_URI || "mongodb://localhost:27017/visor"
  );
  console.log("MongoDB connected");
};

const seed = async () => {
  try {
    await connectDB();

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Preset.deleteMany({}),
      FilmSim.deleteMany({}),
      Tag.deleteMany({}),
      List.deleteMany({}),
      Image.deleteMany({}),
    ]);

    // Create users
    const arran = new User({
      username: "arran",
      email: "arran@example.com",
      bio: "Photographer and creator of VISOR",
      cameras: ["Fujifilm X100V"],
      instagram: "https://instagram.com/arran",
    });

    const demo = new User({
      username: "demo",
      email: "demo@example.com",
      bio: "Demo user for testing",
      cameras: ["Fujifilm X-T5"],
    });

    await arran.save();
    await demo.save();

    // Create tags
    const bwTag = await Tag.create({
      name: "black-and-white",
      displayName: "Black & White",
      category: "style",
    });
    const streetTag = await Tag.create({
      name: "street",
      displayName: "Street",
      category: "subject",
    });

    // Create film simulation
    const classicChrome = new FilmSim({
      name: "Classic Chrome",
      slug: "classic-chrome",
      type: "Fujifilm",
      description: "Muted tones with deep shadows.",
      toneProfile: "muted",
      colorProfile: "cool",
      compatibleCameras: ["X100V", "X-T4"],
      tags: [streetTag._id],
    });

    await classicChrome.save();

    // Create a preset
    const preset = new Preset({
      title: "Moody Street Classic",
      slug: "moody-street-classic",
      description: "Great for urban black & white shots.",
      xmpUrl: "/uploads/presets/moody-street-classic.xmp",
      tags: [bwTag._id, streetTag._id],
      creator: arran._id,
      filmSim: classicChrome._id,
      downloads: 5,
    });

    await preset.save();

    // Create a list
    const list = new List({
      title: "Street Looks",
      slug: "street-looks",
      owner: arran._id,
      isPublic: true,
      items: [
        {
          kind: "Preset",
          item: preset._id,
          addedBy: arran._id,
        },
      ],
    });

    await list.save();

    console.log("✅ Seed data inserted.");
    process.exit();
  } catch (err) {
    console.error("❌ Error seeding data:", err);
    process.exit(1);
  }
};

seed();
