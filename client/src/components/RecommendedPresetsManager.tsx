import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  CircularProgress,
  Box,
  Chip,
  IconButton,
  Divider,
  Alert,
} from "@mui/material";
import { useQuery, useMutation } from "@apollo/client";
import { ADD_RECOMMENDED_PRESET } from "../graphql/mutations/addRecommendedPreset";
import { REMOVE_RECOMMENDED_PRESET } from "../graphql/mutations/removeRecommendedPreset";
import { GET_ALL_PRESETS } from "../graphql/queries/getAllPresets";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import CloseIcon from "@mui/icons-material/Close";

interface RecommendedPresetsManagerProps {
  open: boolean;
  onClose: () => void;
  filmSimId: string;
  filmSimName: string;
  currentRecommendedPresets: Array<{
    id: string;
    title: string;
    slug: string;
    description?: string;
    afterImage?: { url: string };
    creator?: { id: string; username: string; avatar?: string };
    tags?: Array<{ id: string; displayName: string }>;
  }>;
}

const RecommendedPresetsManager: React.FC<RecommendedPresetsManagerProps> = ({
  open,
  onClose,
  filmSimId,
  filmSimName,
  currentRecommendedPresets,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  const { data: presetData, loading: searchLoading } =
    useQuery(GET_ALL_PRESETS);

  const [addRecommendedPreset, { loading: addingPreset }] = useMutation(
    ADD_RECOMMENDED_PRESET,
    {
      onCompleted: () => {
        setSelectedPreset(null);
        setSearchQuery("");
      },
    }
  );

  const [removeRecommendedPreset, { loading: removingPreset }] = useMutation(
    REMOVE_RECOMMENDED_PRESET
  );

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handlePresetSelect = (presetId: string) => {
    setSelectedPreset(presetId);
  };

  const handleAddPreset = async () => {
    if (selectedPreset) {
      try {
        await addRecommendedPreset({
          variables: {
            filmSimId,
            presetId: selectedPreset,
          },
        });
      } catch (error) {
        console.error("Error adding recommended preset:", error);
      }
    }
  };

  const handleRemovePreset = async (presetId: string) => {
    try {
      await removeRecommendedPreset({
        variables: {
          filmSimId,
          presetId,
        },
      });
    } catch (error) {
      console.error("Error removing recommended preset:", error);
    }
  };

  const allPresets = presetData?.listPresets || [];
  const searchResults =
    searchQuery.length < 2
      ? []
      : allPresets.filter((preset: any) => {
          const searchTerm = searchQuery.toLowerCase();
          const searchableText = [
            preset.title,
            preset.description,
            preset.creator?.username,
            ...(preset.tags?.map((tag: any) => tag.displayName) || []),
          ]
            .join(" ")
            .toLowerCase();
          return searchableText.includes(searchTerm);
        });
  const isAlreadyRecommended = (presetId: string) =>
    currentRecommendedPresets.some((preset) => preset.id === presetId);

  // Debug logging
  console.log("searchQuery:", searchQuery);
  console.log("searchData:", presetData);
  console.log("searchResults:", searchResults);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: "background.paper",
          maxHeight: "80vh",
        },
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">
            Manage Recommended Presets for "{filmSimName}"
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Current Recommended Presets
          </Typography>
          {currentRecommendedPresets.length > 0 ? (
            <List>
              {currentRecommendedPresets.map((preset) => (
                <ListItem key={preset.id} disableGutters>
                  <ListItemText primary={preset.title} />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No recommended presets yet.
            </Typography>
          )}
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Add New Recommended Preset
          </Typography>
          <TextField
            fullWidth
            placeholder="Search presets by name..."
            value={searchQuery}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />
              ),
            }}
            sx={{ mb: 2 }}
          />

          {searchQuery.length >= 2 && (
            <Box>
              {searchLoading ? (
                <Box display="flex" justifyContent="center" py={2}>
                  <CircularProgress />
                </Box>
              ) : searchResults.length > 0 ? (
                <List sx={{ maxHeight: 300, overflow: "auto" }}>
                  {searchResults
                    .filter((preset: any) => !isAlreadyRecommended(preset.id))
                    .map((preset: any) => (
                      <ListItemButton
                        key={preset.id}
                        selected={selectedPreset === preset.id}
                        onClick={() => handlePresetSelect(preset.id)}
                      >
                        <ListItemAvatar>
                          <Avatar
                            src={preset.afterImage?.url}
                            alt={preset.title}
                            variant="rounded"
                          />
                        </ListItemAvatar>
                        <ListItemText
                          primary={preset.title}
                          secondary={
                            <Box>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                by {preset.creator?.username}
                              </Typography>
                              {preset.description && (
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    display: "-webkit-box",
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: "vertical",
                                  }}
                                >
                                  {preset.description}
                                </Typography>
                              )}
                              {preset.tags && preset.tags.length > 0 && (
                                <Box sx={{ mt: 0.5 }}>
                                  {preset.tags.slice(0, 3).map((tag: any) => (
                                    <Chip
                                      key={tag.id}
                                      label={tag.displayName}
                                      size="small"
                                      variant="outlined"
                                      sx={{ mr: 0.5, mb: 0.5 }}
                                    />
                                  ))}
                                </Box>
                              )}
                            </Box>
                          }
                        />
                      </ListItemButton>
                    ))}
                </List>
              ) : (
                <Alert severity="info">
                  No presets found matching "{searchQuery}"
                </Alert>
              )}
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleAddPreset}
          variant="contained"
          disabled={!selectedPreset || addingPreset}
          startIcon={
            addingPreset ? <CircularProgress size={20} /> : <AddIcon />
          }
        >
          {addingPreset ? "Adding..." : "Add Selected Preset"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RecommendedPresetsManager;
