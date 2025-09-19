// seedPresets.js
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Preset = require("../models/Preset");
const User = require("../models/User");
const Tag = require("../models/Tag");
const FilmSim = require("../models/FilmSim");
const Image = require("../models/Image");

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/visor";

const presets = [
  {
    id: "tokyo-street-vibes",
    title: "Tokyo Street Vibes",
    description: "Vibrant urban colors with enhanced neon saturation",
    thumbnail: "https://example.com/tokyo-street-vibes.jpg",
    tags: ["street", "vibrant", "modern"],
    filmSim: "fuji-provia-100f",
    xmpUrl: "/presets/tokyo-street-vibes.xmp",
    settings: {
      exposure: 0.3,
      contrast: +15,
      highlights: -20,
      shadows: +25,
      whites: +10,
      blacks: -15,
      temp: 5500,
      tint: +3,
      vibrance: +25,
      saturation: +15,
      clarity: +10,
      dehaze: +5,
      grain: {
        amount: 15,
        size: 25,
        roughness: 50,
      },
      sharpening: 40,
      noiseReduction: {
        luminance: 20,
        detail: 50,
        color: 30,
      },
    },
    toneCurve: {
      rgb: [
        { x: 0, y: 10 },
        { x: 25, y: 30 },
        { x: 50, y: 60 },
        { x: 75, y: 80 },
        { x: 100, y: 90 },
      ],
      red: [
        { x: 0, y: 5 },
        { x: 100, y: 95 },
      ],
      green: [
        { x: 0, y: 0 },
        { x: 100, y: 100 },
      ],
      blue: [
        { x: 0, y: 15 },
        { x: 100, y: 85 },
      ],
    },
  },
  {
    id: "new-york-grit",
    title: "New York Grit",
    description: "High-contrast B&W with deep shadows",
    thumbnail: "https://example.com/new-york-grit.jpg",
    tags: ["monochrome", "high-contrast", "gritty"],
    filmSim: "kodak-tri-x",
    xmpUrl: "/presets/new-york-grit.xmp",
    settings: {
      contrast: +35,
      highlights: -30,
      shadows: +40,
      blacks: -25,
      clarity: +20,
      dehaze: +10,
      grain: {
        amount: 45,
        size: 35,
        roughness: 60,
      },
      sharpening: 60,
      noiseReduction: {
        luminance: 30,
        detail: 40,
        color: 20,
      },
      bwMix: {
        red: +20,
        orange: +15,
        yellow: -10,
        green: +30,
        aqua: -20,
        blue: +25,
        purple: +10,
        magenta: +5,
      },
    },
    toneCurve: {
      rgb: [
        { x: 0, y: 0 },
        { x: 25, y: 40 },
        { x: 50, y: 60 },
        { x: 75, y: 80 },
        { x: 100, y: 100 },
      ],
    },
  },
  {
    id: "paris-morning",
    title: "Paris Morning",
    description: "Soft pastel tones with film matte",
    thumbnail: "https://example.com/paris-morning.jpg",
    tags: ["vintage", "pastel", "matte"],
    filmSim: "kodak-portra-400",
    xmpUrl: "/presets/paris-morning.xmp",
    settings: {
      exposure: 0.7,
      contrast: -10,
      highlights: -40,
      shadows: +35,
      whites: -15,
      blacks: +20,
      temp: 4800,
      tint: -5,
      vibrance: +10,
      saturation: -15,
      clarity: -5,
      dehaze: -10,
      grain: {
        amount: 25,
        size: 20,
        roughness: 40,
      },
      sharpening: 40,
      noiseReduction: {
        luminance: 15,
        detail: 30,
        color: 25,
      },
      splitToning: {
        highlightsHue: 45,
        highlightsSaturation: 15,
        shadowsHue: 220,
        shadowsSaturation: 10,
      },
    },
    toneCurve: {
      rgb: [
        { x: 0, y: 25 },
        { x: 100, y: 85 },
      ],
      red: [
        { x: 0, y: 10 },
        { x: 100, y: 90 },
      ],
      green: [
        { x: 0, y: 15 },
        { x: 100, y: 85 },
      ],
      blue: [
        { x: 0, y: 20 },
        { x: 100, y: 80 },
      ],
    },
  },
];

const seedPresets = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("Connected to MongoDB");

    await Preset.deleteMany({});
    await Image.deleteMany({ associatedWith: { kind: "Preset" } });
    console.log("Cleared existing presets and their images");

    for (const preset of presets) {
      const creator = await User.findOne();
      const filmSim = await FilmSim.findOne({ slug: preset.filmSim });

      const tagIds = await Promise.all(
        preset.tags.map(async (tagName) => {
          const existingTag = await Tag.findOneAndUpdate(
            { name: tagName.toLowerCase() },
            {
              name: tagName.toLowerCase(),
              displayName: tagName,
              category: "preset",
            },
            { new: true, upsert: true }
          );
          return existingTag._id;
        })
      );

      const newPreset = await Preset.create({
        ...preset,
        slug: preset.id,
        tags: tagIds,
        creator: creator?._id,
        filmSim: filmSim?._id,
        isPublished: true,
      });

      console.log(`Seeded: ${preset.title}`);
    }

    console.log("Preset seeding complete");
    process.exit(0);
  } catch (err) {
    console.error("Error seeding presets:", err);
    process.exit(1);
  }
};

seedPresets();
