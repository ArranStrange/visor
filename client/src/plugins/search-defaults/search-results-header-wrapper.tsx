import { Box, Divider } from "@mui/material";
import ContentTypeToggle from "components/ui/ContentTypeToggle";
import DebouncedTextField from "components/ui/DebouncedTextField";
import { textFieldOverlayStyles } from "theme/VISORTheme";

export function SearchResultsHeaderWrapper({
  keyword,
  onDebouncedKeywordChange,
}: any) {
  return (
    <>
      <DebouncedTextField
        placeholder="Search presets, film sims, tags…"
        value={keyword}
        onChange={onDebouncedKeywordChange}
        debounceTime={600}
        fullWidth
        sx={{ mb: 2, ...textFieldOverlayStyles }}
      />
      <Box sx={{ mb: 2 }}>
        <ContentTypeToggle />
      </Box>
      <Divider sx={{ my: 2 }} />
    </>
  );
}
