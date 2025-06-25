import React from "react";
import { useQuery } from "@apollo/client";
import {
  Container,
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Stack,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Divider,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { gql } from "@apollo/client";
import ListIcon from "@mui/icons-material/List";
import AddIcon from "@mui/icons-material/Add";
import { useAuth } from "../context/AuthContext";

interface UserList {
  id: string;
  name: string;
  description?: string;
  isPublic: boolean;
  owner: {
    id: string;
    username: string;
  };
  presets: Array<{
    id: string;
    title: string;
    slug: string;
  }>;
  filmSims: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  createdAt?: string;
  updatedAt?: string;
}

const GET_USER_LISTS = gql`
  query GetUserLists($userId: ID!) {
    getUserLists(userId: $userId) {
      id
      name
      description
      isPublic
      owner {
        id
        username
      }
      presets {
        id
        title
        slug
      }
      filmSims {
        id
        name
        slug
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
      userId: currentUser?.id,
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
    onCompleted: (data) => {
      console.log("GraphQL query completed successfully:", data);
      console.log("Lists data:", data?.getUserLists);
    },
  });

  // Debug log to check query variables
  console.log("Query variables:", { userId: currentUser?.id });

  const handleListClick = (listId: string) => {
    console.log("List clicked:", listId);
    console.log("Navigating to:", `/list/${listId}`);
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

  const lists: UserList[] = data?.getUserLists || [];

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

        {lists.length === 0 ? (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            minHeight="400px"
            textAlign="center"
          >
            <ListIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No lists yet
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Create your first list to organize your favorite presets and film
              simulations.
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateList}
            >
              Create Your First List
            </Button>
          </Box>
        ) : (
          <List
            sx={{ bgcolor: "background.paper", borderRadius: 2, boxShadow: 1 }}
          >
            {lists.map((list, index) => (
              <React.Fragment key={list.id}>
                <ListItem disablePadding>
                  <ListItemButton onClick={() => handleListClick(list.id)}>
                    <ListItemText
                      primary={
                        <Box
                          display="flex"
                          alignItems="center"
                          gap={1}
                          component="span"
                        >
                          <ListIcon color="primary" />
                          <Typography variant="h6" component="span">
                            {list.name}
                          </Typography>
                          {list.isPublic && (
                            <Chip size="small" label="Public" color="primary" />
                          )}
                          {!list.isPublic && (
                            <Chip
                              size="small"
                              label="Private"
                              color="default"
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box component="span">
                          {list.description && (
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              component="span"
                              sx={{ display: "block", mb: 1 }}
                            >
                              {list.description}
                            </Typography>
                          )}
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            component="span"
                          >
                            {list.presets?.length || 0} presets •{" "}
                            {list.filmSims?.length || 0} film sims
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItemButton>
                </ListItem>
                {index < lists.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Stack>
    </Container>
  );
};

export default Lists;
