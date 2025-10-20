import React from "react";
import { useQuery } from "@apollo/client";
import {
  Container,
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { gql } from "@apollo/client";
import ListIcon from "@mui/icons-material/List";
import AddIcon from "@mui/icons-material/Add";
import { useAuth } from "../context/AuthContext";
import ListRow from "../components/lists/ListRow";

interface UserList {
  id: string;
  name: string;
  description?: string;
  isPublic: boolean;
  isFeatured?: boolean;
  owner: {
    id: string;
    username: string;
    avatar?: string;
  };
  presets: Array<{
    id: string;
    title: string;
    slug: string;
    afterImage?: {
      url: string;
    };
  }>;
  filmSims: Array<{
    id: string;
    name: string;
    slug: string;
    sampleImages?: Array<{
      url: string;
    }>;
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
      isFeatured
      owner {
        id
        username
        avatar
      }
      presets {
        id
        title
        slug
        afterImage {
          url
        }
      }
      filmSims {
        id
        name
        slug
        sampleImages {
          url
        }
      }
      createdAt
      updatedAt
    }
  }
`;

const MyLists: React.FC = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

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
  });

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
    <Container maxWidth="lg" sx={{ py: 4, mb: 20 }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 4 }}
      >
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
        <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {lists.map((list) => (
            <ListRow
              key={list.id}
              id={list.id}
              name={list.name}
              description={list.description}
              owner={list.owner}
              isFeatured={list.isFeatured || false}
              presets={list.presets}
              filmSims={list.filmSims}
            />
          ))}
        </Box>
      )}
    </Container>
  );
};

export default MyLists;
