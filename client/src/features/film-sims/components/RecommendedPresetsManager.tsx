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
import { ADD_RECOMMENDED_PRESET } from "@/features/film-sims/graphql/filmSims";
import {
  SEARCH_PRESETS,
  type SearchPresetsQueryData,
  type SearchPresetsQueryVariables,
} from "@/features/presets/graphql/presets";
import { usePresetSearch } from "@/features/film-sims/hooks/usePresetSearch";
import PresetSearchItem from "@/features/film-sims/components/PresetSearchItem";
import CurrentPresetsList from "@/features/film-sims/components/CurrentPresetsList";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import type { PresetSummary } from "@/types/graphql";

interface RecommendedPresetsManagerProps {
  open: boolean;
  onClose: () => void;
  filmSimId: string;
  filmSimName: string;
  currentRecommendedPresets: PresetSummary[];
}

const PICKER_PAGE_SIZE = 20;

const RecommendedPresetsManager: React.FC<RecommendedPresetsManagerProps> = ({
  open,
  onClose,
  filmSimId,
  filmSimName,
  currentRecommendedPresets,
}) => {
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const { searchQuery, setSearchQuery, shouldShowResults } = usePresetSearch();
  const presetQuery = useQuery<
    SearchPresetsQueryData,
    SearchPresetsQueryVariables
  >(SEARCH_PRESETS, {
    variables: {
      query: searchQuery.trim(),
      page: 1,
      limit: PICKER_PAGE_SIZE,
    },
    skip: !open || !shouldShowResults,
  });
  const searchResults = excludeCurrentPresets(
    presetQuery.data?.listPresets.presets ?? [],
    currentRecommendedPresets
  );
  const hasResults = searchResults.length > 0;
  const searchLoading = presetQuery.loading && !presetQuery.data;

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

function excludeCurrentPresets(
  presets: PresetSummary[],
  currentPresets: PresetSummary[]
) {
  const currentIds = new Set(currentPresets.map(({ id }) => id));
  return presets.filter(({ id }) => !currentIds.has(id));
}

export default RecommendedPresetsManager;
