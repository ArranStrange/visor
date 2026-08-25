import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useQuery, useMutation } from "@apollo/client";
import {
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
import {
  GET_USER_LISTS_FOR_ADD_DIALOG as GET_USER_LISTS,
  ADD_TO_LIST,
} from "../../graphql/lists";
import { UserList } from "../../types/lists";

interface AddToListItem extends UserList {
  owner?: { id: string };
}

interface GetUserListsData {
  getUserLists?: AddToListItem[] | null;
}

interface GetUserListsVariables {
  userId?: string;
}

interface AddToListDialogProps {
  open: boolean;
  onClose: () => void;
  presetId?: string;
  filmSimId?: string;
  itemName: string;
}

const AddToListDialog: React.FC<AddToListDialogProps> = ({
  open,
  onClose,
  presetId,
  filmSimId,
  itemName,
}) => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { loading, data, refetch } = useQuery<
    GetUserListsData,
    GetUserListsVariables
  >(GET_USER_LISTS, {
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
    onCompleted: () => {
      setSuccess("Added to list successfully!");

      refetch();
      setTimeout(() => {
        onClose();
        setSuccess(null);
      }, 1500);
    },
    onError: (error) => {
      console.error("Mutation error details:", {
        message: error.message,
        networkError: error.networkError,
        graphQLErrors: error.graphQLErrors,
        extraInfo: error.extraInfo,
        currentUser: currentUser,
      });
      setError(error.message);
      setTimeout(() => setError(null), 3000);
    },
  });

  const handleAddToList = async (listId: string) => {
    try {
      if (!presetId && !filmSimId) {
        throw new Error("No item selected to add to list");
      }

      if (!listId) {
        throw new Error("Invalid list ID");
      }

      if (!currentUser?.id) {
        throw new Error("You must be logged in to add items to a list");
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
    onClose();
    navigate("/create-list");
  };

  const lists = data?.getUserLists || [];
  const userLists = lists.filter((list) => list.owner?.id === currentUser?.id);
  const uniqueLists = userLists.filter(
    (list, index, self) =>
      index === self.findIndex((candidate) => candidate.id === list.id)
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
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
            {uniqueLists.map((list) => (
              <ListItem key={list.id} disablePadding>
                <ListItemButton onClick={() => handleAddToList(list.id)}>
                  <ListItemText
                    primary={list.name}
                    secondary={
                      <Box>
                        {list.description && (
                          <Typography variant="body2" color="text.secondary">
                            {list.description}
                          </Typography>
                        )}
                        <Typography variant="caption" color="text.secondary">
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
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleCreateList} color="primary">
          Create New List
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddToListDialog;
