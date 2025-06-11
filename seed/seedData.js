const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const User = require("../models/User");
const Preset = require("../models/Preset");
const FilmSim = require("../models/FilmSim");
const Tag = require("../models/Tag");
const Image = require("../models/Image");

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/visor";

const seedUsers = async () => {
  const users = [
    {
      username: "admin",
      email: "admin@example.com",
      password: "password123",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin",
      bio: "Admin user for testing",
      cameras: ["Fujifilm X-T4", "Fujifilm X-Pro3"],
      instagram: "admin_visor",
    },
    {
      username: "photographer",
      email: "photo@example.com",
      password: "password123",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=photographer",
      bio: "Professional photographer",
      cameras: ["Fujifilm X-T5", "Fujifilm GFX 100S"],
      instagram: "photo_visor",
    },
  ];

  console.log("Seeding users...");
  const createdUsers = await User.insertMany(users);
  console.log("Users seeded successfully");
  return createdUsers;
};

const seedTags = async () => {
  const tags = [
    {
      name: "street",
      displayName: "Street",
      category: "preset",
    },
    {
      name: "portrait",
      displayName: "Portrait",
      category: "preset",
    },
    {
      name: "landscape",
      displayName: "Landscape",
      category: "preset",
    },
    {
      name: "black-and-white",
      displayName: "Black & White",
      category: "preset",
    },
    {
      name: "vintage",
      displayName: "Vintage",
      category: "preset",
    },
  ];

  console.log("Seeding tags...");
  const createdTags = await Tag.insertMany(tags);
  console.log("Tags seeded successfully");
  return createdTags;
};

const seedFilmSims = async () => {
  const filmSims = [
    {
      name: "Classic Chrome",
      slug: "classic-chrome",
      description: "Fujifilm's Classic Chrome film simulation",
      type: "fujifilm-native",
      compatibleCameras: ["X-T4", "X-T5", "X-Pro3", "X100V"],
    },
    {
      name: "Classic Neg",
      slug: "classic-neg",
      description: "Fujifilm's Classic Negative film simulation",
      type: "fujifilm-native",
      compatibleCameras: ["X-T4", "X-T5", "X-Pro3", "X100V"],
    },
  ];

  console.log("Seeding film simulations...");
  const createdFilmSims = await FilmSim.insertMany(filmSims);
  console.log("Film simulations seeded successfully");
  return createdFilmSims;
};

const seedPresets = async (users, tags, filmSims) => {
  const presets = [
    {
      title: "Tokyo Street Vibes",
      slug: "tokyo-street-vibes",
      description: "Vibrant urban colors with a touch of neon",
      xmpUrl: "/presets/tokyo-street-vibes.xmp",
      settings: {
        exposure: 0.5,
        contrast: 10,
        highlights: -15,
        shadows: 15,
        saturation: 5,
      },
      toneCurve: {
        rgb: [0, 0, 255, 255],
        red: [0, 0, 255, 255],
        green: [0, 0, 255, 255],
        blue: [0, 0, 255, 255],
      },
      notes: "Perfect for urban night photography",
      tags: [tags[0]._id], // street
      filmSim: filmSims[0]._id, // Classic Chrome
      isPublished: true,
    },
    {
      title: "Portrait Perfection",
      slug: "portrait-perfection",
      description: "Soft, flattering tones for portraits",
      xmpUrl: "/presets/portrait-perfection.xmp",
      settings: {
        exposure: 0.3,
        contrast: 5,
        highlights: -10,
        shadows: 10,
        saturation: -5,
      },
      toneCurve: {
        rgb: [0, 0, 255, 255],
        red: [0, 0, 255, 255],
        green: [0, 0, 255, 255],
        blue: [0, 0, 255, 255],
      },
      notes: "Great for outdoor portraits",
      tags: [tags[1]._id], // portrait
      filmSim: filmSims[1]._id, // Classic Neg
      isPublished: true,
    },
  ];

  // Assign creators to presets
  presets.forEach((preset, index) => {
    preset.creator = users[index % users.length]._id;
  });

  console.log("Seeding presets...");
  const createdPresets = await Preset.insertMany(presets);
  console.log("Presets seeded successfully");

  // Create sample images for presets
  for (const preset of createdPresets) {
    const sampleImage = await Image.create({
      url: `https://api.dicebear.com/7.x/shapes/svg?seed=${preset.slug}`,
      caption: `Sample image for ${preset.title}`,
      uploader: preset.creator,
      associatedWith: {
        kind: "Preset",
        item: preset._id,
      },
      tags: preset.tags,
      isBeforeImage: false,
      isAfterImage: true,
    });

    // Update preset with sample image
    await Preset.findByIdAndUpdate(preset._id, {
      $push: { sampleImages: sampleImage._id },
    });
  }

  return createdPresets;
};

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Clear existing data
    await User.deleteMany({});
    await Preset.deleteMany({});
    await FilmSim.deleteMany({});
    await Tag.deleteMany({});
    await Image.deleteMany({});
    console.log("🗑️ Cleared existing data");

    // Seed data in order
    const users = await seedUsers();
    const tags = await seedTags();
    const filmSims = await seedFilmSims();
    await seedPresets(users, tags, filmSims);

    console.log("🌱 Database seeding complete");
    process.exit();
  } catch (err) {
    console.error("❌ Error seeding database:", err);
    process.exit(1);
  }
};

seedDatabase();
