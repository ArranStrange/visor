import React, { useState } from "react";
import { useQuery } from "@apollo/client";
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
  Tabs,
  Tab,
} from "@mui/material";
import { gql } from "@apollo/client";

const SEARCH_PRESETS = gql`
  query SearchPresets($query: String!) {
    listPresets(filter: { title: $query }) {
      id
      title
      slug
      thumbnail
    }
  }
`;

const SEARCH_FILM_SIMS = gql`
  query SearchFilmSims($query: String!) {
    listFilmSims(filter: { name: $query }) {
      id
      name
      slug
      thumbnail
    }
  }
`;

interface AddItemDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (itemId: string) => void;
  type: "preset" | "filmSim";
}

const AddItemDialog: React.FC<AddItemDialogProps> = ({
  open,
  onClose,
  onAdd,
  type,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  const { loading: loadingPresets, data: presetsData } = useQuery(
    SEARCH_PRESETS,
    {
      variables: { query: searchQuery },
      skip: !searchQuery || activeTab !== 0,
    }
  );

  const { loading: loadingFilmSims, data: filmSimsData } = useQuery(
    SEARCH_FILM_SIMS,
    {
      variables: { query: searchQuery },
      skip: !searchQuery || activeTab !== 1,
    }
  );

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleItemSelect = (itemId: string) => {
    setSelectedItem(itemId);
  };

  const handleAdd = () => {
    if (selectedItem) {
      onAdd(selectedItem);
      setSelectedItem(null);
      setSearchQuery("");
    }
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    setSelectedItem(null);
  };

  const items =
    activeTab === 0
      ? presetsData?.listPresets || []
      : filmSimsData?.listFilmSims || [];

  const loading = activeTab === 0 ? loadingPresets : loadingFilmSims;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Add {type === "preset" ? "Preset" : "Film Simulation"}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            value={searchQuery}
            onChange={handleSearch}
            placeholder={`Search ${
              type === "preset" ? "presets" : "film simulations"
            }...`}
            variant="outlined"
            size="small"
          />
        </Box>

        <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 2 }}>
          <Tab label="Presets" />
          <Tab label="Film Simulations" />
        </Tabs>

        {loading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : (
          <List sx={{ maxHeight: 400, overflow: "auto" }}>
            {items.map((item: any) => (
              <ListItem key={item.id} disablePadding>
                <ListItemButton
                  selected={selectedItem === item.id}
                  onClick={() => handleItemSelect(item.id)}
                >
                  <ListItemAvatar>
                    <Avatar src={item.thumbnail} alt={item.title || item.name}>
                      {(item.title || item.name)[0]}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={item.title || item.name}
                    secondary={item.slug}
                  />
                </ListItemButton>
              </ListItem>
            ))}
            {items.length === 0 && searchQuery && (
              <ListItem>
                <ListItemText
                  primary={
                    <Typography color="text.secondary">
                      No {type === "preset" ? "presets" : "film simulations"}{" "}
                      found
                    </Typography>
                  }
                />
              </ListItem>
            )}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleAdd}
          variant="contained"
          disabled={!selectedItem}
        >
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddItemDialog;
