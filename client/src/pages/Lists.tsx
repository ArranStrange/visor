import React from "react";
import { useQuery } from "@apollo/client";
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Button,
  CircularProgress,
  Alert,
  Stack,
  Chip,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { gql } from "@apollo/client";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ListIcon from "@mui/icons-material/List";
import AddIcon from "@mui/icons-material/Add";
import { useAuth } from "../context/AuthContext";
import StaggeredGrid from "../components/StaggeredGrid";

const GET_USER_LISTS = gql`
  query GetUserLists($userId: ID!) {
    getUserLists(userId: $userId) {
      id
      name
      description
      isPublic
      isFavouriteList
      owner {
        id
        username
        avatar
      }
      presets {
        id
        title
        slug
        sampleImages {
          id
          url
        }
      }
      filmSims {
        id
        name
        slug
        sampleImages {
          id
          url
        }
      }
      collaborators {
        id
        username
        avatar
      }
      createdAt
      updatedAt
    }
  }
`;

const Lists: React.FC = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  // Debug log to check user data
  console.log("Current user:", currentUser);

  const { loading, error, data } = useQuery(GET_USER_LISTS, {
    variables: {
      userId: currentUser?.id, // The server expects the ID field
    },
    skip: !currentUser?.id,
    onError: (error) => {
      console.error("GraphQL Error:", error);
      console.error("Error details:", {
        message: error.message,
        networkError: error.networkError,
        graphQLErrors: error.graphQLErrors,
      });
    },
  });

  // Debug log to check query variables
  console.log("Query variables:", { userId: currentUser?.id });

  const handleListClick = (listId: string) => {
    navigate(`/list/${listId}`);
  };

  const handleCreateList = () => {
    navigate(`/create-list`);
  };

  if (!currentUser) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="info">Please log in to view your lists.</Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    console.error("GraphQL Error:", error);
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">
          Error loading lists: {error.message}
          <br />
          <Typography variant="caption">User ID: {currentUser?.id}</Typography>
        </Alert>
      </Container>
    );
  }

  const renderListCard = (list: any) => {
    // Get the first preset or film sim thumbnail for the card
    const thumbnailUrl =
      list.presets?.[0]?.sampleImages?.[0]?.url ||
      list.filmSims?.[0]?.sampleImages?.[0]?.url ||
      "/default-list-thumbnail.jpg";

    return (
      <Card
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          cursor: "pointer",
          transition: "transform 0.2s ease-in-out",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: 3,
          },
        }}
        onClick={() => handleListClick(list.id)}
      >
        <CardMedia
          component="img"
          height="200"
          image={thumbnailUrl}
          alt={list.name}
          sx={{ objectFit: "cover" }}
        />
        <CardContent sx={{ flexGrow: 1 }}>
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            {list.isFavouriteList ? (
              <FavoriteIcon color="primary" />
            ) : (
              <ListIcon color="primary" />
            )}
            <Typography variant="h6" component="div">
              {list.name}
            </Typography>
            {list.isPublic && (
              <Chip size="small" label="Public" color="primary" />
            )}
            {!list.isPublic && (
              <Chip size="small" label="Private" color="default" />
            )}
          </Box>
          {list.description && (
            <Typography variant="body2" color="text.secondary" mb={1}>
              {list.description}
            </Typography>
          )}
          <Typography variant="body2" color="text.secondary">
            {list.presets?.length || 0} presets • {list.filmSims?.length || 0}{" "}
            film sims
          </Typography>
        </CardContent>
      </Card>
    );
  };

  const lists = data?.getUserLists || [];
  const favoritesList = lists.find((list: any) => list.isFavouriteList);
  const customLists = lists.filter((list: any) => !list.isFavouriteList);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Stack spacing={4}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h4" component="h1">
            My Lists
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateList}
          >
            Create New List
          </Button>
        </Box>

        <StaggeredGrid>
          {favoritesList && renderListCard(favoritesList)}
          {customLists.map((list) => renderListCard(list))}
        </StaggeredGrid>
      </Stack>
    </Container>
  );
};

export default Lists;
