import React from "react";
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useNavigate } from "react-router-dom";

interface Creator {
  id: string;
  username: string;
  avatar?: string;
}

interface FilmSim {
  notes?: string;
  creator?: Creator;
}

interface FilmSimCreatorNotesProps {
  filmSim: FilmSim;
}

const FilmSimCreatorNotes: React.FC<FilmSimCreatorNotesProps> = ({ filmSim }) => {
  const { notes, creator } = filmSim;
  const navigate = useNavigate();

  return (
    <Box sx={{ mt: 4 }}>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{ backgroundColor: "none" }}
        >
          <Typography variant="h6">Creator's Notes</Typography>
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
            <Typography variant="body1" color="text.secondary">
              {notes || "No notes provided."}
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

export default FilmSimCreatorNotes;

