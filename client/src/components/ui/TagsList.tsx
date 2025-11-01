import React from "react";
import { Box, Stack, Typography } from "@mui/material";

interface Tag {
  id: string;
  displayName: string;
}

interface TagsListProps {
  tags: Tag[];
  activeTagId: string | null;
  onTagClick: (tagId: string, tagDisplayName: string) => void;
  onClear?: () => void;
  showAll?: boolean;
  isLoading?: boolean;
}

const TagsList: React.FC<TagsListProps> = ({
  tags,
  activeTagId,
  onTagClick,
  onClear,
  showAll = true,
  isLoading = false,
}) => {
  if (isLoading) {
    return null;
  }

  // Only display tags that exist with valid data
  const filteredTags = tags.filter(
    (tag) =>
      tag &&
      tag.id &&
      typeof tag.id === "string" &&
      tag.id.trim().length > 0 &&
      tag.displayName &&
      typeof tag.displayName === "string" &&
      tag.displayName.trim().length > 0
  );

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
      }}
    >
      {showAll && (
        <Typography
          onClick={onClear}
          sx={{
            cursor: "pointer",
            opacity: activeTagId ? 1 : 0.6,
            transition: "opacity 0.2s",
            whiteSpace: "nowrap",
            flexShrink: 0,
            "&:hover": {
              textDecoration: "underline",
              textUnderlineOffset: "4px",
            },
          }}
        >
          all
        </Typography>
      )}

      <Stack
        direction="row"
        spacing={2}
        sx={{
          overflowX: "auto",
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": { display: "none" },
          flex: 1,
          scrollSnapType: "x mandatory",
          "& > *": {
            scrollSnapAlign: "start",
          },
        }}
      >
        {filteredTags.map((tag) => (
          <Typography
            key={tag.id}
            onClick={() => onTagClick(tag.id, tag.displayName)}
            sx={{
              cursor: "pointer",
              fontWeight: activeTagId === tag.id ? "bold" : "normal",
              textDecoration: activeTagId === tag.id ? "underline" : "none",
              textUnderlineOffset: "4px",
              opacity: activeTagId === tag.id ? 1 : 0.6,
              transition: "opacity 0.2s",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            {tag.displayName.toLowerCase()}
          </Typography>
        ))}
      </Stack>
    </Box>
  );
};

export default TagsList;
