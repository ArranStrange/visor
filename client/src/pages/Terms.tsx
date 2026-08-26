import React from "react";
import { Container, Divider, Link, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

const LAST_UPDATED = "26 August 2026";

/**
 * Plain-language terms. Deliberately not lazy-loaded: it is a tiny page that
 * crawlers and anyone checking before signing up should get immediately.
 *
 * NOTE: first draft, pending review by the maintainer.
 */
const Terms: React.FC = () => (
  <Container maxWidth="md" sx={{ py: 8 }}>
    <Stack spacing={3}>
      <Stack spacing={1}>
        <Typography variant="h3" component="h1" fontWeight="bold">
          Terms of Use
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Last updated {LAST_UPDATED}
        </Typography>
      </Stack>

      <Divider />

      <Typography color="text.secondary">
        VISOR is a community site for sharing Fujifilm film simulation recipes
        and Lightroom presets. It is run by one person as a personal project, not
        a company. These terms are meant to be readable rather than exhaustive.
      </Typography>

      <Typography variant="h5" component="h2" fontWeight="bold">
        Your account
      </Typography>
      <Typography color="text.secondary">
        You need a verified email address to upload, save or comment. Keep your
        password to yourself — anyone who has it can act as you. You can delete
        your account at any time from your profile settings.
      </Typography>

      <Typography variant="h5" component="h2" fontWeight="bold">
        What you post
      </Typography>
      <Typography color="text.secondary">
        You keep ownership of the recipes, presets, photos and words you upload.
        By posting them you allow VISOR to display them on the site and let other
        users view, save and use them. Only upload work that is yours to share,
        and credit the people whose looks you adapted.
      </Typography>
      <Typography color="text.secondary">
        Camera settings themselves are not really ownable — a list of numbers you
        dial into a camera is a recipe, not a painting. The description, sample
        photos and preset files you attach to it are yours.
      </Typography>

      <Typography variant="h5" component="h2" fontWeight="bold">
        Things not to do
      </Typography>
      <Typography color="text.secondary">
        Don't upload other people's work as your own, post anything unlawful or
        abusive, harass other users, scrape the site, or try to break it. Content
        and accounts that do these things get removed.
      </Typography>

      <Typography variant="h5" component="h2" fontWeight="bold">
        No guarantees
      </Typography>
      <Typography color="text.secondary">
        VISOR is provided as-is and free of charge. It might go down, lose data,
        or change. Recipes are shared by users and are not verified by Fujifilm —
        results vary by camera, firmware and light. Nothing here is affiliated
        with or endorsed by Fujifilm.
      </Typography>

      <Typography variant="h5" component="h2" fontWeight="bold">
        Changes
      </Typography>
      <Typography color="text.secondary">
        If these terms change in a way that matters, the date at the top changes
        with them.
      </Typography>

      <Divider />

      <Typography variant="body2" color="text.secondary">
        See also our{" "}
        <Link component={RouterLink} to="/privacy">
          privacy policy
        </Link>
        .
      </Typography>
    </Stack>
  </Container>
);

export default Terms;
