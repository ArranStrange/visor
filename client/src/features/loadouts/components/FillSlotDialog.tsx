import React from "react";
import { useQuery } from "@apollo/client";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  Alert,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { GET_USER_LISTS } from "@/features/lists/graphql/lists";
import { useAuth } from "@/context/AuthContext";
import { optimizeImageUrl } from "@/utils/cloudinary";

interface ListFilmSim {
  id: string;
  name: string;
  slug: string;
  sampleImages?: { url: string }[];
}

interface FillSlotDialogProps {
  open: boolean;
  slotIndex: number | null;
  onClose: () => void;
  onPick: (filmSim: { id: string; name: string }) => void;
}

// The one fill entry point for Stage 2: pick a film sim from your lists.
// Lists are the library; the wallet packs from it.
const FillSlotDialog: React.FC<FillSlotDialogProps> = ({
  open,
  slotIndex,
  onClose,
  onPick,
}) => {
  const { user } = useAuth();
  const { data, loading, error } = useQuery(GET_USER_LISTS, {
    variables: { userId: user?.id ?? "" },
    skip: !open || !user,
  });

  const lists = (data?.getUserLists ?? []).filter(
    (list: { filmSims?: ListFilmSim[] }) => (list.filmSims?.length ?? 0) > 0
  );

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        Fill{" "}
        <Typography
          component="span"
          sx={{ fontFamily: "monospace", fontWeight: 700, color: "secondary.main" }}
        >
          C{(slotIndex ?? 0) + 1}
        </Typography>{" "}
        from your lists
      </DialogTitle>
      <DialogContent dividers sx={{ minHeight: 240 }}>
        {loading && (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress size={28} />
          </Box>
        )}
        {error && <Alert severity="error">Couldn't load your lists.</Alert>}
        {!loading && !error && lists.length === 0 && (
          <Alert severity="info">
            None of your lists contain film sims yet. Add recipes to a list
            first — lists are the library the wallet packs from.
          </Alert>
        )}
        {lists.map(
          (list: { id: string; name: string; filmSims: ListFilmSim[] }) => (
            <Accordion key={list.id} disableGutters>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle2">{list.name}</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                  {list.filmSims.length} film sims
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                {list.filmSims.map((filmSim) => (
                  <Box
                    key={filmSim.id}
                    onClick={() => onPick({ id: filmSim.id, name: filmSim.name })}
                    role="button"
                    tabIndex={0}
                    aria-label={`Fill slot with ${filmSim.name}`}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onPick({ id: filmSim.id, name: filmSim.name });
                      }
                    }}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      p: 1,
                      borderRadius: 1.5,
                      cursor: "pointer",
                      "&:hover": { backgroundColor: "action.hover" },
                    }}
                  >
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: 1,
                        overflow: "hidden",
                        backgroundColor: "surface.input",
                        flexShrink: 0,
                      }}
                    >
                      {filmSim.sampleImages?.[0]?.url && (
                        <img
                          src={optimizeImageUrl(filmSim.sampleImages[0].url, 72)}
                          alt=""
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      )}
                    </Box>
                    <Typography variant="body2">{filmSim.name}</Typography>
                  </Box>
                ))}
              </AccordionDetails>
            </Accordion>
          )
        )}
      </DialogContent>
    </Dialog>
  );
};

export default FillSlotDialog;
