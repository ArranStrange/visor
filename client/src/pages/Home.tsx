import React from "react";
import { Container } from "@mui/material";
import ContentTypeToggle from "../components/ui/ContentTypeToggle";
import FeaturedSection from "../components/ui/FeaturedSection";
import { useContentType } from "../context/ContentTypeFilter";
import ContentGridLoader from "../components/ui/ContentGridLoader";

const HomePage: React.FC = () => {
  const { contentType } = useContentType();

  return (
    <Container
      maxWidth="xl"
      sx={{
        mt: 2,
        mb: 6,
        width: "100%",
        maxWidth: "100vw",
        px: { xs: 2, sm: 3, md: 4 }, // Responsive padding
      }}
    >
      <FeaturedSection />
      <ContentTypeToggle />
      <ContentGridLoader contentType={contentType} />
    </Container>
  );
};

export default HomePage;
