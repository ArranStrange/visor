import React from "react";
import { Box, Typography, Container } from "@mui/material";
import { useQuery } from "@apollo/client";
import { GET_FEATURED_ITEMS } from "../../graphql/queries/getFeaturedItems";
import ListRow from "../lists/ListRow";

const FeaturedCardsGrid: React.FC = () => {
  const { data, loading } = useQuery(GET_FEATURED_ITEMS);

  if (loading) {
    return null;
  }

  const featuredLists = data?.featuredUserLists || [];

  // Combine all featured items and sort by creation date or randomize
  const allFeaturedItems = [
    ...featuredLists.map((list: any) => ({ ...list, type: "list" })),
  ];

  if (allFeaturedItems.length === 0) {
    return null;
  }

  return (
    <Box sx={{ mb: 6 }}>
      <Container maxWidth="lg">
        <Typography
          variant="h4"
          fontWeight="bold"
          sx={{ mb: 4, textAlign: "center" }}
        >
          Featured Content
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(3, 1fr)",
              lg: "repeat(4, 1fr)",
            },
            gap: 3,
          }}
        >
          {allFeaturedItems.map((item: any, index: number) => {
            if (item.type === "list") {
              return (
                <Box
                  key={`featured-list-${item.id}-${index}`}
                  sx={{ gridColumn: { xs: "1", md: "span 2" } }}
                >
                  <ListRow
                    id={item.id}
                    name={item.name}
                    description={item.description}
                    owner={item.owner}
                    isFeatured={item.isFeatured}
                    presets={item.presets}
                    filmSims={item.filmSims}
                  />
                </Box>
              );
            }
            return null;
          })}
        </Box>
      </Container>
    </Box>
  );
};

export default FeaturedCardsGrid;
