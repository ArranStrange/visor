import React from "react";
import {
  FormControl,
  TextField,
  Autocomplete,
  CircularProgress,
  Typography,
  Box,
} from "@mui/material";
import { DiscussionLinkedType, getDiscussionTypeLabel } from "./discussionTypeLabels";

export interface LinkableItem {
  id: string;
  title?: string;
  name?: string;
  description?: string;
}

interface ItemAutocompleteProps {
  linkedToType: DiscussionLinkedType;
  items: LinkableItem[];
  selectedItem: LinkableItem | null;
  isLoading: boolean;
  onChange: (item: LinkableItem | null) => void;
}

const ItemAutocomplete: React.FC<ItemAutocompleteProps> = ({
  linkedToType,
  items,
  selectedItem,
  isLoading,
  onChange,
}) => {
  return (
    <>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Optionally link this discussion to a specific{" "}
        {linkedToType === "PRESET" ? "preset" : "film simulation"}. This helps
        others discover your discussion when viewing that item.
      </Typography>
      <FormControl fullWidth sx={{ mb: 3 }}>
        <Autocomplete
          value={selectedItem}
          onChange={handleChange}
          options={items}
          getOptionLabel={getOptionLabel}
          loading={isLoading}
          filterOptions={filterOptions}
          renderInput={renderInput}
          renderOption={renderOption}
          noOptionsText="No items found"
          loadingText="Loading items..."
        />
      </FormControl>
    </>
  );

  function handleChange(_event: React.SyntheticEvent, newValue: LinkableItem | null) {
    onChange(newValue);
  }

  function getOptionLabel(option: LinkableItem): string {
    return option.title || option.name || "";
  }

  function filterOptions(
    options: LinkableItem[],
    { inputValue }: { inputValue: string }
  ): LinkableItem[] {
    if (!inputValue) {
      return options.slice(0, 20);
    }

    const searchTerm = inputValue.toLowerCase();
    const filtered = options.filter((option) => {
      const title = (option.title || option.name || "").toLowerCase();
      return title.includes(searchTerm);
    });

    return filtered.slice(0, 50);
  }

  function renderInput(params: React.ComponentProps<typeof TextField>) {
    return (
      <TextField
        {...params}
        placeholder={`Search ${getDiscussionTypeLabel(linkedToType)}... (Optional)`}
        InputProps={{
          ...params.InputProps,
          endAdornment: (
            <>
              {isLoading ? <CircularProgress color="inherit" size={20} /> : null}
              {params.InputProps?.endAdornment}
            </>
          ),
        }}
      />
    );
  }

  function renderOption(
    props: React.HTMLAttributes<HTMLLIElement>,
    option: LinkableItem
  ) {
    return (
      <li {...props}>
        <Box>
          <Typography variant="body2">{option.title || option.name}</Typography>
          {option.description && (
            <Typography variant="caption" color="text.secondary">
              {option.description}
            </Typography>
          )}
        </Box>
      </li>
    );
  }
};

export default ItemAutocomplete;
