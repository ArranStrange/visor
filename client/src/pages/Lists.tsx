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
  Grid,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { gql } from "@apollo/client";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ListIcon from "@mui/icons-material/List";
import AddIcon from "@mui/icons-material/Add";
import { useAuth } from "../context/AuthContext";

const GET_USER_LISTS = gql`
  query GetUserLists($username: String!) {
    getUser(username: $username) {
      id
      username
      favouriteLists {
        id
        name
        description
        isPublic
        presets {
          id
          title
          slug
          thumbnailUrl
        }
        filmSims {
          id
          name
          slug
          thumbnailUrl
        }
      }
      customLists {
        id
        name
        description
        isPublic
        presets {
          id
          title
          slug
          thumbnailUrl
        }
        filmSims {
          id
          name
          slug
          thumbnailUrl
        }
      }
    }
  }
`;

const Lists: React.FC = () => {
  const navigate = useNavigate();
  const { username } = useParams<{ username: string }>();
  const { user: currentUser } = useAuth();
  const { loading, error, data } = useQuery(GET_USER_LISTS, {
    variables: { username },
  });

  const handleListClick = (listId: string) => {
    navigate(`/list/${listId}`);
  };

  const handleCreateList = () => {
    navigate(`/create-list`);
  };

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
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">Error loading lists: {error.message}</Alert>
      </Container>
    );
  }

  const user = data?.getUser;
  const isOwnProfile = currentUser?.username === username;

  const renderListCard = (list: any, type: "favourite" | "custom") => {
    // Skip private lists if viewing someone else's profile
    if (!isOwnProfile && !list.isPublic) {
      return null;
    }

    // Get the first preset or film sim thumbnail for the card
    const thumbnailUrl =
      list.presets?.[0]?.thumbnailUrl ||
      list.filmSims?.[0]?.thumbnailUrl ||
      "/default-list-thumbnail.jpg";

    return (
      <Card
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          cursor: "pointer",
          "&:hover": {
            transform: "translateY(-4px)",
            transition: "transform 0.2s ease-in-out",
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
            {type === "favourite" ? (
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

  const renderListsSection = (
    lists: any[],
    type: "favourite" | "custom",
    title: string
  ) => {
    const filteredLists = isOwnProfile
      ? lists
      : lists.filter((list) => list.isPublic);

    if (filteredLists.length === 0) {
      return (
        <Grid item xs={12}>
          <Card sx={{ p: 3, textAlign: "center" }}>
            <Typography color="text.secondary">
              {isOwnProfile
                ? `No ${type} lists yet. Create one to get started!`
                : `No public ${type} lists available.`}
            </Typography>
          </Card>
        </Grid>
      );
    }

    return filteredLists.map((list) => (
      <Grid item xs={12} sm={6} md={4} key={list.id}>
        {renderListCard(list, type)}
      </Grid>
    ));
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Stack spacing={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          {isOwnProfile ? "My Lists" : `${user?.username}'s Lists`}
        </Typography>

        {/* Favourite Lists Section */}
        <Box>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography variant="h5" component="h2">
              Favourite Lists
            </Typography>
            {isOwnProfile && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleCreateList}
              >
                Create Favourite List
              </Button>
            )}
          </Box>
          <Grid container spacing={3}>
            {renderListsSection(
              user?.favouriteLists || [],
              "favourite",
              "Favourite Lists"
            )}
          </Grid>
        </Box>

        {/* Custom Lists Section */}
        <Box>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography variant="h5" component="h2">
              Custom Lists
            </Typography>
            {isOwnProfile && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleCreateList}
              >
                Create Custom List
              </Button>
            )}
          </Box>
          <Grid container spacing={3}>
            {renderListsSection(
              user?.customLists || [],
              "custom",
              "Custom Lists"
            )}
          </Grid>
        </Box>
      </Stack>
    </Container>
  );
};

export default Lists;
