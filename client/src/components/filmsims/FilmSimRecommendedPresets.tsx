import React from "react";
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Stack,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useNavigate } from "react-router-dom";

interface Preset {
  id: string;
  title: string;
  slug: string;
  description?: string;
  afterImage?: { url: string };
  creator?: { id: string; username: string; avatar?: string };
  tags?: { id: string; displayName: string }[];
}

interface FilmSim {
  recommendedPresets?: Preset[];
}

interface FilmSimRecommendedPresetsProps {
  filmSim: FilmSim;
  isOwner?: boolean;
  onRecommendedPresetsManage?: () => void;
}

const FilmSimRecommendedPresets: React.FC<FilmSimRecommendedPresetsProps> = ({
  filmSim,
  isOwner = false,
  onRecommendedPresetsManage,
}) => {
  const presets = filmSim.recommendedPresets || [];
  const navigate = useNavigate();

  return (
    <Accordion>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{ backgroundColor: "none" }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <Typography variant="h6">Recommended Presets</Typography>
          {isOwner && onRecommendedPresetsManage && (
            <div onClick={(e) => e.stopPropagation()}>
              <Box
                component="span"
                onClick={onRecommendedPresetsManage}
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  px: 2,
                  py: 0.5,
                  border: "1px solid",
                  borderColor: "primary.main",
                  borderRadius: 1,
                  color: "primary.main",
                  cursor: "pointer",
                  fontSize: "0.875rem",
                  "&:hover": {
                    backgroundColor: "primary.main",
                    color: "white",
                  },
                  ml: 2,
                }}
              >
                Manage
              </Box>
            </div>
          )}
        </div>
      </AccordionSummary>
      <AccordionDetails>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "1fr 1fr",
              md: "repeat(3, 1fr)",
            },
            gap: 2,
          }}
        >
          {presets.length > 0 ? (
            presets.map((preset) => (
              <Box
                key={preset.id}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: "background.default",
                  boxShadow: 1,
                  cursor: "pointer",
                  "&:hover": {
                    boxShadow: 2,
                    bgcolor: "action.hover",
                  },
                }}
                onClick={() => navigate(`/preset/${preset.slug}`)}
              >
                {preset.afterImage && (
                  <Box
                    sx={{
                      width: "100%",
                      height: 120,
                      borderRadius: 1,
                      overflow: "hidden",
                      mb: 1,
                    }}
                  >
                    <img
                      src={preset.afterImage.url}
                      alt={preset.title}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </Box>
                )}
                <Typography variant="h6" gutterBottom>
                  {preset.title}
                </Typography>
                {preset.creator && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 1 }}
                  >
                    by {preset.creator.username}
                  </Typography>
                )}
                {preset.description && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mb: 1,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {preset.description}
                  </Typography>
                )}
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {preset.tags?.map((tag) => (
                    <Chip
                      key={tag.id}
                      label={tag.displayName}
                      size="small"
                      variant="outlined"
                    />
                  ))}
                </Stack>
              </Box>
            ))
          ) : (
            <Typography variant="body2" color="text.secondary">
              No recommended presets available.
            </Typography>
          )}
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};

export default FilmSimRecommendedPresets;
