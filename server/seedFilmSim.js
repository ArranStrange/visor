// seedFilmSims.js

const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/User");
const Tag = require("./models/Tag");
const FilmSim = require("./models/FilmSim");
const UserList = require("./models/UserList");
const Image = require("./models/Image");

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/visor";

const filmSims = [
  {
    id: "kodak-ultramax",
    title: "Kodak Ultramax 400",
    thumbnail:
      "https://images.squarespace-cdn.com/content/v1/5ebc5b0285bdc72d1aee199d/1683119397074-X4H4PQ3WLGCFKYSAFEIG/street_photography_tokyo-52.jpg",
    tags: ["vintage", "portrait", "street", "color", "warm"],
    toneProfile: "Warm tones, soft contrast, perfect for urban scenes",
    description:
      "A versatile color negative film known for its warm tones and natural skin tones. Perfect for everyday photography and street scenes.",
    approximationSettings: {
      exposure: 0,
      contrast: -10,
      highlights: -15,
      shadows: +10,
      whites: -5,
      blacks: +5,
      clarity: -5,
      vibrance: +10,
      saturation: +5,
      temperature: +5,
      tint: 0,
    },
    toneCurve: {
      rgb: [0, 0, 25, 25, 50, 50, 75, 75, 100, 100],
      red: [0, 0, 25, 28, 50, 52, 75, 78, 100, 100],
      green: [0, 0, 25, 24, 50, 48, 75, 72, 100, 100],
      blue: [0, 0, 25, 22, 50, 45, 75, 68, 100, 100],
    },
    compatibleCameras: ["X100V", "X-T4", "X-T3", "X-Pro3", "X-E4"],
    notes:
      "Best used in daylight conditions. Slightly underexpose for more saturated colors. Great for street photography and portraits.",
  },
  {
    id: "kodak-portra-400",
    title: "Kodak Portra 400",
    thumbnail:
      "https://images.squarespace-cdn.com/content/v1/5ebc5b0285bdc72d1aee199d/1683119397074-X4H4PQ3WLGCFKYSAFEIG/street_photography_tokyo-52.jpg",
    tags: ["portrait", "street", "color", "professional", "skin-tone"],
    toneProfile:
      "Natural skin tones, subtle color palette, ideal for street portraits",
    description:
      "A professional-grade color negative film renowned for its exceptional skin tones and natural color reproduction. The go-to choice for portrait photographers.",
    approximationSettings: {
      exposure: 0,
      contrast: -15,
      highlights: -20,
      shadows: +15,
      whites: -10,
      blacks: +5,
      clarity: -10,
      vibrance: +5,
      saturation: -5,
      temperature: +2,
      tint: +2,
    },
    toneCurve: {
      rgb: [0, 0, 25, 28, 50, 52, 75, 78, 100, 100],
      red: [0, 0, 25, 30, 50, 54, 75, 80, 100, 100],
      green: [0, 0, 25, 26, 50, 50, 75, 74, 100, 100],
      blue: [0, 0, 25, 24, 50, 48, 75, 72, 100, 100],
    },
    compatibleCameras: ["X100V", "X-T4", "X-T3", "X-Pro3", "X-E4", "GFX100S"],
    notes:
      "Perfect for portraits and fashion photography. Slightly overexpose for softer tones. Excellent for both indoor and outdoor shooting.",
  },
  {
    id: "fuji-provia-100f",
    title: "Fuji Provia 100F",
    thumbnail:
      "https://images.squarespace-cdn.com/content/v1/5ebc5b0285bdc72d1aee199d/1683119397074-X4H4PQ3WLGCFKYSAFEIG/street_photography_tokyo-52.jpg",
    tags: ["street", "color", "urban", "vibrant", "landscape"],
    toneProfile: "Vibrant colors, high contrast, perfect for city life",
    description:
      "A professional slide film known for its vibrant colors and high contrast. Excellent for urban photography and landscapes.",
    approximationSettings: {
      exposure: 0,
      contrast: +15,
      highlights: -10,
      shadows: -5,
      whites: +5,
      blacks: -5,
      clarity: +10,
      vibrance: +15,
      saturation: +10,
      temperature: 0,
      tint: 0,
    },
    toneCurve: {
      rgb: [0, 0, 25, 22, 50, 48, 75, 72, 100, 100],
      red: [0, 0, 25, 20, 50, 45, 75, 70, 100, 100],
      green: [0, 0, 25, 24, 50, 50, 75, 74, 100, 100],
      blue: [0, 0, 25, 26, 50, 52, 75, 76, 100, 100],
    },
    compatibleCameras: ["X100V", "X-T4", "X-T3", "X-Pro3", "X-E4", "GFX100S"],
    notes:
      "Best used in bright daylight. Slightly underexpose for more saturated colors. Great for architecture and urban scenes.",
  },
  {
    id: "ilford-hp5",
    title: "Ilford HP5 Plus 400",
    thumbnail:
      "https://images.squarespace-cdn.com/content/v1/5ebc5b0285bdc72d1aee199d/1683119397074-X4H4PQ3WLGCFKYSAFEIG/street_photography_tokyo-52.jpg",
    tags: ["black and white", "street", "gritty", "documentary", "classic"],
    toneProfile:
      "Classic black and white, rich shadows, perfect for urban scenes",
    description:
      "A versatile black and white film known for its classic look and excellent grain structure. Perfect for street photography and documentary work.",
    approximationSettings: {
      exposure: 0,
      contrast: +20,
      highlights: -10,
      shadows: +15,
      whites: +5,
      blacks: -5,
      clarity: +15,
      vibrance: 0,
      saturation: -100,
      temperature: 0,
      tint: 0,
    },
    toneCurve: {
      rgb: [0, 0, 25, 20, 50, 45, 75, 70, 100, 100],
      red: [0, 0, 25, 20, 50, 45, 75, 70, 100, 100],
      green: [0, 0, 25, 20, 50, 45, 75, 70, 100, 100],
      blue: [0, 0, 25, 20, 50, 45, 75, 70, 100, 100],
    },
    compatibleCameras: ["X100V", "X-T4", "X-T3", "X-Pro3", "X-E4"],
    notes:
      "Push to 1600 for more contrast and grain. Great for low-light situations. Perfect for street photography and documentary work.",
  },
  {
    id: "kodak-tri-x",
    title: "Kodak Tri-X 400",
    thumbnail:
      "https://images.squarespace-cdn.com/content/v1/5ebc5b0285bdc72d1aee199d/1683119397074-X4H4PQ3WLGCFKYSAFEIG/street_photography_tokyo-52.jpg",
    tags: ["black and white", "street", "documentary", "classic", "grainy"],
    toneProfile: "High contrast, gritty grain, classic street photography look",
    description:
      "The legendary black and white film that defined street photography. Known for its distinctive grain and high contrast.",
    approximationSettings: {
      exposure: 0,
      contrast: +25,
      highlights: -15,
      shadows: +20,
      whites: +10,
      blacks: -10,
      clarity: +20,
      vibrance: 0,
      saturation: -100,
      temperature: 0,
      tint: 0,
    },
    toneCurve: {
      rgb: [0, 0, 25, 18, 50, 42, 75, 68, 100, 100],
      red: [0, 0, 25, 18, 50, 42, 75, 68, 100, 100],
      green: [0, 0, 25, 18, 50, 42, 75, 68, 100, 100],
      blue: [0, 0, 25, 18, 50, 42, 75, 68, 100, 100],
    },
    compatibleCameras: ["X100V", "X-T4", "X-T3", "X-Pro3", "X-E4"],
    notes:
      "Push to 1600 for more dramatic results. Perfect for street photography and photojournalism. The grain adds character to the images.",
  },
];

async function seedFilmSims() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Clear existing data
    await FilmSim.deleteMany({});
    await Image.deleteMany({});
    console.log("🗑️ Cleared existing film sims and images");

    for (const sim of filmSims) {
      const creator = await User.findOne();

      const tagIds = await Promise.all(
        sim.tags.map(async (tagName) => {
          const existingTag = await Tag.findOneAndUpdate(
            { name: tagName.toLowerCase() },
            {
              name: tagName.toLowerCase(),
              displayName: tagName,
              category: "film",
            },
            { new: true, upsert: true }
          );
          return existingTag._id;
        })
      );

      // Create the film simulation first
      const newFilmSim = await FilmSim.create({
        name: sim.title,
        slug: sim.id,
        description: sim.description,
        type: "custom-recipe",
        approximationSettings: sim.approximationSettings,
        toneCurve: sim.toneCurve,
        tags: tagIds,
        sampleImages: [], // Will be updated after image creation
        creator: creator?._id,
        notes: sim.notes,
        recommendedPresets: [],
        compatibleCameras: sim.compatibleCameras,
      });

      // Create a sample image for the film simulation
      const sampleImage = await Image.create({
        url: sim.thumbnail,
        caption: `Sample image for ${sim.title}`,
        uploader: creator?._id,
        associatedWith: {
          kind: "FilmSim",
          item: newFilmSim._id,
        },
        tags: tagIds,
        isBeforeImage: false,
        isAfterImage: true,
      });

      // Update the film simulation with the sample image
      await FilmSim.findByIdAndUpdate(newFilmSim._id, {
        $push: { sampleImages: sampleImage._id },
      });

      console.log(`✅ Seeded: ${sim.title} with sample image`);

      // Create a user list for each film sim and assign it to the creator
      if (creator) {
        const listExists = await UserList.findOne({
          name: `${sim.title} Picks`,
          owner: creator._id,
        });

        if (!listExists) {
          const newList = await UserList.create({
            name: `${sim.title} Picks`,
            description: `A collection built around ${sim.title}`,
            owner: creator._id,
            presets: [],
            filmSims: [newFilmSim._id],
            isFavouriteList: false,
            isPublic: true,
            collaborators: [],
          });

          await User.findByIdAndUpdate(creator._id, {
            $push: { customLists: newList._id },
          });

          console.log(
            `📁 Created list for ${creator.username}: ${newList.name}`
          );
        }
      }
    }

    console.log("🌱 Film simulation seeding complete");
    process.exit();
  } catch (err) {
    console.error("❌ Error seeding film sims:", err);
    process.exit(1);
  }
}

seedFilmSims();
