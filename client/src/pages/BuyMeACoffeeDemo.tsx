import React from "react";
import { Container, Typography, Box } from "@mui/material";
import BuyMeACoffeeCard from "../components/BuyMeACoffeeCard";
import StaggeredGrid from "../components/StaggeredGrid";

const BuyMeACoffeeDemo: React.FC = () => {
  return (
    <Container
      maxWidth="xl"
      sx={{
        mt: 2,
        mb: 6,
        width: "100%",
        maxWidth: "100vw",
        px: { xs: 2, sm: 3, md: 4 },
      }}
    >
      <Typography variant="h4" component="h1" gutterBottom>
        Buy Me a Coffee Card Demo
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        This is a demo of the Buy Me a Coffee card component. Click on the card
        to open the Buy Me a Coffee link.
      </Typography>

      <Box sx={{ width: "100%", maxWidth: "100vw", overflow: "hidden" }}>
        <StaggeredGrid
          loading={false}
          onLoadMore={() => {}}
          hasMore={false}
          isLoading={false}
          randomizeOrder={false}
        >
          {[<BuyMeACoffeeCard key="buymeacoffee" />]}
        </StaggeredGrid>
      </Box>
    </Container>
  );
};

export default BuyMeACoffeeDemo;
