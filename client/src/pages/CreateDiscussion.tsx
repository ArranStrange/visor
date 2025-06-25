import React, { useState } from "react";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  CircularProgress,
  Breadcrumbs,
  Link,
  Autocomplete,
} from "@mui/material";
import {
  NavigateNext as NavigateNextIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@apollo/client";
import { useAuth } from "../context/AuthContext";
import { CREATE_DISCUSSION } from "../graphql/mutations/discussions";
import { GET_ALL_PRESETS } from "../graphql/queries/getAllPresets";
import { GET_ALL_FILMSIMS } from "../graphql/queries/getAllFilmSims";

interface CreateDiscussionForm {
  title: string;
  linkedToType:
    | "PRESET"
    | "FILMSIM"
    | "TECHNIQUE"
    | "EQUIPMENT"
    | "LOCATION"
    | "TUTORIAL"
    | "REVIEW"
    | "CHALLENGE"
    | "WORKFLOW"
    | "INSPIRATION"
    | "CRITIQUE"
    | "NEWS"
    | "EVENT"
    | "GENERAL";
  linkedToId: string;
  tags: string[];
}

const CreateDiscussion: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState<CreateDiscussionForm>({
    title: "",
    linkedToType: "PRESET",
    linkedToId: "",
    tags: [],
  });
  const [tagInput, setTagInput] = useState("");
  const [selectedItem, setSelectedItem] = useState<any>(null);

  // Get presets and film sims for selection
  const { data: presetsData, loading: presetsLoading } =
    useQuery(GET_ALL_PRESETS);
  const { data: filmSimsData, loading: filmSimsLoading } =
    useQuery(GET_ALL_FILMSIMS);

  const [createDiscussion, { loading: creating }] =
    useMutation(CREATE_DISCUSSION);

  // Combine and filter items based on type
  const getAvailableItems = () => {
    if (form.linkedToType === "PRESET") {
      return presetsData?.listPresets || [];
    } else if (form.linkedToType === "FILMSIM") {
      return filmSimsData?.listFilmSims || [];
    }
    return [];
  };

  const availableItems = getAvailableItems();
  const isLoading = presetsLoading || filmSimsLoading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title.trim()) {
      return;
    }

    try {
      const result = await createDiscussion({
        variables: {
          input: {
            title: form.title.trim(),
            linkedToType: form.linkedToType,
            linkedToId: form.linkedToId || "",
            tags: form.tags,
          },
        },
      });

      if (result.data?.createDiscussion) {
        navigate(`/discussions/${result.data.createDiscussion.id}`);
      }
    } catch (error) {
      console.error("Error creating discussion:", error);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !form.tags.includes(tagInput.trim())) {
      setForm((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const requiresItemSelection = form.linkedToType !== "GENERAL";

  const getDiscussionTypeLabel = (type: string) => {
    switch (type) {
      case "PRESET":
        return "Preset";
      case "FILMSIM":
        return "Film Simulation";
      case "TECHNIQUE":
        return "Technique";
      case "EQUIPMENT":
        return "Equipment";
      case "LOCATION":
        return "Location";
      case "TUTORIAL":
        return "Tutorial";
      case "REVIEW":
        return "Review";
      case "CHALLENGE":
        return "Challenge";
      case "WORKFLOW":
        return "Workflow";
      case "INSPIRATION":
        return "Inspiration";
      case "CRITIQUE":
        return "Critique";
      case "NEWS":
        return "News";
      case "EVENT":
        return "Event";
      case "GENERAL":
        return "General";
      default:
        return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  const showItemSelection =
    form.linkedToType === "PRESET" || form.linkedToType === "FILMSIM";

  if (presetsLoading || filmSimsLoading) {
    return (
      <Container maxWidth="lg">
        <Box py={4} display="flex" justifyContent="center">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box py={4}>
        {/* Breadcrumbs */}
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" />}
          sx={{ mb: 3 }}
        >
          <Link
            color="inherit"
            href="/discussions"
            onClick={(e) => {
              e.preventDefault();
              navigate("/discussions");
            }}
          >
            Discussions
          </Link>
          <Typography color="text.primary">Create Discussion</Typography>
        </Breadcrumbs>

        <Typography variant="h3" component="h1" gutterBottom>
          Start a Discussion
        </Typography>
        <Typography variant="body1" color="text.secondary" mb={4}>
          Create a new discussion about a preset or film simulation
        </Typography>

        <Card>
          <CardContent>
            <Box component="form" onSubmit={handleSubmit}>
              {/* Title */}
              <TextField
                fullWidth
                label="Discussion Title"
                value={form.title}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, title: e.target.value }))
                }
                required
                sx={{ mb: 3 }}
                placeholder="What would you like to discuss?"
              />

              {/* Type Selection */}
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Discussion Type</InputLabel>
                <Select
                  value={form.linkedToType}
                  onChange={(e) => {
                    setForm((prev) => ({
                      ...prev,
                      linkedToType: e.target.value as
                        | "PRESET"
                        | "FILMSIM"
                        | "TECHNIQUE"
                        | "EQUIPMENT"
                        | "LOCATION"
                        | "TUTORIAL"
                        | "REVIEW"
                        | "CHALLENGE"
                        | "WORKFLOW"
                        | "INSPIRATION"
                        | "CRITIQUE"
                        | "NEWS"
                        | "EVENT"
                        | "GENERAL",
                      linkedToId: "", // Reset selection when type changes
                    }));
                    setSelectedItem(null); // Reset selected item state
                  }}
                  label="Discussion Type"
                >
                  <MenuItem value="PRESET">Preset</MenuItem>
                  <MenuItem value="FILMSIM">Film Simulation</MenuItem>
                  <MenuItem value="TECHNIQUE">Technique</MenuItem>
                  <MenuItem value="EQUIPMENT">Equipment</MenuItem>
                  <MenuItem value="LOCATION">Location</MenuItem>
                  <MenuItem value="TUTORIAL">Tutorial</MenuItem>
                  <MenuItem value="REVIEW">Review</MenuItem>
                  <MenuItem value="CHALLENGE">Challenge</MenuItem>
                  <MenuItem value="WORKFLOW">Workflow</MenuItem>
                  <MenuItem value="INSPIRATION">Inspiration</MenuItem>
                  <MenuItem value="CRITIQUE">Critique</MenuItem>
                  <MenuItem value="NEWS">News</MenuItem>
                  <MenuItem value="EVENT">Event</MenuItem>
                  <MenuItem value="GENERAL">General</MenuItem>
                </Select>
              </FormControl>

              {/* Item Selection */}
              {showItemSelection && (
                <>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    Optionally link this discussion to a specific{" "}
                    {form.linkedToType === "PRESET"
                      ? "preset"
                      : "film simulation"}
                    . This helps others discover your discussion when viewing
                    that item.
                  </Typography>
                  <FormControl fullWidth sx={{ mb: 3 }}>
                    <Autocomplete
                      value={selectedItem}
                      onChange={(event, newValue) => {
                        setSelectedItem(newValue);
                        setForm((prev) => ({
                          ...prev,
                          linkedToId: newValue?.id || "",
                        }));
                      }}
                      options={availableItems}
                      getOptionLabel={(option) =>
                        option.title || option.name || ""
                      }
                      loading={isLoading}
                      filterOptions={(options, { inputValue }) => {
                        if (!inputValue) {
                          return options.slice(0, 20); // Show first 20 when no input
                        }

                        const filtered = options.filter((option) => {
                          const title = (
                            option.title ||
                            option.name ||
                            ""
                          ).toLowerCase();
                          const searchTerm = inputValue.toLowerCase();
                          return title.includes(searchTerm);
                        });

                        return filtered.slice(0, 50); // Limit to first 50 matches for performance
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder={`Search ${getDiscussionTypeLabel(
                            form.linkedToType
                          )}... (Optional)`}
                          InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                              <>
                                {isLoading ? (
                                  <CircularProgress color="inherit" size={20} />
                                ) : null}
                                {params.InputProps.endAdornment}
                              </>
                            ),
                          }}
                        />
                      )}
                      renderOption={(props, option) => (
                        <li {...props}>
                          <Box>
                            <Typography variant="body2">
                              {option.title || option.name}
                            </Typography>
                            {option.description && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {option.description}
                              </Typography>
                            )}
                          </Box>
                        </li>
                      )}
                      noOptionsText="No items found"
                      loadingText="Loading items..."
                    />
                  </FormControl>
                </>
              )}

              {/* Tags */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Tags (optional)
                </Typography>
                <Box display="flex" gap={1} mb={1}>
                  <TextField
                    size="small"
                    placeholder="Add a tag..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    sx={{ flex: 1 }}
                  />
                  <Button
                    variant="outlined"
                    onClick={handleAddTag}
                    disabled={!tagInput.trim()}
                  >
                    Add
                  </Button>
                </Box>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {form.tags.map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      onDelete={() => handleRemoveTag(tag)}
                      size="small"
                    />
                  ))}
                </Box>
              </Box>

              {/* Submit Button */}
              <Box display="flex" gap={2}>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<AddIcon />}
                  disabled={creating || !form.title.trim()}
                >
                  {creating ? "Creating..." : "Create Discussion"}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => navigate("/discussions")}
                >
                  Cancel
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default CreateDiscussion;
