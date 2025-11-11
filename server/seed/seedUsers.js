// seedUsers.js

const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("../models/User");

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/visor";
const DEFAULT_PASSWORD = process.env.SEED_USER_PASSWORD || "VisorSeed!23";

const users = [
  {
    username: "camila_dawn",
    email: "camila.dawn@example.com",
    avatar: "/avatars/camila.jpg",
    bio: "Golden-hour portraitist pairing warm palettes with soft, painterly shadows.",
    instagram: "@camila.dawn",
    cameras: ["Canon EOS R6", "Contax T2"],
  },
  {
    username: "mateo_rivers",
    email: "mateo.rivers@example.com",
    avatar: "/avatars/mateo.jpg",
    bio: "Documentary storyteller chasing reflections across Lisbon's waterfront alleys.",
    instagram: "@mat.rivers",
    cameras: ["Fujifilm X-Pro3", "Leica M6"],
  },
  {
    username: "priya_kale",
    email: "priya.kale@example.com",
    avatar: "/avatars/priya.jpg",
    bio: "Experimental editor layering infrared film with modern color grading techniques.",
    instagram: "@priyakale.studio",
    cameras: ["Sony A7R IV", "Hasselblad 500 C/M"],
  },
  {
    username: "jonas_ember",
    email: "jonas.ember@example.com",
    avatar: "/avatars/jonas.jpg",
    bio: "Architectural minimalism fan sculpting light with hard lines and deep contrasts.",
    instagram: "@emberframes",
    cameras: ["Nikon Z7 II", "Large Format Tachihara"],
  },
  {
    username: "aiko_tanaka",
    email: "aiko.tanaka@example.com",
    avatar: "/avatars/aiko.jpg",
    bio: "Night-walk photographer weaving neon hues into quiet Tokyo side streets.",
    instagram: "@aiko.afterdark",
    cameras: ["Ricoh GR IIIx", "Fujifilm GA645"],
  },
  {
    username: "malik_rhodes",
    email: "malik.rhodes@example.com",
    avatar: "/avatars/malik.jpg",
    bio: "Jazz club regular capturing smoky ambience on high-contrast monochrome stocks.",
    instagram: "@rhodes.notes",
    cameras: ["Leica Q3", "Olympus Stylus Epic"],
  },
  {
    username: "sofia_marlowe",
    email: "sofia.marlowe@example.com",
    avatar: "/avatars/sofia.jpg",
    bio: "Traveling botanist cataloging muted florals and fog-drenched forest trails.",
    instagram: "@marlowe.botanica",
    cameras: ["Fujifilm X-T5", "Pentax 67"],
  },
  {
    username: "ezra_finch",
    email: "ezra.finch@example.com",
    avatar: "/avatars/ezra.jpg",
    bio: "Street poet mixing candid laughter with cinematic color blocking downtown.",
    instagram: "@ezrafinch",
    cameras: ["Canon EOS R5", "Voigtländer Bessa R2"],
  },
  {
    username: "lila_storm",
    email: "lila.storm@example.com",
    avatar: "/avatars/lila.jpg",
    bio: "Storm chaser dialing saturation to eleven for electric skies and restless clouds.",
    instagram: "@storm.lila",
    cameras: ["Sony A1", "Mamiya 7"],
  },
  {
    username: "hugo_blanc",
    email: "hugo.blanc@example.com",
    avatar: "/avatars/hugo.jpg",
    bio: "Parisian film devotee obsessed with grain-heavy café scenes and rain-slick pavements.",
    instagram: "@hugoblanc",
    cameras: ["Leica CL", "Canonet QL17"],
  },
  {
    username: "isla_meadows",
    email: "isla.meadows@example.com",
    avatar: "/avatars/isla.jpg",
    bio: "Lifestyle curator blending plant-filled interiors with hazy morning light.",
    instagram: "@islameadows",
    cameras: ["Fujifilm X100V", "Polaroid SX-70"],
  },
  {
    username: "dante_vega",
    email: "dante.vega@example.com",
    avatar: "/avatars/dante.jpg",
    bio: "Motorcycle diarist freezing chrome reflections against sun-baked desert routes.",
    instagram: "@vega.rides",
    cameras: ["Panasonic S5 II", "Yashica T4"],
  },
  {
    username: "mei_lin",
    email: "mei.lin@example.com",
    avatar: "/avatars/mei.jpg",
    bio: "Food stylist stacking bold backdrops with imperfect, soulful street snacks.",
    instagram: "@meilinplates",
    cameras: ["Canon EOS R7", "Fuji GW690"],
  },
  {
    username: "omar_solace",
    email: "omar.solace@example.com",
    avatar: "/avatars/omar.jpg",
    bio: "Ambient music producer crafting long-exposure cityscapes to pair with synth drones.",
    instagram: "@solace.tones",
    cameras: ["Sony A7S III", "Rollei 35"],
  },
  {
    username: "freya_north",
    email: "freya.north@example.com",
    avatar: "/avatars/freya.jpg",
    bio: "Nordic storyteller celebrating icy blues, knit textures, and low winter suns.",
    instagram: "@freyashoots",
    cameras: ["Nikon Zf", "Hasselblad XPan"],
  },
  {
    username: "luca_marin",
    email: "luca.marin@example.com",
    avatar: "/avatars/luca.jpg",
    bio: "Underwater explorer recording coral reefs with ethereal cyan and magenta palettes.",
    instagram: "@luca.tides",
    cameras: ["Olympus OM-D E-M1X", "Nikonos V"],
  },
  {
    username: "zahra_noor",
    email: "zahra.noor@example.com",
    avatar: "/avatars/zahra.jpg",
    bio: "Cultural historian chronicling Marrakech artisans with jewel-toned film stocks.",
    instagram: "@zahra.story",
    cameras: ["Leica SL2", "Pentax Spotmatic"],
  },
  {
    username: "quentin_vale",
    email: "quentin.vale@example.com",
    avatar: "/avatars/quentin.jpg",
    bio: "Cinephile colorist recreating analog sci-fi palettes and vaporwave skyline gradients.",
    instagram: "@vale.frame",
    cameras: ["Blackmagic Pocket 6K", "Minolta X-700"],
  },
  {
    username: "hana_bloom",
    email: "hana.bloom@example.com",
    avatar: "/avatars/hana.jpg",
    bio: "Event florist blending macro botanicals with dreamy double exposures.",
    instagram: "@hanabloom",
    cameras: ["Fujifilm XT-30 II", "Holga 120N"],
  },
  {
    username: "niko_frost",
    email: "niko.frost@example.com",
    avatar: "/avatars/niko.jpg",
    bio: "Adventure guide mapping alpine treks with crushed blacks and subtle teal highlights.",
    instagram: "@nikofrost",
    cameras: ["Sony A7 IV", "Pentax 645N"],
  },
];

async function seedUsers() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    for (const user of users) {
      const seedData = {
        username: user.username,
        avatar: user.avatar,
        bio: user.bio,
        instagram: user.instagram,
        cameras: user.cameras,
        emailVerified: true,
      };

      const existing = await User.findOne({ email: user.email });

      if (existing) {
        Object.assign(existing, seedData);

        if (user.password) {
          existing.password = user.password;
        } else if (!existing.password) {
          existing.password = DEFAULT_PASSWORD;
        }

        await existing.save();
        console.log(`Updated user: ${user.username}`);
      } else {
        await User.create({
          ...seedData,
          email: user.email,
          password: user.password || DEFAULT_PASSWORD,
        });
        console.log(`Created user: ${user.username}`);
      }
    }

    console.log("User seeding complete");
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Error seeding users:", err);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seedUsers();
