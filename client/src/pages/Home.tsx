import React from "react";
import { Box, Container, Typography, Grid } from "@mui/material";
import PresetCard from "../components/PresetCard";
import FilmSimCard from "../components/FilmSimCard";

export const presets = [
  {
    id: "shadow-hunter",
    title: "Shadow Hunter",
    thumbnail:
      "https://images.squarespace-cdn.com/content/v1/554e1c83e4b08a0248ca70c4/728208ef-7f9e-4ad4-bf0e-668de566221d/twitter-12-5.jpg",
    tags: ["shadow", "contrast", "street"],
    creator: { username: "leah" },
  },
  {
    id: "golden-hour",
    title: "Golden Hour Glow",
    thumbnail:
      "https://fujifilm-x.b-cdn.net/wp-content/uploads/sites/11/2023/06/EC-STREET-PHOTOGRAPHY-ULTIMATE-GUIDE-3.jpg?width&height",
    tags: ["warm", "sunset", "portrait"],
    creator: {
      username: "arran",
      avatarUrl: "/avatars/arran.png",
    },
  },
  {
    id: "cinematic-mood",
    title: "Cinematic Mood",
    thumbnail:
      "https://fujilove.com/wp-content/uploads/2019/04/fujifilm-gfx-gf-110mm-xf-56mm-street-photography-opener.jpg",
    tags: ["moody", "filmic", "night"],
    creator: { username: "nina" },
  },
  {
    id: "matte-soft",
    title: "Matte Soft Fade",
    thumbnail:
      "https://independent-photo.com/wp-content/uploads/2019/01/Man-And-Dog-1980-Jamel-Shabazz-1791x1200.jpg",
    tags: ["muted", "flat", "indoor"],
    creator: { username: "jamal" },
  },
  {
    id: "blue-haze",
    title: "Blue Haze",
    thumbnail:
      "https://images.squarespace-cdn.com/content/v1/53a2b3a1e4b0a5020bebe676/1611752063818-QWUZI3W92KLAXS66EIPT/london-street-photography-00008.jpg",
    tags: ["cool", "urban", "blue tones"],
    creator: { username: "emily" },
  },
  {
    id: "bw-crunch",
    title: "B&W Crunch",
    thumbnail:
      "https://independent-photo.com/wp-content/uploads/2020/09/richard-sandler-01-scaled.jpg",
    tags: ["black & white", "grainy", "harsh"],
    creator: { username: "theo" },
  },
  {
    id: "neon-glow",
    title: "Neon Glow",
    thumbnail:
      "https://streetphotographyberlin.com/wp-content/uploads/2023/08/pexels-pixabay-315191.jpg",
    tags: ["vibrant", "night", "urban"],
    creator: { username: "suki" },
  },
  {
    id: "soft-dream",
    title: "Soft Dream",
    thumbnail:
      "https://cdn.shopify.com/s/files/1/0150/3760/files/MG_1388_1.jpg?v=1551491095",
    tags: ["pastel", "dreamy", "landscape"],
    creator: { username: "alex" },
  },
  {
    id: "vintage-fade",
    title: "Vintage Fade",
    thumbnail:
      "https://reformedfilmlab.com/cdn/shop/articles/Street_Photography.jpg?v=1642503461",
    tags: ["retro", "film", "colour wash"],
    creator: { username: "marie" },
  },
  {
    id: "desert-contrast",
    title: "Desert Contrast",
    thumbnail:
      "https://streetberlin.net/wp-content/uploads/2018/06/martin-waltz-street-photography-berlin2-2.jpg",
    tags: ["contrast", "sunlight", "travel"],
    creator: { username: "tom" },
  },
];

export const filmSims = [
  {
    id: "kodak-ultramax",
    title: "Kodak Ultramax 400",
    thumbnail:
      "https://images.squarespace-cdn.com/content/v1/5ebc5b0285bdc72d1aee199d/1683119397074-X4H4PQ3WLGCFKYSAFEIG/street_photography_tokyo-52.jpg",
    tags: ["vintage", "portrait"],
    toneProfile: "Warm tones, soft contrast",
  },
  {
    id: "acros",
    title: "Fujifilm Acros",
    thumbnail:
      "https://images.squarespace-cdn.com/content/v1/576b017229687f1fd26b9117/1472061508403-5LTRDX3NZ7WZLLH3T7D7/image-asset.jpeg",
    tags: ["black & white", "grainy"],
    toneProfile: "High contrast monochrome",
  },
  {
    id: "classic-chrome",
    title: "Classic Chrome",
    thumbnail:
      "https://www.thephoblographer.com/wp-content/uploads/2013/03/Chris-Gampat-The-Phoblographer-Fujifilm-X100s-street-photography-images-1-of-12ISO-4001-320-sec-at-f-5.6.jpg",
    tags: ["muted", "street"],
    toneProfile: "Desaturated shadows, blue-grey tones",
  },
  {
    id: "velvia-vivid",
    title: "Velvia Vivid",
    thumbnail:
      "https://fujifilm-x.b-cdn.net/wp-content/uploads/sites/16/2023/12/LEARNING-CENTRE-STREET-AT-NIGHT-FEATURED.jpg?width&height",
    tags: ["landscape", "vibrant"],
    toneProfile: "Punchy saturation and contrast",
  },
  {
    id: "portra-160",
    title: "Kodak Portra 160",
    thumbnail:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR23pjBYP53qKRL-8fabGsNe-5P-bIbp1v8Ew&s",
    tags: ["natural", "portrait"],
    toneProfile: "Neutral skin tones, soft colour",
  },
  {
    id: "provia",
    title: "Fujifilm Provia",
    thumbnail:
      "https://i0.wp.com/nicoharoldphotography.com/wp-content/uploads/2020/11/X1009647-2.jpg?fit=1230%2C820&ssl=1",
    tags: ["balanced", "travel"],
    toneProfile: "Neutral contrast, balanced saturation",
  },
  {
    id: "ilford-delta",
    title: "Ilford Delta 3200",
    thumbnail:
      "https://fujifilm-x.b-cdn.net/wp-content/uploads/sites/11/2020/06/EXPOSURE_CENTER_Athena_Rinzi-Ruiz_Finding-Poetry-in-the-Motion_7.jpg?width&height",
    tags: ["b&w", "grainy", "low light"],
    toneProfile: "High grain, great for night or ambient light",
  },
  {
    id: "ektar",
    title: "Kodak Ektar 100",
    thumbnail:
      "https://images.squarespace-cdn.com/content/v1/6253c0a34c71c941801fde7c/1722615500719-YHXWWQ8QWQ4SCE8E0SHO/best-camera-for-street-photography-lead.jpg",
    tags: ["colour pop", "outdoor"],
    toneProfile: "Very high saturation and detail",
  },
  {
    id: "xp2",
    title: "Ilford XP2 Super",
    thumbnail:
      "https://yorkplacestudios.co.uk/wp-content/uploads/2019/11/fujifilm-x-pro3-mexico-street-photography-1-1024x683.jpg",
    tags: ["b&w", "smooth"],
    toneProfile: "Smooth monochrome with fine grain",
  },
  {
    id: "superia",
    title: "Fujifilm Superia 400",
    thumbnail:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTG9imfJeFiUupVCqFQTzj3uESNBB17DKMMtw&s",
    tags: ["consumer", "street", "film feel"],
    toneProfile: "Classic Fuji greens, balanced everyday look",
  },
];

const cardGridStyles = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  justifyContent: "space-between",
  gap: 5,
};

const cardMasonryStyles = {
  columnCount: {
    xs: 2,
    md: 4,
  },
  columnGap: 5,
};

const cardItemStyles = {
  breakInside: "avoid",
  mb: 2,
  width: "100%",
};

const HomePage: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 2, mb: 50 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Featured Lightroom Presets
      </Typography>
      <Box sx={cardMasonryStyles}>
        {presets.map((preset) => (
          <Box key={preset.id} sx={cardItemStyles}>
            <PresetCard {...preset} />
          </Box>
        ))}
      </Box>
      <Box mt={6}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Featured Fujifilm Film Simulations
        </Typography>

        <Box sx={cardMasonryStyles}>
          {filmSims.map((sim) => (
            <Box key={sim.id} sx={cardItemStyles}>
              <FilmSimCard {...sim} />
            </Box>
          ))}
        </Box>
      </Box>
    </Container>
  );
};

export default HomePage;
