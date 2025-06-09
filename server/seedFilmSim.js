// seedFilmSims.js

const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/User");
const Tag = require("./models/Tag");
const FilmSim = require("./models/FilmSim");
const UserList = require("./models/UserList");

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/visor";

const filmSims = [
  {
    id: "kodak-ultramax",
    title: "Kodak Ultramax 400",
    thumbnail:
      "https://images.squarespace-cdn.com/content/v1/5ebc5b0285bdc72d1aee199d/1683119397074-X4H4PQ3WLGCFKYSAFEIG/street_photography_tokyo-52.jpg",
    tags: ["vintage", "portrait"],
    toneProfile: "Warm tones, soft contrast",
  },
  // ... (truncated for brevity)
];

async function seedFilmSims() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

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

      const exists = await FilmSim.findOne({ slug: sim.id });
      let newFilmSim;

      if (!exists) {
        newFilmSim = await FilmSim.create({
          name: sim.title,
          slug: sim.id,
          description: sim.toneProfile,
          approximationSettings: {},
          toneCurve: {},
          tags: tagIds,
          sampleImages: [],
          creator: creator?._id,
          notes: sim.toneProfile,
          recommendedPresets: [],
          compatibleCameras: [],
        });
        console.log(`✅ Seeded: ${sim.title}`);
      } else {
        newFilmSim = exists;
      }

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
