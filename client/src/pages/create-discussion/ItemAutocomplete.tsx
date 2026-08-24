import React, { useState } from "react";
import { useQuery } from "@apollo/client";
import {
  FormControl,
  TextField,
  Autocomplete,
  CircularProgress,
  Typography,
  Box,
} from "@mui/material";
import {
  DiscussionLinkedType,
  getDiscussionTypeLabel,
} from "./discussionTypeLabels";
import { SEARCH_PRESETS } from "../../graphql/presets";
import { GET_ALL_FILMSIMS } from "../../graphql/filmSims";

export interface LinkableItem {
  id: string;
  title?: string;
  name?: string;
  description?: string;
}

interface ItemAutocompleteProps {
  linkedToType: DiscussionLinkedType;
  selectedItem: LinkableItem | null;
  onChange: (item: LinkableItem | null) => void;
}

interface PaginatedPage {
  hasNextPage: boolean;
  currentPage: number;
}

interface SearchPresetsData {
  listPresets: PaginatedPage & { presets: LinkableItem[] };
}

interface SearchPresetsVariables {
  query: string;
  page: number;
  limit: number;
}

interface ListFilmSimsData {
  listFilmSims: PaginatedPage & { filmSims: LinkableItem[] };
}

interface ListFilmSimsVariables {
  page: number;
  limit: number;
}

const PICKER_PAGE_SIZE = 20;

const ItemAutocomplete: React.FC<ItemAutocompleteProps> = ({
  linkedToType,
  selectedItem,
  onChange,
}) => {
  const [inputValue, setInputValue] = useState("");
  const searchQuery = inputValue.trim();
  const shouldSearch = searchQuery.length >= 2;
  const presetQuery = useQuery<SearchPresetsData, SearchPresetsVariables>(
    SEARCH_PRESETS,
    {
      variables: { query: searchQuery, page: 1, limit: PICKER_PAGE_SIZE },
      skip: linkedToType !== "PRESET" || !shouldSearch,
    }
  );
  const filmSimQuery = useQuery<ListFilmSimsData, ListFilmSimsVariables>(
    GET_ALL_FILMSIMS,
    {
      variables: { page: 1, limit: PICKER_PAGE_SIZE },
      skip: linkedToType !== "FILMSIM",
    }
  );
  const items = getAvailableItems();
  const isLoading =
    (presetQuery.loading && !presetQuery.data) ||
    (filmSimQuery.loading && !filmSimQuery.data);

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
          inputValue={inputValue}
          onInputChange={handleInputChange}
          options={items}
          getOptionLabel={getOptionLabel}
          loading={isLoading}
          filterOptions={keepServerResults}
          renderInput={renderInput}
          renderOption={renderOption}
          ListboxProps={{ onScroll: handleListboxScroll }}
          noOptionsText={
            shouldSearch ? "No items found" : "Type at least 2 characters"
          }
          loadingText="Loading items..."
        />
      </FormControl>
    </>
  );

  function handleChange(
    _event: React.SyntheticEvent,
    newValue: LinkableItem | null
  ) {
    onChange(newValue);
  }

  function handleInputChange(_event: React.SyntheticEvent, value: string) {
    setInputValue(value);
  }

  function getOptionLabel(option: LinkableItem): string {
    return option.title || option.name || "";
  }

  function keepServerResults(options: LinkableItem[]) {
    return options;
  }

  function handleListboxScroll(event: React.UIEvent<HTMLUListElement>) {
    const listbox = event.currentTarget;
    const nearBottom =
      listbox.scrollTop + listbox.clientHeight >= listbox.scrollHeight - 40;
    if (!nearBottom) return;

    if (linkedToType === "PRESET") {
      const pageInfo = presetQuery.data?.listPresets;
      if (!pageInfo?.hasNextPage || presetQuery.loading) return;
      presetQuery.fetchMore({
        variables: { page: pageInfo.currentPage + 1 },
      });
      return;
    }

    const pageInfo = filmSimQuery.data?.listFilmSims;
    if (!pageInfo?.hasNextPage || filmSimQuery.loading) return;
    filmSimQuery.fetchMore({
      variables: { page: pageInfo.currentPage + 1 },
    });
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
              {isLoading ? (
                <CircularProgress color="inherit" size={20} />
              ) : null}
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

  function getAvailableItems() {
    if (!shouldSearch) return [];
    if (linkedToType === "PRESET") {
      return presetQuery.data?.listPresets.presets ?? [];
    }

    const normalizedQuery = searchQuery.toLowerCase();
    return (filmSimQuery.data?.listFilmSims.filmSims ?? []).filter((item) =>
      (item.name ?? "").toLowerCase().includes(normalizedQuery)
    );
  }
};

export default ItemAutocomplete;
