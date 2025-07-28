import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
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
      // Refetch the lists to get updated data
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

      // Validate that we have at least one item to add
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
        data-cy="add-to-list-button"
        onClick={handleClick}
        aria-label={`Add ${itemName} to list`}
        title={`Add ${itemName} to list`}
        sx={{
          position: "absolute",
          top: 16,
          right: 16,
          backgroundColor: "background.paper",
          "&:hover": {
            backgroundColor: "action.hover",
          },
          "&:focus-visible": {
            outline: "2px solid",
            outlineColor: "primary.main",
            outlineOffset: "2px",
          },
        }}
      >
        <AddIcon />
      </IconButton>

      <Dialog
        data-cy="list-selection-dialog"
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
        aria-labelledby="dialog-title"
        aria-describedby="dialog-description"
        role="dialog"
        aria-modal="true"
      >
        <DialogTitle id="dialog-title">Add {itemName} to List</DialogTitle>
        <DialogContent>
          <div id="dialog-description" className="sr-only">
            Select a list to add {itemName} to, or create a new list
          </div>

          {error && (
            <Alert
              severity="error"
              sx={{ mb: 2 }}
              role="alert"
              aria-live="polite"
            >
              {error}
            </Alert>
          )}
          {success && (
            <Alert
              severity="success"
              sx={{ mb: 2 }}
              role="alert"
              aria-live="polite"
            >
              {success}
            </Alert>
          )}
          {loading ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress aria-label="Loading lists" />
            </Box>
          ) : lists.length === 0 ? (
            <Box textAlign="center" py={3}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                You don't have any lists yet.
              </Typography>
              <Button
                variant="contained"
                onClick={handleCreateList}
                aria-label="Create your first list"
                sx={{ mt: 1 }}
              >
                Create Your First List
              </Button>
            </Box>
          ) : (
            <List role="listbox" aria-label="Available lists">
              {lists.map((list: any) => (
                <ListItem key={list.id} disablePadding>
                  <ListItemButton
                    onClick={() => handleAddToList(list.id)}
                    role="option"
                    aria-label={`Add to ${list.name} list`}
                    aria-describedby={`list-description-${list.id}`}
                  >
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
                            id={`list-description-${list.id}`}
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
          <Button
            onClick={() => setOpen(false)}
            aria-label="Cancel adding to list"
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateList}
            color="primary"
            aria-label="Create a new list"
          >
            Create New List
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AddToListButton;
