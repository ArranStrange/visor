import React from "react";
import { Box } from "@mui/material";
import DiscussionThread from "components/discussions/DiscussionThread";

export function DiscussionThreadWrapper({ preset }: any) {
  return (
    <Box mt={4}>
      <DiscussionThread
        itemId={preset.id}
        itemType="preset"
        itemTitle={preset.title}
        isEmbedded={true}
        showPreviewOnly={false}
        minimalHeader={true}
      />
    </Box>
  );
}

