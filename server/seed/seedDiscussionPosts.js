const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Discussion = require("../models/Discussion");
const Preset = require("../models/Preset");
const FilmSim = require("../models/FilmSim");
const User = require("../models/User");

dotenv.config();

const MONGO_URI =
  process.env.MONGO_URI ||
  process.env.MONGODB_URI ||
  "mongodb://localhost:27017/visor";

const personaScripts = {
  camila_dawn: {
    lead: {
      preset: [
        (ctx) =>
          `Spent golden hour with the ${ctx.subject} ${ctx.typeLabel} yesterday—skin tones stayed buttery and the highlights never clipped.`,
      ],
      filmsim: [
        (ctx) =>
          `Ran the ${ctx.subject} ${ctx.typeLabel} during a dusk portrait session and it kept that honeyed glow intact without muddy shadows.`,
      ],
    },
    follow: {
      preset: [
        (ctx, to) =>
          `${
            to ? `@${to}` : "Totally"
          }, the transition from mid-tones to highlights feels so painterly. Perfect for backlit smiles.`,
      ],
      filmsim: [
        (ctx, to) =>
          `${
            to ? `@${to}` : "Absolutely"
          }, it keeps freckles luminous even under tungsten. I'm keeping this in my portrait kit.`,
      ],
    },
    reply: {
      preset: [
        (ctx, to) =>
          `${
            to ? `@${to}` : "Yep"
          }, try pairing it with a light diffusion filter—the glow gets even dreamier.`,
      ],
      filmsim: [
        (ctx, to) =>
          `${
            to ? `@${to}` : "Yep"
          }, toss in a touch of bounce light and the warmth wraps around faces beautifully.`,
      ],
    },
  },
  mateo_rivers: {
    lead: {
      preset: [
        (ctx) =>
          `Tested ${ctx.subject} roaming the Alfama steps—the way it polishes reflections off tile is such a vibe.`,
      ],
      filmsim: [
        (ctx) =>
          `The ${ctx.subject} ${ctx.typeLabel} kept Lisbon's waterfront blues crisp while the cobblestones stayed rich.`,
      ],
    },
    follow: {
      preset: [
        (ctx, to) =>
          `${
            to ? `@${to}` : "Agree"
          }, it respects those humid highlights without blowing the whites—a lifesaver near the river.`,
      ],
      filmsim: [
        (ctx, to) =>
          `${
            to ? `@${to}` : "For sure"
          }, the shadows stay soft enough that reflections still feel alive.`,
      ],
    },
    reply: {
      preset: [
        (ctx, to) =>
          `${
            to ? `@${to}` : "Hey"
          }, throw it on polished stone staircases at sunrise—it sings.`,
      ],
      filmsim: [
        (ctx, to) =>
          `${
            to ? `@${to}` : "Hey"
          }, wait until you see how it handles ferry windows in the morning haze.`,
      ],
    },
  },
  priya_kale: {
    lead: {
      preset: [
        (ctx) =>
          `Layered ${ctx.subject} over some infrared captures and the color separation stayed wonderfully surreal.`,
      ],
      filmsim: [
        (ctx) =>
          `The ${ctx.subject} ${ctx.typeLabel} reacts to IR overlays without banding—such a playground for experimental edits.`,
      ],
    },
    follow: {
      preset: [
        (ctx, to) =>
          `${
            to ? `@${to}` : "Love this"
          }, the magenta edges stay tame so I can push glow without chaos.`,
      ],
      filmsim: [
        (ctx, to) =>
          `${
            to ? `@${to}` : "Totally"
          }, it gives me room to isolate channels and still keep skin believable.`,
      ],
    },
    reply: {
      preset: [
        (ctx, to) =>
          `${
            to ? `@${to}` : "Yep"
          }, try splitting the channels and blending back at 40% opacity—it holds together.`,
      ],
      filmsim: [
        (ctx, to) =>
          `${
            to ? `@${to}` : "Yep"
          }, a sprinkle of grain on top and suddenly it feels like experimental cinema.`,
      ],
    },
  },
  jonas_ember: {
    lead: {
      preset: [
        (ctx) =>
          `Dropped ${ctx.subject} on a series of brutalist facades—the micro-contrast on edges is chef’s kiss.`,
      ],
      filmsim: [
        (ctx) =>
          `The ${ctx.subject} ${ctx.typeLabel} keeps verticals razor sharp while letting skies fall into a clean gradient.`,
      ],
    },
    follow: {
      preset: [
        (ctx, to) =>
          `${
            to ? `@${to}` : "Exactly"
          }, the shadows feel disciplined; no muddy corners even when I crush blacks.`,
      ],
      filmsim: [
        (ctx, to) =>
          `${
            to ? `@${to}` : "Agree"
          }, lines stay honest and the tone curve still lets concrete breathe.`,
      ],
    },
    reply: {
      preset: [
        (ctx, to) =>
          `${
            to ? `@${to}` : "Hey"
          }, throw it at intersecting staircases—those angular highlights pop.`,
      ],
      filmsim: [
        (ctx, to) =>
          `${
            to ? `@${to}` : "Hey"
          }, combine with a tilt-shift and it becomes pure architectural poetry.`,
      ],
    },
  },
  aiko_tanaka: {
    lead: {
      preset: [
        (ctx) =>
          `Took ${ctx.subject} through Shinjuku alleys—the neon bloom lands exactly where I want it.`,
      ],
      filmsim: [
        (ctx) =>
          `The ${ctx.subject} ${ctx.typeLabel} lets cyberpunk purples hum without crushing the just-dark-enough corners.`,
      ],
    },
    follow: {
      preset: [
        (ctx, to) =>
          `${
            to ? `@${to}` : "Totally"
          }, it respects the blue signs and still keeps skin natural under streetlight spill.`,
      ],
      filmsim: [
        (ctx, to) =>
          `${
            to ? `@${to}` : "Same"
          }, it keeps those cobalt mid-tones in check even when I lean into neon pinks.`,
      ],
    },
    reply: {
      preset: [
        (ctx, to) =>
          `${
            to ? `@${to}` : "Yep"
          }, add a slow shutter blur and the glow trails feel cinematic.`,
      ],
      filmsim: [
        (ctx, to) =>
          `${
            to ? `@${to}` : "Yep"
          }, I pair it with a dash of halation in post—total late-night anime energy.`,
      ],
    },
  },
  malik_rhodes: {
    lead: {
      preset: [
        (ctx) =>
          `Ran ${ctx.subject} on a smoky jazz set—the blacks sit velvet-soft while brass highlights stay alive.`,
      ],
      filmsim: [
        (ctx) =>
          `The ${ctx.subject} ${ctx.typeLabel} gives me monochrome grit without strangling stage haze.`,
      ],
    },
    follow: {
      preset: [
        (ctx, to) =>
          `${
            to ? `@${to}` : "For real"
          }, tenor sax reflections stay smooth—no jagged contrast spikes.`,
      ],
      filmsim: [
        (ctx, to) =>
          `${
            to ? `@${to}` : "Absolutely"
          }, it nails that club mood: inky, smoky, and still musical.`,
      ],
    },
    reply: {
      preset: [
        (ctx, to) =>
          `${
            to ? `@${to}` : "Yep"
          }, toss it on a slow blues set and the mood writes itself.`,
      ],
      filmsim: [
        (ctx, to) =>
          `${
            to ? `@${to}` : "Yep"
          }, bump the grain just a hair and it feels archival.`,
      ],
    },
  },
  sofia_marlowe: {
    lead: {
      preset: [
        (ctx) =>
          `Tested ${ctx.subject} wandering a misty pine trail—greens stay muted and the fog keeps its softness.`,
      ],
      filmsim: [
        (ctx) =>
          `The ${ctx.subject} ${ctx.typeLabel} wraps foliage in the gentlest desaturated tones—pure woodland poetry.`,
      ],
    },
    follow: {
      preset: [
        (ctx, to) =>
          `${
            to ? `@${to}` : "Yes"
          }, the moss detail hangs on even when the scene gets drenched.`,
      ],
      filmsim: [
        (ctx, to) =>
          `${
            to ? `@${to}` : "Exactly"
          }, it leans into muted earth tones without going dull.`,
      ],
    },
    reply: {
      preset: [
        (ctx, to) =>
          `${
            to ? `@${to}` : "Yep"
          }, try it right after rainfall—the leaf sheen sparkles softly.`,
      ],
      filmsim: [
        (ctx, to) =>
          `${
            to ? `@${to}` : "Yep"
          }, pair it with a macro lens on ferns and it whispers fairy tale.`,
      ],
    },
  },
  ezra_finch: {
    lead: {
      preset: [
        (ctx) =>
          `Shot ${ctx.subject} downtown—candid laughter and color-blocked signage feel effortlessly cinematic.`,
      ],
      filmsim: [
        (ctx) =>
          `The ${ctx.subject} ${ctx.typeLabel} keeps street chatter bright while the shadows still hum.`,
      ],
    },
    follow: {
      preset: [
        (ctx, to) =>
          `${
            to ? `@${to}` : "Right?"
          }, it rides that balance between pop and grit—perfect for little human moments.`,
      ],
      filmsim: [
        (ctx, to) =>
          `${
            to ? `@${to}` : "For sure"
          }, the grain sits like a subtle chorus rather than noise.`,
      ],
    },
    reply: {
      preset: [
        (ctx, to) =>
          `${
            to ? `@${to}` : "Yep"
          }, grab a low angle near murals—this preset loves bold mixes.`,
      ],
      filmsim: [
        (ctx, to) =>
          `${
            to ? `@${to}` : "Yep"
          }, mix in a gentle push in post and it still sings.`,
      ],
    },
  },
  lila_storm: {
    lead: {
      preset: [
        (ctx) =>
          `Chased a thunderhead with ${ctx.subject}; the skies went electric and the foreground stayed grounded.`,
      ],
      filmsim: [
        (ctx) =>
          `The ${ctx.subject} ${ctx.typeLabel} handles lightning pops without washing out the drama.`,
      ],
    },
    follow: {
      preset: [
        (ctx, to) =>
          `${
            to ? `@${to}` : "Agree"
          }, the cyan shift in those clouds is delicious.`,
      ],
      filmsim: [
        (ctx, to) =>
          `${
            to ? `@${to}` : "Absolutely"
          }, it keeps storm grit intact while the color still roars.`,
      ],
    },
    reply: {
      preset: [
        (ctx, to) =>
          `${
            to ? `@${to}` : "Yep"
          }, throw it at a shelf cloud at ISO 800—the mood is intense but clean.`,
      ],
      filmsim: [
        (ctx, to) =>
          `${
            to ? `@${to}` : "Yep"
          }, try it on a timelapse—every frame feels like a painting.`,
      ],
    },
  },
  hugo_blanc: {
    lead: {
      preset: [
        (ctx) =>
          `Walked Paris in rain with ${ctx.subject}; café lights shimmer just enough while cobbles stay moody.`,
      ],
      filmsim: [
        (ctx) =>
          `The ${ctx.subject} ${ctx.typeLabel} bathes grey mornings in gentle amber—pure rive gauche nostalgia.`,
      ],
    },
    follow: {
      preset: [
        (ctx, to) =>
          `${
            to ? `@${to}` : "Oui"
          }, it respects the drizzle and still shows every umbrella reflection.`,
      ],
      filmsim: [
        (ctx, to) =>
          `${
            to ? `@${to}` : "Exactement"
          }, the grain feels like it belongs in a Godard frame.`,
      ],
    },
    reply: {
      preset: [
        (ctx, to) =>
          `${
            to ? `@${to}` : "Oui"
          }, lean into it at blue hour on the Seine and it's straight poetry.`,
      ],
      filmsim: [
        (ctx, to) =>
          `${
            to ? `@${to}` : "Oui"
          }, a tiny contrast lift and it sings like accordion on a side street.`,
      ],
    },
  },
  isla_meadows: {
    lead: {
      preset: [
        (ctx) =>
          `Styled a plant-filled nook with ${ctx.subject}; it loves gentle greens and morning haze.`,
      ],
      filmsim: [
        (ctx) =>
          `The ${ctx.subject} ${ctx.typeLabel} keeps terracotta warm without flattening the whites of linen curtains.`,
      ],
    },
    follow: {
      preset: [
        (ctx, to) =>
          `${
            to ? `@${to}` : "Yes"
          }, it handles bright windows gracefully so I can stay wide open.`,
      ],
      filmsim: [
        (ctx, to) =>
          `${
            to ? `@${to}` : "Agree"
          }, tabletop ceramics stay creamy—no weird color cast.`,
      ],
    },
    reply: {
      preset: [
        (ctx, to) =>
          `${
            to ? `@${to}` : "Yep"
          }, pair it with eucalyptus and the palette feels spa-level calm.`,
      ],
      filmsim: [
        (ctx, to) =>
          `${
            to ? `@${to}` : "Yep"
          }, try it on diffused afternoon light—plants look dreamy.`,
      ],
    },
  },
  dante_vega: {
    lead: {
      preset: [
        (ctx) =>
          `Took ${ctx.subject} out on a desert ride—chrome and dust both hold detail even mid burn.`,
      ],
      filmsim: [
        (ctx) =>
          `The ${ctx.subject} ${ctx.typeLabel} keeps asphalt cool while sunsets stay fire.`,
      ],
    },
    follow: {
      preset: [
        (ctx, to) =>
          `${
            to ? `@${to}` : "True"
          }, the tonal roll-off lets helmet reflections breathe.`,
      ],
      filmsim: [
        (ctx, to) =>
          `${
            to ? `@${to}` : "Exactly"
          }, it nails that in-between light after the sun dips.`,
      ],
    },
    reply: {
      preset: [
        (ctx, to) =>
          `${
            to ? `@${to}` : "Yep"
          }, toss some dust kicks in the foreground—the preset loves motion.`,
      ],
      filmsim: [
        (ctx, to) =>
          `${
            to ? `@${to}` : "Yep"
          }, if you lower shadows slightly it's pure road-trip cinema.`,
      ],
    },
  },
  mei_lin: {
    lead: {
      preset: [
        (ctx) =>
          `Styled night market snacks with ${ctx.subject}; reds stay appetizing and steam stays translucent.`,
      ],
      filmsim: [
        (ctx) =>
          `The ${ctx.subject} ${ctx.typeLabel} lets glossy sauces pop without oversaturating skin tones.`,
      ],
    },
    follow: {
      preset: [
        (ctx, to) =>
          `${
            to ? `@${to}` : "Yum"
          }, it keeps highlights tight on sesame glaze—no blown speculars.`,
      ],
      filmsim: [
        (ctx, to) =>
          `${
            to ? `@${to}` : "Totally"
          }, dumpling skins stay soft while neon signage still sparkles.`,
      ],
    },
    reply: {
      preset: [
        (ctx, to) =>
          `${
            to ? `@${to}` : "Yep"
          }, add a bounce card with this preset and the food looks editorial.`,
      ],
      filmsim: [
        (ctx, to) =>
          `${
            to ? `@${to}` : "Yep"
          }, try it with handheld macro—it keeps grains delicate.`,
      ],
    },
  },
  omar_solace: {
    lead: {
      preset: [
        (ctx) =>
          `Set up a long exposure rooftop session with ${ctx.subject}; gradients feel like slow synth chords.`,
      ],
      filmsim: [
        (ctx) =>
          `The ${ctx.subject} ${ctx.typeLabel} holds blue-hour trails while keeping the city hum mellow.`,
      ],
    },
    follow: {
      preset: [
        (ctx, to) =>
          `${
            to ? `@${to}` : "Exactly"
          }, it never clips the ambient glow—perfect for ambient album covers.`,
      ],
      filmsim: [
        (ctx, to) =>
          `${
            to ? `@${to}` : "Absolutely"
          }, starbursts stay smooth like pads beneath the lead.`,
      ],
    },
    reply: {
      preset: [
        (ctx, to) =>
          `${
            to ? `@${to}` : "Yep"
          }, combine with a tripod drift and it feels like a sustained note.`,
      ],
      filmsim: [
        (ctx, to) =>
          `${
            to ? `@${to}` : "Yep"
          }, drizzle a little grain and it's instant ambient visualizer.`,
      ],
    },
  },
  freya_north: {
    lead: {
      preset: [
        (ctx) =>
          `Tested ${ctx.subject} in Nordic twilight—the blues stay icy while skin remains gentle.`,
      ],
      filmsim: [
        (ctx) =>
          `The ${ctx.subject} ${ctx.typeLabel} keeps snow shadows teal and honest—no weird magenta creep.`,
      ],
    },
    follow: {
      preset: [
        (ctx, to) =>
          `${
            to ? `@${to}` : "Indeed"
          }, it loves low sun angles—glaciers get that crisp glow.`,
      ],
      filmsim: [
        (ctx, to) =>
          `${
            to ? `@${to}` : "Yes"
          }, the tone curve embraces frost without crushing detail.`,
      ],
    },
    reply: {
      preset: [
        (ctx, to) =>
          `${
            to ? `@${to}` : "Yep"
          }, toss it on reindeer coats at dusk—texture galore.`,
      ],
      filmsim: [
        (ctx, to) =>
          `${
            to ? `@${to}` : "Yep"
          }, pair with a polarizer and it's pure arctic dream.`,
      ],
    },
  },
  luca_marin: {
    lead: {
      preset: [
        (ctx) =>
          `Swam with ${ctx.subject}; aqua gradients stay smooth and the coral retains punch.`,
      ],
      filmsim: [
        (ctx) =>
          `The ${ctx.subject} ${ctx.typeLabel} loves underwater cyan—no weird shifts when the light deepens.`,
      ],
    },
    follow: {
      preset: [
        (ctx, to) =>
          `${
            to ? `@${to}` : "Absolutely"
          }, it keeps skin tones natural even through goggles.`,
      ],
      filmsim: [
        (ctx, to) =>
          `${
            to ? `@${to}` : "True"
          }, bubbles stay silver and not green, which is rare.`,
      ],
    },
    reply: {
      preset: [
        (ctx, to) =>
          `${
            to ? `@${to}` : "Yep"
          }, hit it at 10 meters with a dive light—the blues stay believable.`,
      ],
      filmsim: [
        (ctx, to) =>
          `${
            to ? `@${to}` : "Yep"
          }, stack it with a red filter clip and color correction is easy.`,
      ],
    },
  },
  zahra_noor: {
    lead: {
      preset: [
        (ctx) =>
          `Walked the medina with ${ctx.subject}; saffron and teal tiles shimmer without oversell.`,
      ],
      filmsim: [
        (ctx) =>
          `The ${ctx.subject} ${ctx.typeLabel} keeps artisans' textiles jewel-toned yet grounded.`,
      ],
    },
    follow: {
      preset: [
        (ctx, to) =>
          `${
            to ? `@${to}` : "Yes"
          }, brass and clay stay balanced so the story feels authentic.`,
      ],
      filmsim: [
        (ctx, to) =>
          `${
            to ? `@${to}` : "Absolutely"
          }, it respects the warmth of lanterns without cooking the rest.`,
      ],
    },
    reply: {
      preset: [
        (ctx, to) =>
          `${
            to ? `@${to}` : "Yep"
          }, try it in the dye old city—tones stay regal.`,
      ],
      filmsim: [
        (ctx, to) =>
          `${
            to ? `@${to}` : "Yep"
          }, mix in some shadow play and it feels like a market lullaby.`,
      ],
    },
  },
  quentin_vale: {
    lead: {
      preset: [
        (ctx) =>
          `Ran ${ctx.subject} on a vaporwave rooftop—magenta horizons and cyan shadows snapped into retro focus.`,
      ],
      filmsim: [
        (ctx) =>
          `The ${ctx.subject} ${ctx.typeLabel} is basically analog sci-fi out of the box—halation for days.`,
      ],
    },
    follow: {
      preset: [
        (ctx, to) =>
          `${
            to ? `@${to}` : "Totally"
          }, it keeps gradients smooth enough for animated loops.`,
      ],
      filmsim: [
        (ctx, to) =>
          `${
            to ? `@${to}` : "Exactly"
          }, the blacks fall off like 80s VHS but sharper.`,
      ],
    },
    reply: {
      preset: [
        (ctx, to) =>
          `${
            to ? `@${to}` : "Yep"
          }, toss it on chrome stairwells and it screams synthwave.`,
      ],
      filmsim: [
        (ctx, to) =>
          `${
            to ? `@${to}` : "Yep"
          }, throw in some scan lines in post—instant title sequence.`,
      ],
    },
  },
  hana_bloom: {
    lead: {
      preset: [
        (ctx) =>
          `Photographed ranunculus up close with ${ctx.subject}; petals stay creamy and the greens feel airy.`,
      ],
      filmsim: [
        (ctx) =>
          `The ${ctx.subject} ${ctx.typeLabel} loves macro—bokeh melts without weird color bleed.`,
      ],
    },
    follow: {
      preset: [
        (ctx, to) =>
          `${
            to ? `@${to}` : "Yes"
          }, it respects highlights on delicate petals which is rare.`,
      ],
      filmsim: [
        (ctx, to) =>
          `${
            to ? `@${to}` : "Totally"
          }, pollen detail stays crisp even when I soften everything else.`,
      ],
    },
    reply: {
      preset: [
        (ctx, to) =>
          `${
            to ? `@${to}` : "Yep"
          }, pair it with a spray bottle mist—the sparkle stays elegant.`,
      ],
      filmsim: [
        (ctx, to) =>
          `${
            to ? `@${to}` : "Yep"
          }, add a touch of freelensing and it still holds focus gracefully.`,
      ],
    },
  },
  niko_frost: {
    lead: {
      preset: [
        (ctx) =>
          `Hammered ${ctx.subject} on an alpine ridge—crushed blacks with just enough teal glow in the shadows.`,
      ],
      filmsim: [
        (ctx) =>
          `The ${ctx.subject} ${ctx.typeLabel} keeps glacier blues bold while the peaks stay razor sharp.`,
      ],
    },
    follow: {
      preset: [
        (ctx, to) =>
          `${
            to ? `@${to}` : "Exactly"
          }, it makes breath fog look intentional, not messy.`,
      ],
      filmsim: [
        (ctx, to) =>
          `${
            to ? `@${to}` : "Right?"
          }, it holds detail in snowpack even when the sun flares.`,
      ],
    },
    reply: {
      preset: [
        (ctx, to) =>
          `${
            to ? `@${to}` : "Yep"
          }, drop it on a ridge-line panorama and it feels epic.`,
      ],
      filmsim: [
        (ctx, to) =>
          `${
            to ? `@${to}` : "Yep"
          }, toss in a touch of clarity and it stays crisp, never brittle.`,
      ],
    },
  },
};

const personaUsernames = Object.keys(personaScripts);

const randomBetween = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

function pickScript(username, role, type) {
  const persona = personaScripts[username];
  if (!persona) return null;
  const options = persona[role]?.[type];
  if (!options || options.length === 0) return null;
  return options[randomBetween(0, options.length - 1)];
}

function buildContent(username, role, type, context, targetUsername) {
  const script = pickScript(username, role, type);
  if (script) {
    return script(context, targetUsername);
  }
  if (role === "lead") {
    return `Has anyone else tried the ${context.subject} ${context.typeLabel}? I'm loving how it handles color.`;
  }
  if (role === "follow") {
    return `${targetUsername ? `@${targetUsername}` : "Same here"}, the ${
      context.subject
    } ${context.typeLabel} surprises me every time.`;
  }
  return `${
    targetUsername ? `@${targetUsername}` : "Totally"
  }, appreciate the breakdown—it lines up with my tests too.`;
}

function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function selectParticipants(userDocs, preferredUser, count) {
  const pool = shuffle(userDocs);
  const selected = [];

  if (preferredUser) {
    const matchIndex = pool.findIndex(
      (user) => user.username === preferredUser.username
    );
    if (matchIndex >= 0) {
      selected.push(pool.splice(matchIndex, 1)[0]);
    }
  }

  while (selected.length < count && pool.length > 0) {
    selected.push(pool.pop());
  }

  return selected;
}

async function seedDiscussionPosts() {
  try {
    console.log(`Connecting to MongoDB: ${MONGO_URI}`);
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    const users = await User.find({
      username: { $in: personaUsernames },
    })
      .select(["username", "avatar"])
      .lean();

    if (!users.length) {
      console.warn("No persona users found. Seed the users first.");
      return;
    }

    const userMap = users.reduce((acc, user) => {
      acc[user.username] = user;
      return acc;
    }, {});

    const discussions = await Discussion.find({})
      .populate({ path: "createdBy", select: ["username", "avatar"] })
      .exec();

    const presetIds = [];
    const filmSimIds = [];

    discussions.forEach((discussion) => {
      if (discussion.linkedTo?.refId) {
        if (discussion.linkedTo.type === "preset") {
          presetIds.push(discussion.linkedTo.refId);
        } else if (discussion.linkedTo.type === "filmsim") {
          filmSimIds.push(discussion.linkedTo.refId);
        }
      }
    });

    const presetMap = new Map(
      (
        await Preset.find({ _id: { $in: presetIds } })
          .select(["title"])
          .lean()
      ).map((doc) => [doc._id.toString(), doc])
    );
    const filmSimMap = new Map(
      (
        await FilmSim.find({ _id: { $in: filmSimIds } })
          .select(["name"])
          .lean()
      ).map((doc) => [doc._id.toString(), doc])
    );

    let updatedCount = 0;

    for (const discussion of discussions) {
      if (!discussion.linkedTo?.refId) {
        continue;
      }
      if (discussion.posts && discussion.posts.length > 0) {
        continue;
      }

      const type = discussion.linkedTo.type;
      const refId = discussion.linkedTo.refId.toString();
      const subjectDoc =
        type === "preset" ? presetMap.get(refId) : filmSimMap.get(refId);

      if (!subjectDoc) {
        continue;
      }

      const subject = type === "preset" ? subjectDoc.title : subjectDoc.name;
      const context = {
        subject,
        type,
        typeLabel: type === "preset" ? "preset" : "film sim",
      };

      const createdByUsername = discussion.createdBy?.username;
      const preferredUser =
        createdByUsername && userMap[createdByUsername]
          ? userMap[createdByUsername]
          : null;

      const participants = selectParticipants(users, preferredUser, 3);

      if (participants.length < 2) {
        continue;
      }

      const conversationStart =
        Date.now() - randomBetween(3, 18) * 60 * 60 * 1000;
      let currentTime = conversationStart;

      const posts = participants.map((participant, index) => {
        const role = index === 0 ? "lead" : "follow";
        const target = index === 0 ? null : participants[index - 1].username;
        const content = buildContent(
          participant.username,
          role,
          type,
          context,
          target
        );

        const post = {
          userId: participant._id,
          username: participant.username,
          avatar: participant.avatar || "",
          content,
          timestamp: new Date(currentTime),
          replies: [],
        };

        currentTime += randomBetween(6, 22) * 60 * 1000;
        return post;
      });

      if (posts.length >= 2) {
        const replyAuthor =
          participants[3] ||
          (preferredUser && participants[0].username !== preferredUser.username
            ? preferredUser
            : participants[0]);

        const replyUser =
          replyAuthor && userMap[replyAuthor.username]
            ? userMap[replyAuthor.username]
            : replyAuthor;

        if (replyUser) {
          const replyContent = buildContent(
            replyUser.username,
            "reply",
            type,
            context,
            posts[1].username
          );

          posts[1].replies.push({
            userId: replyUser._id,
            username: replyUser.username,
            avatar: replyUser.avatar || "",
            content: replyContent,
            timestamp: new Date(currentTime + randomBetween(3, 12) * 60 * 1000),
            isEdited: false,
          });
        }
      }

      const followerIds = new Set(
        (discussion.followers || []).map((follower) => follower.toString())
      );
      posts.forEach((post) => {
        followerIds.add(post.userId.toString());
        post.replies.forEach((reply) => {
          followerIds.add(reply.userId.toString());
        });
      });

      discussion.posts = posts;
      discussion.followers = Array.from(followerIds);
      discussion.markModified("posts");
      discussion.markModified("followers");
      await discussion.save();
      updatedCount += 1;
    }

    console.log(
      `Seeded conversational posts for ${updatedCount} discussion${
        updatedCount === 1 ? "" : "s"
      }.`
    );
  } catch (error) {
    console.error("Error seeding discussion posts:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

seedDiscussionPosts();
