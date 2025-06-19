import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  CircularProgress,
  Alert,
  Chip,
  Stack,
} from "@mui/material";
import { gql } from "@apollo/client";
import ContentTypeToggle from "../components/ContentTypeToggle";
import ContentGridLoader from "../components/ContentGridLoader";
import { useAuth } from "../context/AuthContext";
import { useContentType } from "../context/ContentTypeFilter";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

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

const UPDATE_LIST = gql`
  mutation UpdateList($id: ID!, $input: UpdateUserListInput!) {
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
    loading: listLoading,
    error: queryError,
    data: listData,
    refetch,
  } = useQuery(GET_LIST, {
    variables: { id },
    onCompleted: (data) => {
      const list = data?.getUserList;
      if (list) {
        setFormData({
          name: list.name,
          description: list.description || "",
          isPublic: list.isPublic,
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
    onError: (error) => setError(error.message),
  });

  const [deleteList] = useMutation(DELETE_LIST, {
    onCompleted: () => navigate("/lists"),
    onError: (error) => setError(error.message),
  });

  if (listLoading) {
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

  const list = listData?.getUserList;
  const isOwner = currentUser?.id === list?.owner?.id;

  console.log("List data:", list);

  // Prepare data for ContentGridLoader in the same format as home/search
  const combined = [
    ...(contentType === "all" || contentType === "presets"
      ? list?.presets?.map((preset: any) => ({
          type: "preset" as const,
          data: {
            ...preset,
            // Ensure we have the fields that PresetCard expects
            afterImage: preset.afterImage || {
              url: "https://placehold.co/400x200/2a2a2a/ffffff?text=No+Image",
            },
            tags: [],
            creator: { username: "Unknown" },
          },
        })) || []
      : []),

    ...(contentType === "all" || contentType === "films"
      ? list?.filmSims?.map((filmSim: any) => ({
          type: "film" as const,
          data: {
            ...filmSim,
            title: filmSim.name, // Map name to title for consistency
            thumbnail:
              filmSim.sampleImages?.[0]?.url ||
              "https://placehold.co/400x200/2a2a2a/ffffff?text=No+Image",
            tags: [],
            creator: { username: "Unknown" },
          },
        })) || []
      : []),
  ];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = () => {
    updateList({
      variables: {
        id,
        input: formData,
      },
    });
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this list?")) {
      deleteList({ variables: { id } });
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Stack spacing={4}>
        {error && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">{success}</Alert>}

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
                <>
                  <Button
                    variant="outlined"
                    onClick={() => setIsEditing(false)}
                    sx={{ mr: 2 }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={!formData.name.trim()}
                  >
                    Save Changes
                  </Button>
                </>
              )}
            </Box>
          )}
        </Box>

        {!isEditing && (
          <Stack spacing={1}>
            {list?.description && (
              <Typography color="text.secondary">{list.description}</Typography>
            )}
            <Typography variant="body2" color="text.secondary">
              Created by {list?.owner?.username}
            </Typography>
            {list?.createdAt && (
              <Typography variant="body2" color="text.secondary">
                Created: {new Date(list.createdAt).toLocaleDateString()}
              </Typography>
            )}
            <Typography variant="body2" color="text.secondary">
              {list?.presets?.length || 0} presets •{" "}
              {list?.filmSims?.length || 0} film sims
            </Typography>
          </Stack>
        )}

        {isEditing && (
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
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleDelete}
            >
              Delete List
            </Button>
          </Stack>
        )}

        {/* Use ContentGridLoader for consistent card display */}
        <ContentGridLoader customData={combined} contentType={contentType} />
      </Stack>
    </Container>
  );
};

export default ListDetail;
