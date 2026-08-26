import React from "react";
import { Container, Divider, Link, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

const LAST_UPDATED = "26 August 2026";

/**
 * Plain-language privacy policy. Not lazy-loaded — see Terms.tsx.
 *
 * NOTE: first draft, pending review by the maintainer. The deletion section is
 * written to match what tombstoneAccount actually does — content is kept but
 * anonymised (including the name and avatar copied onto discussion posts),
 * while the Cloudinary image files themselves are not deleted.
 */
const Privacy: React.FC = () => (
  <Container maxWidth="md" sx={{ py: 8 }}>
    <Stack spacing={3}>
      <Stack spacing={1}>
        <Typography variant="h3" component="h1" fontWeight="bold">
          Privacy
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Last updated {LAST_UPDATED}
        </Typography>
      </Stack>

      <Divider />

      <Typography color="text.secondary">
        VISOR is a personal project run by one person. It does not sell data,
        show ads, or track you across other websites. This page says what is
        stored and why.
      </Typography>

      <Typography variant="h5" component="h2" fontWeight="bold">
        What we store
      </Typography>
      <Typography color="text.secondary">
        Your username, email address and a hashed version of your password.
        Anything you choose to add to your profile — bio, avatar, Instagram
        handle, the cameras you shoot. Whatever you upload: recipes, presets,
        sample photos, lists, comments and discussion posts. Your private camera
        loadouts. Notifications addressed to you.
      </Typography>
      <Typography color="text.secondary">
        Passwords are stored as bcrypt hashes and cannot be read back. Email
        verification and password reset links are stored only as hashes, so even
        a database copy does not let anyone reset your password.
      </Typography>

      <Typography variant="h5" component="h2" fontWeight="bold">
        Who else sees it
      </Typography>
      <Typography color="text.secondary">
        Three services, each doing one job: MongoDB Atlas stores the database,
        Cloudinary stores and serves uploaded images, and SendGrid sends the
        verification and password reset emails. Your email address goes to
        SendGrid only so it can deliver those messages.
      </Typography>

      <Typography variant="h5" component="h2" fontWeight="bold">
        What is public
      </Typography>
      <Typography color="text.secondary">
        Your username, avatar, bio, Instagram handle, gear list, uploads and any
        public lists are visible to anyone. Your email address, password and
        camera loadouts are not. Lists you mark private stay private.
      </Typography>

      <Typography variant="h5" component="h2" fontWeight="bold">
        Deleting your account
      </Typography>
      <Typography color="text.secondary">
        You can delete your account from your profile settings. Doing so removes
        your email address, profile details and private loadouts, and detaches
        your name from everything you posted, including the name and avatar
        shown on your discussion posts. Recipes, presets and discussion posts
        themselves stay on the site, attributed to a deleted user — otherwise
        conversations other people took part in would fall apart. Image files
        already uploaded may remain on Cloudinary; get in touch if you need one
        taken down.
      </Typography>

      <Typography variant="h5" component="h2" fontWeight="bold">
        Cookies and tracking
      </Typography>
      <Typography color="text.secondary">
        No advertising or analytics cookies. Your login token is kept in your
        own browser's local storage and sent to VISOR with each request to keep
        you signed in — it goes nowhere else. Display preferences are stored in
        your browser; your primary camera is also saved to your profile so it
        follows you between devices.
      </Typography>

      <Typography variant="h5" component="h2" fontWeight="bold">
        Getting in touch
      </Typography>
      <Typography color="text.secondary">
        If you want a copy of your data, a correction, or something removed,
        email the address on the VISOR GitHub repository and it will be handled
        by hand.
      </Typography>

      <Divider />

      <Typography variant="body2" color="text.secondary">
        See also our{" "}
        <Link component={RouterLink} to="/terms">
          terms of use
        </Link>
        .
      </Typography>
    </Stack>
  </Container>
);

export default Privacy;
