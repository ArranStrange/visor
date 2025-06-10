import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client";
import {
  Container,
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Grid,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Chip,
  Stack,
} from "@mui/material";
import { gql } from "@apollo/client";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { ListType, UserList } from "../types/lists";
import AddItemDialog from "../components/AddItemDialog";

const GET_LIST = gql`
  query GetList($id: ID!) {
    getUserList(id: $id) {
      id
      name
      description
      isPublic
      presets {
        id
        title
        slug
        thumbnail
        tags {
          displayName
        }
        creator {
          id
          username
          avatar
        }
      }
      filmSims {
        id
        name
        slug
        description
        thumbnail
        tags {
          displayName
        }
        creator {
          id
          username
          avatar
        }
        settings {
          dynamicRange
          highlight
          shadow
          colour
          sharpness
          noiseReduction
          grainEffect
          clarity
          whiteBalance
          wbShift {
            r
            b
          }
        }
      }
    }
  }
`;

const UPDATE_LIST = gql`
  mutation UpdateList($id: ID!, $input: JSON!) {
    updateUserList(id: $id, input: $input) {
      id
      name
      description
      isPublic
    }
  }
`;

const DELETE_LIST = gql`
  mutation DeleteList($id: ID!) {
    deleteUserList(id: $id)
  }
`;

const ADD_ITEM = gql`
  mutation AddItemToList($listId: ID!, $type: String!, $itemId: ID!) {
    addItemToList(listId: $listId, type: $type, itemId: $itemId) {
      id
      presets {
        id
      }
      filmSims {
        id
      }
    }
  }
`;

const REMOVE_ITEM = gql`
  mutation RemoveItemFromList($listId: ID!, $type: String!, $itemId: ID!) {
    removeItemFromList(listId: $listId, type: $type, itemId: $itemId) {
      id
      presets {
        id
      }
      filmSims {
        id
      }
    }
  }
`;

const ListDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isPublic: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [addItemDialogOpen, setAddItemDialogOpen] = useState(false);
  const [selectedItemType, setSelectedItemType] = useState<
    "preset" | "filmSim"
  >("preset");

  const {
    loading,
    error: queryError,
    data,
  } = useQuery(GET_LIST, {
    variables: { id },
    onCompleted: (data) => {
      if (data?.getUserList) {
        setFormData({
          name: data.getUserList.name,
          description: data.getUserList.description || "",
          isPublic: data.getUserList.isPublic,
        });
      }
    },
  });

  const [updateList] = useMutation(UPDATE_LIST, {
    onCompleted: () => {
      setSuccess("List updated successfully!");
      setIsEditing(false);
      setTimeout(() => setSuccess(null), 3000);
    },
    onError: (error) => {
      setError(error.message);
      setTimeout(() => setError(null), 3000);
    },
  });

  const [deleteList] = useMutation(DELETE_LIST, {
    onCompleted: () => {
      navigate("/profile");
    },
    onError: (error) => {
      setError(error.message);
      setTimeout(() => setError(null), 3000);
    },
  });

  const [addItem] = useMutation(ADD_ITEM, {
    onCompleted: () => {
      setAddItemDialogOpen(false);
    },
    onError: (error) => {
      setError(error.message);
      setTimeout(() => setError(null), 3000);
    },
  });

  const [removeItem] = useMutation(REMOVE_ITEM, {
    onError: (error) => {
      setError(error.message);
      setTimeout(() => setError(null), 3000);
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "isPublic" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateList({
        variables: {
          id,
          input: formData,
        },
      });
    } catch (err) {
      console.error("Error updating list:", err);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this list?")) {
      try {
        await deleteList({
          variables: { id },
        });
      } catch (err) {
        console.error("Error deleting list:", err);
      }
    }
  };

  const handleAddItem = async (itemId: string) => {
    try {
      await addItem({
        variables: {
          listId: id,
          type: selectedItemType,
          itemId,
        },
      });
    } catch (err) {
      console.error("Error adding item:", err);
    }
  };

  const handleRemoveItem = async (
    type: "preset" | "filmSim",
    itemId: string
  ) => {
    try {
      await removeItem({
        variables: {
          listId: id,
          type,
          itemId,
        },
      });
    } catch (err) {
      console.error("Error removing item:", err);
    }
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

  if (queryError) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">Error loading list: {queryError.message}</Alert>
      </Container>
    );
  }

  const list = data?.getUserList;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
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

      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <Box>
              <Typography variant="h5" gutterBottom>
                {isEditing ? "Edit List" : list?.name}
              </Typography>
              {isEditing ? (
                <TextField
                  fullWidth
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  label="List Name"
                  required
                />
              ) : null}
            </Box>

            <Box>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Description
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="Describe your list..."
              />
            </Box>

            <FormControlLabel
              control={
                <Switch
                  checked={formData.isPublic}
                  onChange={handleInputChange}
                  name="isPublic"
                  disabled={!isEditing}
                />
              }
              label="Public List"
            />

            <Box>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
              >
                <Typography variant="h6">Presets</Typography>
                {isEditing && (
                  <Button
                    startIcon={<AddIcon />}
                    onClick={() => {
                      setSelectedItemType("preset");
                      setAddItemDialogOpen(true);
                    }}
                  >
                    Add Preset
                  </Button>
                )}
              </Box>
              <Grid container spacing={2}>
                {list?.presets.map((preset) => (
                  <Grid key={preset.id} xs={12} sm={6} md={4}>
                    <Card>
                      <CardMedia
                        component="img"
                        height="140"
                        image={preset.thumbnail || "/placeholder.jpg"}
                        alt={preset.title}
                      />
                      <CardContent>
                        <Typography variant="h6" noWrap>
                          {preset.title}
                        </Typography>
                        {isEditing && (
                          <IconButton
                            size="small"
                            onClick={() =>
                              handleRemoveItem("preset", preset.id)
                            }
                          >
                            <DeleteIcon />
                          </IconButton>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>

            <Box>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
              >
                <Typography variant="h6">Film Simulations</Typography>
                {isEditing && (
                  <Button
                    startIcon={<AddIcon />}
                    onClick={() => {
                      setSelectedItemType("filmSim");
                      setAddItemDialogOpen(true);
                    }}
                  >
                    Add Film Sim
                  </Button>
                )}
              </Box>
              <Grid container spacing={2}>
                {list?.filmSims.map((filmSim) => (
                  <Grid key={filmSim.id} xs={12} sm={6} md={4}>
                    <Card>
                      <CardMedia
                        component="img"
                        height="140"
                        image={filmSim.thumbnail || "/placeholder.jpg"}
                        alt={filmSim.name}
                      />
                      <CardContent>
                        <Typography variant="h6" noWrap>
                          {filmSim.name}
                        </Typography>
                        {isEditing && (
                          <IconButton
                            size="small"
                            onClick={() =>
                              handleRemoveItem("filmSim", filmSim.id)
                            }
                          >
                            <DeleteIcon />
                          </IconButton>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>

            <Box display="flex" gap={2} justifyContent="flex-end">
              {isEditing ? (
                <>
                  <Button
                    variant="outlined"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="contained">
                    Save Changes
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={handleDelete}
                  >
                    Delete List
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => setIsEditing(true)}
                  >
                    Edit List
                  </Button>
                </>
              )}
            </Box>
          </Stack>
        </Box>
      </Paper>

      {/* Add Item Dialog */}
      <AddItemDialog
        open={addItemDialogOpen}
        onClose={() => setAddItemDialogOpen(false)}
        onAdd={handleAddItem}
        type={selectedItemType}
      />
    </Container>
  );
};

export default ListDetail;
