import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useQuery, useMutation } from "@apollo/client";
import {
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  CircularProgress,
  Alert,
  Box,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { gql } from "@apollo/client";

const GET_USER_LISTS = gql`
  query GetUserLists($userId: ID!) {
    getUserLists(userId: $userId) {
      id
      name
      description
      isPublic
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
    }
  }
`;

const ADD_TO_LIST = gql`
  mutation AddToUserList($listId: ID!, $presetIds: [ID!], $filmSimIds: [ID!]) {
    addToUserList(
      listId: $listId
      presetIds: $presetIds
      filmSimIds: $filmSimIds
    ) {
      id
      name
      description
      isPublic
    }
  }
`;

interface AddToListButtonProps {
  presetId?: string;
  filmSimId?: string;
  itemName: string;
}

const AddToListButton: React.FC<AddToListButtonProps> = ({
  presetId,
  filmSimId,
  itemName,
}) => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { loading, data, refetch } = useQuery(GET_USER_LISTS, {
    variables: {
      userId: currentUser?.id,
    },
    skip: !currentUser?.id,
    onError: (error) => {
      console.error("Error fetching user lists:", error);
      setError("Failed to load your lists");
    },
  });

  const [addToList] = useMutation(ADD_TO_LIST, {
    onCompleted: (data) => {
      console.log("Successfully added to list:", data);
      setSuccess("Added to list successfully!");

      refetch();
      setTimeout(() => {
        setOpen(false);
        setSuccess(null);
      }, 1500);
    },
    onError: (error) => {
      console.error("Error adding to list:", error);
      setError(error.message);
      setTimeout(() => setError(null), 3000);
    },
  });

  const handleClick = () => {
    if (!currentUser) {
      navigate("/login", { state: { from: window.location.pathname } });
      return;
    }
    setOpen(true);
  };

  const handleAddToList = async (listId: string) => {
    try {
      console.log("Adding to list:", {
        listId,
        presetId: presetId || null,
        filmSimId: filmSimId || null,
      });

      if (!presetId && !filmSimId) {
        throw new Error("No item selected to add to list");
      }

      await addToList({
        variables: {
          listId,
          presetIds: presetId ? [presetId] : [],
          filmSimIds: filmSimId ? [filmSimId] : [],
        },
      });
    } catch (err) {
      console.error("Error adding to list:", err);
      setError(err instanceof Error ? err.message : "Failed to add to list");
    }
  };

  const handleCreateList = () => {
    setOpen(false);
    navigate("/create-list");
  };

  const lists = data?.getUserLists || [];

  return (
    <>
      <IconButton
        onClick={handleClick}
        sx={{
          position: "absolute",
          top: 16,
          right: 16,
          backgroundColor: "background.paper",
          "&:hover": {
            backgroundColor: "action.hover",
          },
        }}
      >
        <AddIcon />
      </IconButton>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add {itemName} to List</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}
          {loading ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : lists.length === 0 ? (
            <Box textAlign="center" py={3}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                You don't have any lists yet.
              </Typography>
              <Button
                variant="contained"
                onClick={handleCreateList}
                sx={{ mt: 1 }}
              >
                Create Your First List
              </Button>
            </Box>
          ) : (
            <List>
              {lists.map((list: any) => (
                <ListItem key={list.id} disablePadding>
                  <ListItemButton onClick={() => handleAddToList(list.id)}>
                    <ListItemText
                      primary={list.name}
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
                            variant="caption"
                            color="text.secondary"
                            component="span"
                          >
                            {list.presets?.length || 0} presets •{" "}
                            {list.filmSims?.length || 0} film sims
                            {list.isPublic && " • Public"}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateList} color="primary">
            Create New List
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AddToListButton;
