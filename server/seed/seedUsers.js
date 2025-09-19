// seedUsers.js

const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("../models/User");

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/visor";

const users = [
  {
    username: "arran",
    email: "arran@example.com",
    avatar: "/avatars/arran.png",
    bio: "Building VISOR and capturing city life.",
    instagram: "@arran.shots",
    cameras: ["Fujifilm X100V", "Canon AE-1"],
  },
  {
    username: "leah",
    email: "leah@example.com",
    avatar: "/avatars/leah.png",
    bio: "Lover of shadows and film grain.",
    instagram: "@leahfilm",
    cameras: ["Fujifilm X-Pro2"],
  },
  {
    username: "nina",
    email: "nina@example.com",
    avatar: "/avatars/nina.png",
    bio: "Documenting night city moods.",
    instagram: "@nina.photo",
    cameras: ["Sony A7III"],
  },
  {
    username: "jamal",
    email: "jamal@example.com",
    avatar: "/avatars/jamal.png",
    bio: "Exploring texture and tone.",
    instagram: "@jamalframe",
    cameras: ["Leica Q2"],
  },
  {
    username: "emily",
    email: "emily@example.com",
    avatar: "/avatars/emily.png",
    bio: "Urban colours through my lens.",
    instagram: "@emilyurban",
    cameras: ["Fujifilm X-T4"],
  },
  {
    username: "theo",
    email: "theo@example.com",
    avatar: "/avatars/theo.png",
    bio: "Black & white moments only.",
    instagram: "@theobw",
    cameras: ["Nikon FM2"],
  },
  {
    username: "suki",
    email: "suki@example.com",
    avatar: "/avatars/suki.png",
    bio: "Tokyo neon chaser.",
    instagram: "@sukilights",
    cameras: ["Ricoh GR III"],
  },
  {
    username: "alex",
    email: "alex@example.com",
    avatar: "/avatars/alex.png",
    bio: "Dreamlike tones for dreamy scenes.",
    instagram: "@alexfog",
    cameras: ["Olympus OM-D E-M10"],
  },
  {
    username: "marie",
    email: "marie@example.com",
    avatar: "/avatars/marie.png",
    bio: "Retro vibes always.",
    instagram: "@marievintage",
    cameras: ["Pentax K1000"],
  },
  {
    username: "tom",
    email: "tom@example.com",
    avatar: "/avatars/tom.png",
    bio: "Desert light and shadows.",
    instagram: "@tomdust",
    cameras: ["Sony RX100"],
  },
];

async function seedUsers() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    for (const user of users) {
      const exists = await User.findOne({ username: user.username });
      if (!exists) {
        await User.create(user);
        console.log(`Created user: ${user.username}`);
      }
    }

    console.log("User seeding complete");
    process.exit();
  } catch (err) {
    console.error("Error seeding users:", err);
    process.exit(1);
  }
}

seedUsers();
