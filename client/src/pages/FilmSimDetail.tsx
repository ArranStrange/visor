import React from "react";
import {
  Container,
  Typography,
  Box,
  Chip,
  Stack,
  Divider,
  CircularProgress,
  Alert,
  Dialog,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, gql } from "@apollo/client";
import { GET_FILMSIM_BY_SLUG } from "../graphql/queries/getFilmSimBySlug";
import PresetCard from "../components/PresetCard";
import AddToListButton from "../components/AddToListButton";
import CommentSection from "../components/CommentSection";
import { useAuth } from "../context/AuthContext";
import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const CREATE_COMMENT = gql`
  mutation CreateComment($filmSimId: ID!, $content: String!) {
    createComment(input: { filmSimId: $filmSimId, content: $content }) {
      id
      content
      author {
        id
        username
        avatar
      }
      createdAt
    }
  }
`;

const FilmSimDetails: React.FC = () => {
  const { slug } = useParams();
  const { user: currentUser } = useAuth();
  const [commentInput, setCommentInput] = React.useState("");
  const [localComments, setLocalComments] = React.useState<any[]>([]);
  const { loading, error, data, refetch } = useQuery(GET_FILMSIM_BY_SLUG, {
    variables: { slug },
  });
  const [createComment, { loading: creatingComment }] =
    useMutation(CREATE_COMMENT);
  const [fullscreenImage, setFullscreenImage] = React.useState<string | null>(
    null
  );

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          Error loading film simulation: {error.message}
        </Alert>
      </Container>
    );
  }

  const filmSim = data?.getFilmSim;

  if (!filmSim) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="info">Film simulation not found</Alert>
      </Container>
    );
  }

  // Helper function to format setting values
  const formatSettingValue = (value: any) => {
    if (value === undefined || value === null) return "N/A";
    if (typeof value === "number") return value.toString();
    return value;
  };

  // Combine server and local comments for optimistic UI
  const allComments = [...(filmSim.comments || []), ...localComments];

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim() || !currentUser) return;
    const optimisticComment = {
      id: `temp-${Date.now()}`,
      content: commentInput,
      author: {
        username: currentUser.username,
        avatar: currentUser.avatar,
      },
      createdAt: new Date().toISOString(),
    };
    setLocalComments((prev) => [optimisticComment, ...prev]);
    setCommentInput("");
    try {
      await createComment({
        variables: {
          filmSimId: filmSim.id,
          content: optimisticComment.content,
        },
      });
      refetch();
      setLocalComments([]);
    } catch (err) {
      // Optionally show error
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4, position: "relative" }}>
      <AddToListButton filmSimId={filmSim.id} itemName={filmSim.name} />

      {/* Header */}
      <Typography variant="h4" fontWeight={700} gutterBottom>
        {filmSim.name}
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={2}>
        {filmSim.description}
      </Typography>

      {/* Tags and camera compatibility */}
      <Stack direction="row" spacing={1} mb={2} flexWrap="wrap">
        {filmSim.tags?.map((tag) => (
          <Chip key={tag.id} label={tag.displayName} variant="outlined" />
        ))}
        {filmSim.compatibleCameras?.map((camera) => (
          <Chip key={camera} label={camera} color="secondary" />
        ))}
      </Stack>

      <Divider sx={{ my: 3 }} />

      {/* Camera Settings */}
      <Typography variant="h6" mt={4} mb={2}>
        In-Camera Settings
      </Typography>
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
        {[
          { label: "Dynamic Range", value: filmSim.settings?.dynamicRange },
          { label: "Highlight Tone", value: filmSim.settings?.highlight },
          { label: "Shadow Tone", value: filmSim.settings?.shadow },
          { label: "Colour", value: filmSim.settings?.colour },
          { label: "Sharpness", value: filmSim.settings?.sharpness },
          { label: "Noise Reduction", value: filmSim.settings?.noiseReduction },
          { label: "Grain Effect", value: filmSim.settings?.grainEffect },
          { label: "Clarity", value: filmSim.settings?.clarity },
          { label: "White Balance", value: filmSim.settings?.whiteBalance },
          {
            label: "WB Shift",
            value: filmSim.settings?.wbShift
              ? `R${formatSettingValue(
                  filmSim.settings.wbShift.r
                )} / B${formatSettingValue(filmSim.settings.wbShift.b)}`
              : "N/A",
          },
        ].map((setting) => (
          <Box
            key={setting.label}
            sx={{
              p: 2,
              borderRadius: 2,
              backgroundColor: "background.paper",
              boxShadow: 1,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="body2" color="text.secondary">
              {setting.label}
            </Typography>
            <Typography variant="body1" fontWeight={500}>
              {formatSettingValue(setting.value)}
            </Typography>
          </Box>
        ))}
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* Sample images */}
      <Typography variant="h6" mt={4} mb={1}>
        Sample Images
      </Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(3, 1fr)" },
          gap: 2,
        }}
      >
        {filmSim.sampleImages?.map((image) => (
          <Box key={image.id}>
            <img
              src={image.url}
              alt={image.caption || `Sample image for ${filmSim.name}`}
              style={{ width: "100%", borderRadius: 12, cursor: "pointer" }}
              onClick={() => setFullscreenImage(image.url)}
            />
          </Box>
        ))}
      </Box>

      {/* Fullscreen Image Modal */}
      <Dialog
        open={!!fullscreenImage}
        onClose={() => setFullscreenImage(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            background: "rgba(0,0,0,0.95)",
            boxShadow: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          },
        }}
      >
        <IconButton
          onClick={() => setFullscreenImage(null)}
          sx={{
            position: "absolute",
            top: 16,
            right: 16,
            color: "white",
            zIndex: 10,
            background: "rgba(0,0,0,0.3)",
            "&:hover": { background: "rgba(0,0,0,0.5)" },
          }}
        >
          <CloseIcon />
        </IconButton>
        {fullscreenImage && (
          <Box
            sx={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 400,
            }}
          >
            <img
              src={fullscreenImage}
              alt="Full size sample"
              style={{
                maxWidth: "90vw",
                maxHeight: "80vh",
                borderRadius: 12,
                boxShadow: "0 0 32px 0 rgba(0,0,0,0.7)",
                background: "#111",
              }}
            />
          </Box>
        )}
      </Dialog>

      {/* Creator's Notes and Recommended Presets */}
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
                {filmSim.notes || "No notes provided."}
              </Typography>
              {filmSim.creator && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <img
                    src={filmSim.creator.avatar}
                    alt={filmSim.creator.username}
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: "2px solid #eee",
                    }}
                  />
                  <Typography variant="subtitle1" fontWeight={600}>
                    {filmSim.creator.username}
                  </Typography>
                </Box>
              )}
            </Box>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{ backgroundColor: "none" }}
          >
            <Typography variant="h6">Recommended Presets</Typography>
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
              {filmSim.recommendedPresets?.map((preset) => (
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
                  onClick={() =>
                    (window.location.href = `/preset/${preset.slug}`)
                  }
                >
                  <Typography variant="h6" gutterBottom>
                    {preset.title}
                  </Typography>
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
              ))}
            </Box>
          </AccordionDetails>
        </Accordion>
      </Box>

      {/* Comments Section */}
      <Divider sx={{ my: 4 }} />
      <CommentSection
        comments={allComments.map((comment: any) => ({
          id: comment.id,
          username: comment.author?.username || "Anonymous",
          avatarUrl: comment.author?.avatar || undefined,
          content: comment.content,
          timestamp: comment.createdAt
            ? new Date(comment.createdAt).toLocaleString()
            : "",
        }))}
      />
      {/* Add Comment Form */}
      <Box
        component="form"
        onSubmit={handleAddComment}
        sx={{
          display: "flex",
          alignItems: "space-around",
          gap: 2,
          mt: 2,
          p: 2,
          borderRadius: 2,
          bgcolor: "background.paper",
          boxShadow: 1,
          maxWidth: "750px",
        }}
      >
        <Box
          component="img"
          src={currentUser?.avatar}
          alt={currentUser?.username}
          sx={{
            width: 40,
            height: 40,
            borderRadius: "50%",
          }}
        />
        <Box sx={{ flex: 1 }}>
          <Box
            sx={{
              display: "flex",
              gap: 1,
              alignItems: "center",
            }}
          >
            <input
              type="text"
              placeholder={
                currentUser ? "Add a comment..." : "Log in to comment"
              }
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              style={{
                flex: 1,
                padding: "10px 14px",
                borderRadius: 8,
                border: "1.5px solid white",
                fontSize: 16,
                width: "100%",
                maxWidth: "750px",
                background: "#181818",
                color: "#fff",
                outline: "none",
                transition: "border 0.2s",
              }}
              disabled={!currentUser || creatingComment}
            />
            <button
              type="submit"
              style={{
                padding: "10px 20px",
                borderRadius: 8,
                border: "1.5px solid white",
                background: "#181818",
                color: "#fff",
                fontWeight: 600,
                cursor:
                  !currentUser || creatingComment ? "not-allowed" : "pointer",
                opacity: !currentUser || creatingComment ? 0.7 : 1,
                transition: "background 0.2s",
              }}
              disabled={!currentUser || creatingComment || !commentInput.trim()}
            >
              {creatingComment ? "Posting..." : "Post"}
            </button>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default FilmSimDetails;
