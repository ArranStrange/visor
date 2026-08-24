import React from "react";
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useNavigate } from "react-router-dom";

interface Creator {
  id: string;
  username: string;
  avatar?: string;
}

interface CreatorNotesProps {
  title: string;
  notes?: string;
  emptyFallback?: string;
  creator?: Creator;
  boldTitle?: boolean;
  bodyVariant?: "body1" | "body2";
  sx?: SxProps<Theme>;
}

const CreatorNotes: React.FC<CreatorNotesProps> = ({
  title,
  notes,
  emptyFallback,
  creator,
  boldTitle = false,
  bodyVariant = "body2",
  sx,
}) => {
  const navigate = useNavigate();

  if (!notes && !emptyFallback) {
    return null;
  }

  return (
    <Box sx={sx}>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{ backgroundColor: "none" }}
        >
          <Typography variant="h6" fontWeight={boldTitle ? "bold" : undefined}>
            {title}
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: 2,
            }}
          >
            <Typography variant={bodyVariant} color="text.secondary">
              {notes || emptyFallback}
            </Typography>
            {creator && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <img
                  src={creator.avatar}
                  alt={creator.username}
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "2px solid #eee",
                    cursor: "pointer",
                  }}
                  onClick={() => navigate(`/profile/${creator.id}`)}
                />
                <Typography
                  variant="subtitle1"
                  fontWeight={600}
                  sx={{ cursor: "pointer" }}
                  onClick={() => navigate(`/profile/${creator.id}`)}
                >
                  {creator.username}
                </Typography>
              </Box>
            )}
          </Box>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default CreatorNotes;
