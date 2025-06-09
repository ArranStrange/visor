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
    tags: ["vintage", "portrait", "street"],
    toneProfile: "Warm tones, soft contrast, perfect for urban scenes",
  },
  {
    id: "kodak-portra-400",
    title: "Kodak Portra 400",
    thumbnail:
      "https://images.squarespace-cdn.com/content/v1/5ebc5b0285bdc72d1aee199d/1683119397074-X4H4PQ3WLGCFKYSAFEIG/street_photography_tokyo-52.jpg",
    tags: ["portrait", "street", "color"],
    toneProfile:
      "Natural skin tones, subtle color palette, ideal for street portraits",
  },
  {
    id: "fuji-provia-100f",
    title: "Fuji Provia 100F",
    thumbnail:
      "https://images.squarespace-cdn.com/content/v1/5ebc5b0285bdc72d1aee199d/1683119397074-X4H4PQ3WLGCFKYSAFEIG/street_photography_tokyo-52.jpg",
    tags: ["street", "color", "urban"],
    toneProfile: "Vibrant colors, high contrast, perfect for city life",
  },
  {
    id: "ilford-hp5",
    title: "Ilford HP5 Plus 400",
    thumbnail:
      "https://images.squarespace-cdn.com/content/v1/5ebc5b0285bdc72d1aee199d/1683119397074-X4H4PQ3WLGCFKYSAFEIG/street_photography_tokyo-52.jpg",
    tags: ["black and white", "street", "gritty"],
    toneProfile:
      "Classic black and white, rich shadows, perfect for urban scenes",
  },
  {
    id: "kodak-tri-x",
    title: "Kodak Tri-X 400",
    thumbnail:
      "https://images.squarespace-cdn.com/content/v1/5ebc5b0285bdc72d1aee199d/1683119397074-X4H4PQ3WLGCFKYSAFEIG/street_photography_tokyo-52.jpg",
    tags: ["black and white", "street", "documentary"],
    toneProfile: "High contrast, gritty grain, classic street photography look",
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
        description: sim.toneProfile,
        approximationSettings: {},
        toneCurve: {},
        tags: tagIds,
        sampleImages: [], // Will be updated after image creation
        creator: creator?._id,
        notes: sim.toneProfile,
        recommendedPresets: [],
        compatibleCameras: [],
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
