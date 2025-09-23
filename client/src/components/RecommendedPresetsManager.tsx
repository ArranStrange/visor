import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  List,
  Typography,
  CircularProgress,
  Box,
  IconButton,
  Divider,
  Alert,
} from "@mui/material";
import { useQuery, useMutation } from "@apollo/client";
import { ADD_RECOMMENDED_PRESET } from "../graphql/mutations/addRecommendedPreset";
import { GET_ALL_PRESETS } from "../graphql/queries/getAllPresets";
import { usePresetSearch } from "../hooks/usePresetSearch";
import PresetSearchItem from "./PresetSearchItem";
import CurrentPresetsList from "./CurrentPresetsList";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
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
    tags?: Array<{ id?: string; displayName: string }>;
  }>;
}

const RecommendedPresetsManager: React.FC<RecommendedPresetsManagerProps> = ({
  open,
  onClose,
  filmSimId,
  filmSimName,
  currentRecommendedPresets,
}) => {
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  const { data: presetData, loading: searchLoading } =
    useQuery(GET_ALL_PRESETS);
  const allPresets = presetData?.listPresets || [];

  const {
    searchQuery,
    setSearchQuery,
    searchResults,
    hasResults,
    shouldShowResults,
  } = usePresetSearch({
    allPresets,
    currentRecommendedPresets,
  });

  const [addRecommendedPreset, { loading: addingPreset }] = useMutation(
    ADD_RECOMMENDED_PRESET,
    {
      onCompleted: () => {
        setSelectedPreset(null);
        setSearchQuery("");
      },
    }
  );

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
          <CurrentPresetsList presets={currentRecommendedPresets} />
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
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />
              ),
            }}
            sx={{ mb: 2 }}
          />

          {shouldShowResults && (
            <Box>
              {searchLoading ? (
                <Box display="flex" justifyContent="center" py={2}>
                  <CircularProgress />
                </Box>
              ) : hasResults ? (
                <List sx={{ maxHeight: 300, overflow: "auto" }}>
                  {searchResults.map((preset) => (
                    <PresetSearchItem
                      key={preset.id}
                      preset={preset}
                      isSelected={selectedPreset === preset.id}
                      onSelect={handlePresetSelect}
                    />
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
