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

  const handleRemoveItem = async (
    type: "preset" | "filmSim",
    itemId: string
  ) => {
    if (
      window.confirm(
        `Are you sure you want to remove this ${type} from the list?`
      )
    ) {
      try {
        await removeItem({
          variables: {
            listId: id,
            type: type === "preset" ? "Preset" : "FilmSim",
            itemId,
          },
        });
      } catch (err) {
        console.error("Error removing item:", err);
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

  const renderCard = (item: any, type: "preset" | "filmSim") => (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        cursor: "pointer",
        transition: "transform 0.2s ease-in-out",
        position: "relative",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: 3,
        },
      }}
      onClick={() =>
        !isEditing &&
        navigate(
          type === "preset" ? `/preset/${item.slug}` : `/film-sim/${item.slug}`
        )
      }
    >
      {isEditing && (
        <IconButton
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.9)",
            },
            zIndex: 1,
          }}
          onClick={(e) => {
            e.stopPropagation();
            handleRemoveItem(type, item.id);
          }}
        >
          <DeleteIcon color="error" />
        </IconButton>
      )}
      <CardMedia
        component="img"
        height="200"
        image={
          item.thumbnail ||
          (type === "preset"
            ? "/default-preset-thumbnail.jpg"
            : "/default-film-sim-thumbnail.jpg")
        }
        alt={type === "preset" ? item.title : item.name}
        sx={{ objectFit: "cover" }}
      />
      <CardContent>
        <Typography variant="h6" component="div">
          {type === "preset" ? item.title : item.name}
        </Typography>
      </CardContent>
    </Card>
  );

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
            {contentType === "all" || contentType === "presets"
              ? list?.presets?.map((preset) => renderCard(preset, "preset"))
              : null}
            {contentType === "all" || contentType === "films"
              ? list?.filmSims?.map((filmSim) => renderCard(filmSim, "filmSim"))
              : null}
          </StaggeredGrid>
        </Box>
      </Stack>
    </Container>
  );
};

export default ListDetail;
