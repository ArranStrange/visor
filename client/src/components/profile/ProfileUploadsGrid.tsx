import React from "react";
import { Box, Typography } from "@mui/material";
import ContentTypeToggle from "../ui/ContentTypeToggle";
import ContentGridLoader from "../ui/ContentGridLoader";
import { useContentType } from "../../context/ContentTypeFilter";

interface ContentItem {
  type: "preset" | "film";
  data: any;
}

export interface ProfileUploadsGridProps {
  presets: any[];
  filmSims: any[];
  emptyStateMessage: string;
  heading?: string;
}

const ProfileUploadsGrid: React.FC<ProfileUploadsGridProps> = ({
  presets,
  filmSims,
  emptyStateMessage,
  heading = "Contributions",
}) => {
  const { contentType } = useContentType();
  const filteredContent = buildFilteredContent(presets, filmSims, contentType);

  return (
    <>
      <Box sx={{ mb: 3 }}>
        <ContentTypeToggle />
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          {heading}
        </Typography>
      </Box>

      <ContentGridLoader contentType={contentType} customData={filteredContent} />

      {filteredContent.length === 0 && (
        <Box display="flex" flexDirection="column" alignItems="center" py={8}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No content yet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {emptyStateMessage}
          </Typography>
        </Box>
      )}
    </>
  );
};

function buildFilteredContent(
  presets: any[],
  filmSims: any[],
  contentType: "all" | "presets" | "films"
): ContentItem[] {
  const allContent: ContentItem[] = [
    ...presets.map((preset) => ({ type: "preset" as const, data: preset })),
    ...filmSims.map((filmSim) => ({
      type: "film" as const,
      data: {
        ...filmSim,
        title: filmSim.name,
        thumbnail: filmSim.sampleImages?.[0]?.url || "",
        tags: filmSim.tags || [],
      },
    })),
  ];

  return allContent.filter((item) => {
    if (contentType === "all") return true;
    if (contentType === "presets") return item.type === "preset";
    if (contentType === "films") return item.type === "film";
    return true;
  });
}

export default ProfileUploadsGrid;
