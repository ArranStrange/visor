import React from "react";
import { Box } from "@mui/material";

export const highlightSearchTerms = (
  text: string,
  searchTerms: string
): React.ReactNode => {
  if (!searchTerms || !text) return text;

  const terms = searchTerms
    .toLowerCase()
    .split(/\s+/)
    .filter((term) => term.length > 0);
  if (terms.length === 0) return text;

  let highlightedText = text;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;

  terms.forEach((term) => {
    const regex = new RegExp(`(${term})`, "gi");
    const matches = [...highlightedText.matchAll(regex)];

    matches.forEach((match) => {
      const startIndex = match.index!;
      const endIndex = startIndex + match[0].length;

      if (startIndex > lastIndex) {
        parts.push(highlightedText.slice(lastIndex, startIndex));
      }

      parts.push(
        <Box
          key={`${startIndex}-${endIndex}`}
          component="span"
          sx={{
            backgroundColor: "rgba(255, 126, 77, 0.15)",
            fontWeight: "bold",
            borderRadius: "2px",
            padding: "0 2px",
          }}
        >
          {match[0]}
        </Box>
      );

      lastIndex = endIndex;
    });
  });

  if (lastIndex < highlightedText.length) {
    parts.push(highlightedText.slice(lastIndex));
  }

  return parts.length > 0 ? <>{parts}</> : text;
};
