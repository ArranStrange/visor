// seedPresets.js
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Preset = require("./models/Preset");
const User = require("./models/User");
const Tag = require("./models/Tag");
const FilmSim = require("./models/FilmSim");
const Image = require("./models/Image");

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/visor";

const presets = [
  {
    id: "tokyo-street-vibes",
    title: "Tokyo Street Vibes",
    description: "Vibrant urban colors with a touch of neon",
    thumbnail:
      "https://images.squarespace-cdn.com/content/v1/5ebc5b0285bdc72d1aee199d/1683119397074-X4H4PQ3WLGCFKYSAFEIG/street_photography_tokyo-52.jpg",
    tags: ["street", "urban", "color"],
    filmSim: "fuji-provia-100f",
    xmpUrl: "/presets/tokyo-street-vibes.xmp",
  },
  {
    id: "new-york-grit",
    title: "New York Grit",
    description: "Classic black and white street photography look",
    thumbnail:
      "https://images.squarespace-cdn.com/content/v1/5ebc5b0285bdc72d1aee199d/1683119397074-X4H4PQ3WLGCFKYSAFEIG/street_photography_nyc-23.jpg",
    tags: ["street", "black and white", "urban"],
    filmSim: "kodak-tri-x",
    xmpUrl: "/presets/new-york-grit.xmp",
  },
  {
    id: "paris-morning",
    title: "Paris Morning",
    description: "Soft, warm tones perfect for early morning street scenes",
    thumbnail:
      "https://images.squarespace-cdn.com/content/v1/5ebc5b0285bdc72d1aee199d/1683119397074-X4H4PQ3WLGCFKYSAFEIG/street_photography_paris-15.jpg",
    tags: ["street", "portrait", "warm"],
    filmSim: "kodak-portra-400",
    xmpUrl: "/presets/paris-morning.xmp",
  },
  {
    id: "london-fog",
    title: "London Fog",
    description: "Moody atmosphere with muted colors",
    thumbnail:
      "https://images.squarespace-cdn.com/content/v1/5ebc5b0285bdc72d1aee199d/1683119397074-X4H4PQ3WLGCFKYSAFEIG/street_photography_london-42.jpg",
    tags: ["street", "moody", "urban"],
    filmSim: "ilford-hp5",
    xmpUrl: "/presets/london-fog.xmp",
  },
  {
    id: "berlin-nights",
    title: "Berlin Nights",
    description: "High contrast night photography with rich shadows",
    thumbnail:
      "https://images.squarespace-cdn.com/content/v1/5ebc5b0285bdc72d1aee199d/1683119397074-X4H4PQ3WLGCFKYSAFEIG/street_photography_berlin-31.jpg",
    tags: ["street", "night", "urban"],
    filmSim: "kodak-ultramax",
    xmpUrl: "/presets/berlin-nights.xmp",
  },
];

const seedPresets = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Clear existing presets and their images
    await Preset.deleteMany({});
    await Image.deleteMany({ associatedWith: { kind: "Preset" } });
    console.log("🗑️ Cleared existing presets and their images");

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

      // Create the preset first
      const newPreset = await Preset.create({
        title: preset.title,
        slug: preset.id,
        description: preset.description,
        xmpUrl: preset.xmpUrl,
        settings: {},
        toneCurve: {},
        tags: tagIds,
        sampleImages: [], // Will be updated after image creation
        creator: creator?._id,
        filmSim: filmSim?._id,
        isPublished: true,
      });

      // Create a sample image for the preset
      const sampleImage = await Image.create({
        url: preset.thumbnail,
        caption: `Sample image for ${preset.title}`,
        uploader: creator?._id,
        associatedWith: {
          kind: "Preset",
          item: newPreset._id,
        },
        tags: tagIds,
        isBeforeImage: false,
        isAfterImage: true,
      });

      // Update the preset with the sample image
      await Preset.findByIdAndUpdate(newPreset._id, {
        $push: { sampleImages: sampleImage._id },
      });

      console.log(`✅ Seeded: ${preset.title} with sample image`);
    }

    console.log("🌱 Preset seeding complete");
    process.exit();
  } catch (err) {
    console.error("❌ Error seeding presets:", err);
    process.exit(1);
  }
};

seedPresets();
