import React from "react";
import { Container } from "@mui/material";
import ContentTypeToggle from "../components/ContentTypeToggle";
import { useContentType } from "../context/ContentTypeFilter";
import ContentGridLoader from "../components/ContentGridLoader";

const HomePage: React.FC = () => {
  const { contentType } = useContentType();

  return (
    <Container maxWidth="xl" sx={{ mt: 2, mb: 6 }}>
      <ContentTypeToggle />
      <ContentGridLoader contentType={contentType} />
    </Container>
  );
};

export default HomePage;
