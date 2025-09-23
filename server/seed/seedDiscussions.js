const mongoose = require("mongoose");
const Discussion = require("../models/Discussion");
const Preset = require("../models/Preset");
const FilmSim = require("../models/FilmSim");
const User = require("../models/User");
const Tag = require("../models/Tag");
require("dotenv").config();

const MONGODB_URI = process.env.MONGODB_URI;

async function seedDiscussions() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    console.log("Clearing existing discussions...");
    await Discussion.deleteMany({});
    console.log("Cleared existing discussions");

    const presets = await Preset.find({}).populate("creator tags");
    const filmSims = await FilmSim.find({}).populate("creator tags");

    console.log(`Found ${presets.length} presets`);
    console.log(`Found ${filmSims.length} film sims`);

    const discussions = [];

    for (const preset of presets) {
      if (preset.creator) {
        const discussion = new Discussion({
          title: `Discussion: ${preset.title}`,
          linkedTo: {
            type: "preset",
            refId: preset._id,
          },
          tags: preset.tags.map((tag) => tag.displayName || tag.name),
          createdBy: preset.creator._id,
          followers: [preset.creator._id], // Auto-subscribe creator
        });
        discussions.push(discussion);
      }
    }

    for (const filmSim of filmSims) {
      if (filmSim.creator) {
        const discussion = new Discussion({
          title: `Discussion: ${filmSim.name}`,
          linkedTo: {
            type: "filmsim",
            refId: filmSim._id,
          },
          tags: filmSim.tags.map((tag) => tag.displayName || tag.name),
          createdBy: filmSim.creator._id,
          followers: [filmSim.creator._id], // Auto-subscribe creator
        });
        discussions.push(discussion);
      }
    }

    console.log(`Creating ${discussions.length} discussions...`);
    await Discussion.insertMany(discussions);
    console.log("Discussions seeded successfully");

    const discussionCount = await Discussion.countDocuments();
    console.log(`Total discussions in database: ${discussionCount}`);

    const sampleDiscussions = await Discussion.find({})
      .populate("createdBy", "username")
      .populate("linkedTo.refId", "title name")
      .limit(5);

    console.log("Sample discussions created:");
    sampleDiscussions.forEach((discussion) => {
      const linkedItem = discussion.linkedTo.refId;
      const itemName = linkedItem.title || linkedItem.name;
      console.log(
        `- ${discussion.title} (${discussion.linkedTo.type}) by @${discussion.createdBy.username}`
      );
    });
  } catch (error) {
    console.error("Error seeding discussions:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

seedDiscussions();
