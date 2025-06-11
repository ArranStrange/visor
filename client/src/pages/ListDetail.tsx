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
  Card,
  CardContent,
  CardMedia,
  IconButton,
  CircularProgress,
  Alert,
  Chip,
  Stack,
} from "@mui/material";
import { gql } from "@apollo/client";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { useAuth } from "../context/AuthContext";
import { useContentType } from "../context/ContentTypeFilter";
import StaggeredGrid from "../components/StaggeredGrid";
import ContentTypeToggle from "../components/ContentTypeToggle";

interface FilmSim {
  id: string;
  name: string;
  slug: string;
  thumbnail?: string;
  type?: string;
}

interface Preset {
  id: string;
  title: string;
  slug: string;
  thumbnail?: string;
}

interface CacheList {
  _id: string;
  presets: Array<{ _id: string }>;
  filmSims: Array<{ _id: string }>;
}

const GET_LIST = gql`
  query GetList($id: ID!) {
    getUserList(id: $id) {
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
        thumbnail
      }
      filmSims {
        id
        name
        slug
        thumbnail
        type
      }
    }
  }
`;

const UPDATE_LIST = gql`
  mutation UpdateList($id: ID!, $input: UpdateUserListInput!) {
    updateUserList(id: $id, input: $input) {
      id
      name
      description
      isPublic
      owner {
        id
        username
        avatar
      }
    }
  }
`;

const DELETE_LIST = gql`
  mutation DeleteList($id: ID!) {
    deleteUserList(id: $id)
  }
`;

const REMOVE_ITEM = gql`
  mutation RemoveFromUserList($listId: ID!, $presetId: ID, $filmSimId: ID) {
    removeFromUserList(
      listId: $listId
      presetId: $presetId
      filmSimId: $filmSimId
    ) {
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

// Utility to shuffle an array
function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const ListDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { contentType } = useContentType();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isPublic: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    loading,
    error: queryError,
    data,
    refetch,
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
      refetch();
      setSuccess("List updated successfully");
      setIsEditing(false);
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  const [deleteList] = useMutation(DELETE_LIST, {
    onCompleted: () => {
      navigate("/lists");
    },
    onError: (error) => {
      setError(error.message);
      setTimeout(() => setError(null), 3000);
    },
  });

  const [removeItem] = useMutation(REMOVE_ITEM, {
    onCompleted: () => {
      refetch();
      setSuccess("Item removed successfully!");
      setTimeout(() => setSuccess(null), 3000);
    },
    onError: (error) => {
      setError(error.message);
      setTimeout(() => setError(null), 3000);
    },
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async () => {
    try {
      await updateList({
        variables: {
          id,
          input: {
            name: formData.name,
            description: formData.description,
            isPublic: formData.isPublic,
          },
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update list");
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

  const handleRemoveItem = async (itemId: string, isFilmSim: boolean) => {
    if (
      window.confirm(
        `Are you sure you want to remove this ${
          isFilmSim ? "film sim" : "preset"
        } from the list?`
      )
    ) {
      try {
        await removeItem({
          variables: {
            listId: id,
            ...(isFilmSim ? { filmSimId: itemId } : { presetId: itemId }),
          },
          update(cache) {
            // Read the current list data from cache
            const existingList = cache.readFragment<CacheList>({
              id: `UserList:${id}`,
              fragment: gql`
                fragment ExistingList on UserList {
                  _id
                  presets {
                    _id
                  }
                  filmSims {
                    _id
                  }
                }
              `,
            });

            if (existingList) {
              // Create updated lists by filtering out the removed item
              const updatedPresets = isFilmSim
                ? existingList.presets.filter((p: any) => p._id !== itemId)
                : existingList.presets;

              const updatedFilmSims = isFilmSim
                ? existingList.filmSims.filter((f: any) => f._id !== itemId)
                : existingList.filmSims;

              // Write the updated data back to cache
              cache.writeFragment({
                id: `UserList:${id}`,
                fragment: gql`
                  fragment UpdatedList on UserList {
                    presets {
                      _id
                    }
                    filmSims {
                      _id
                    }
                  }
                `,
                data: {
                  presets: updatedPresets,
                  filmSims: updatedFilmSims,
                },
              });
            }
          },
        });

        setSuccess("Item removed from list successfully");
      } catch (error) {
        console.error("Error removing item:", error);
        setError("Failed to remove item from list");
      }
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
  const isOwner = currentUser?.id === list?.owner?.id;

  const PLACEHOLDER_IMAGE = "/placeholder-image.jpg";

  const renderCard = (item: FilmSim | Preset) => {
    if (!item) return null;
    const isFilmSim = "type" in item;
    // Use placeholder if thumbnail is missing or empty string
    const thumbnail =
      item.thumbnail && item.thumbnail.trim() !== ""
        ? item.thumbnail
        : PLACEHOLDER_IMAGE;
    const title = isFilmSim ? (item as FilmSim).name : (item as Preset).title;
    const subtitle = isFilmSim ? (item as FilmSim).type ?? "" : "";

    return (
      <Card
        key={item.id}
        sx={{
          width: 250,
          flex: "0 0 auto",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          cursor: isEditing ? "default" : "pointer",
          "&:hover": {
            transform: isEditing ? "none" : "translateY(-4px)",
            boxShadow: isEditing ? 1 : 3,
          },
          transition: "all 0.2s ease-in-out",
        }}
        onClick={() => {
          if (!isEditing) {
            navigate(
              isFilmSim ? `/filmsim/${item.slug}` : `/preset/${item.slug}`
            );
          }
        }}
      >
        <CardMedia
          component="img"
          height="200"
          image={thumbnail}
          alt={title}
          sx={{
            objectFit: "cover",
            backgroundColor: "grey.100",
          }}
        />
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography variant="h6" component="div" gutterBottom>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        </CardContent>
        {isEditing && (
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleRemoveItem(item.id, isFilmSim);
            }}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              backgroundColor: "rgba(255, 255, 255, 0.8)",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.9)",
              },
            }}
          >
            <DeleteIcon />
          </IconButton>
        )}
      </Card>
    );
  };

  // Combine and shuffle cards for display (like Home)
  const combined = [
    ...(contentType === "all" || contentType === "presets"
      ? list?.presets?.map((preset) => ({ type: "preset", data: preset })) ?? []
      : []),
    ...(contentType === "all" || contentType === "films"
      ? list?.filmSims?.map((filmSim) => ({ type: "film", data: filmSim })) ??
        []
      : []),
  ];
  const shuffledCombined = shuffle(combined);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Stack spacing={4}>
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

        <ContentTypeToggle />

        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={2} flex={1}>
            {isEditing ? (
              <TextField
                fullWidth
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                variant="standard"
                sx={{
                  "& .MuiInputBase-root": {
                    fontSize: "2rem",
                    fontWeight: "bold",
                  },
                }}
              />
            ) : (
              <Typography
                variant="h4"
                component="h1"
                sx={{ fontWeight: "bold" }}
              >
                {list?.name}
              </Typography>
            )}
            {!isEditing && (
              <Chip
                label={list?.isPublic ? "Public" : "Private"}
                color={list?.isPublic ? "primary" : "default"}
                size="small"
              />
            )}
          </Box>
          {isOwner && (
            <Box>
              {!isEditing ? (
                <Button
                  startIcon={<EditIcon />}
                  onClick={() => setIsEditing(true)}
                >
                  Edit List
                </Button>
              ) : (
                <Button
                  variant="outlined"
                  onClick={() => setIsEditing(false)}
                  sx={{ mr: 2 }}
                >
                  Cancel
                </Button>
              )}
            </Box>
          )}
        </Box>

        {isEditing ? (
          <Stack spacing={2}>
            <TextField
              fullWidth
              multiline
              rows={3}
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              label="Description"
              placeholder="Describe your list..."
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isPublic}
                  onChange={handleInputChange}
                  name="isPublic"
                />
              }
              label="Public List"
            />
            <Box display="flex" gap={2} justifyContent="space-between">
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={handleDelete}
              >
                Delete List
              </Button>
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={!formData.name.trim()}
              >
                Save Changes
              </Button>
            </Box>
          </Stack>
        ) : (
          <Stack spacing={1}>
            {list?.description && (
              <Typography variant="body1" color="text.secondary">
                {list.description}
              </Typography>
            )}
            <Typography variant="body2" color="text.secondary">
              Created by {list?.owner?.username}
            </Typography>
          </Stack>
        )}

        <Box sx={{ width: "100%", minHeight: "200px" }}>
          <StaggeredGrid>
            {shuffledCombined.map((item, index) => (
              <React.Fragment key={`${item.type}-${item.data.id}-${index}`}>
                {renderCard(item.data)}
              </React.Fragment>
            ))}
          </StaggeredGrid>
        </Box>
      </Stack>
    </Container>
  );
};

export default ListDetail;
