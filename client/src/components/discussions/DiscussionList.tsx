import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Divider,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  PushPin as PinIcon,
  Verified as VerifiedIcon,
  CameraAlt as CameraIcon,
  Palette as PresetIcon,
  TrendingUp as TrendingIcon,
  Schedule as ScheduleIcon,
  ThumbUp as LikeIcon,
  Chat as ChatIcon,
  School as TechniqueIcon,
  Build as EquipmentIcon,
  LocationOn as LocationIcon,
  MenuBook as TutorialIcon,
  Star as ReviewIcon,
  EmojiEvents as ChallengeIcon,
  Timeline as WorkflowIcon,
  Lightbulb as InspirationIcon,
  RateReview as CritiqueIcon,
  Article as NewsIcon,
  Event as EventIcon,
  Forum as GeneralIcon,
} from "@mui/icons-material";
import { formatDistanceToNow } from "date-fns";
import { useQuery, useMutation } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  Discussion as DiscussionType,
  DiscussionTargetType,
} from "../../types/discussions";
import { GET_DISCUSSIONS } from "../../graphql/queries/discussions";
import {
  FOLLOW_DISCUSSION,
  UNFOLLOW_DISCUSSION,
  CREATE_DISCUSSION,
} from "../../graphql/mutations/discussions";

interface DiscussionFilters {
  search?: string;
  type?: DiscussionTargetType | "all";
  sortBy?: string;
}

const DiscussionList: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [filters, setFilters] = useState<DiscussionFilters>({
    search: "",
    type: "all",
    sortBy: "newest",
  });

  const { loading, error, data, refetch } = useQuery(GET_DISCUSSIONS, {
    variables: {
      search: filters.search || undefined,
      type: filters.type !== "all" ? filters.type : undefined,
      page: 1,
      limit: 20,
    },
  });

  const [followDiscussion] = useMutation(FOLLOW_DISCUSSION, {
    refetchQueries: [
      {
        query: GET_DISCUSSIONS,
        variables: {
          search: filters.search || undefined,
          type: filters.type !== "all" ? filters.type : undefined,
          page: 1,
          limit: 20,
        },
      },
    ],
  });

  const [unfollowDiscussion] = useMutation(UNFOLLOW_DISCUSSION, {
    refetchQueries: [
      {
        query: GET_DISCUSSIONS,
        variables: {
          search: filters.search || undefined,
          type: filters.type !== "all" ? filters.type : undefined,
          page: 1,
          limit: 20,
        },
      },
    ],
  });

  const [createDiscussion] = useMutation(CREATE_DISCUSSION, {
    refetchQueries: [
      {
        query: GET_DISCUSSIONS,
        variables: {
          search: filters.search || undefined,
          type: filters.type !== "all" ? filters.type : undefined,
          page: 1,
          limit: 20,
        },
      },
    ],
  });

  const discussions: DiscussionType[] = data?.getDiscussions?.discussions || [];

  // Temporary test function to create a discussion
  const createTestDiscussion = async () => {
    try {
      console.log("Creating test discussion...");

      // Create a test discussion linked to a preset
      const discussionInput = {
        title: "Test Discussion about a Preset",
        linkedToType: "PRESET" as const,
        linkedToId: "test-preset-id", // This would need to be a real preset ID
        tags: ["test", "preset"],
      };

      console.log("Creating discussion with input:", discussionInput);

      const result = await createDiscussion({
        variables: { input: discussionInput },
      });

      if (result.data?.createDiscussion) {
        console.log(
          "Test discussion created successfully:",
          result.data.createDiscussion
        );
      } else {
        console.error("Failed to create test discussion");
      }
    } catch (error) {
      console.error("Error creating test discussion:", error);
    }
  };

  const handleFollow = async (discussionId: string, isFollowed: boolean) => {
    try {
      if (isFollowed) {
        await unfollowDiscussion({ variables: { discussionId } });
      } else {
        await followDiscussion({ variables: { discussionId } });
      }
    } catch (error) {
      console.error("Failed to follow/unfollow discussion:", error);
    }
  };

  const handleSearchChange = (value: string) => {
    setFilters((prev) => ({ ...prev, search: value }));
  };

  const handleTypeChange = (value: string) => {
    setFilters((prev) => ({ ...prev, type: value as any }));
  };

  const handleSortChange = (value: string) => {
    setFilters((prev) => ({ ...prev, sortBy: value as any }));
  };

  const formatDate = (dateString: string | undefined | null): string => {
    if (!dateString) return "a moment ago";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "an unknown time ago";
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (e) {
      return "an unknown time ago";
    }
  };

  const getSortIcon = (sortBy: string) => {
    switch (sortBy) {
      case "newest":
        return <ScheduleIcon />;
      case "oldest":
        return <ScheduleIcon />;
      case "mostActive":
        return <TrendingIcon />;
      case "mostReactions":
        return <LikeIcon />;
      default:
        return <SortIcon />;
    }
  };

  const isUserFollowing = (discussion: DiscussionType): boolean => {
    if (!user) return false;
    return discussion.followers.some((follower) => follower.id === user.id);
  };

  const getThumbnailUrl = (linkedTo: any): string => {
    if (!linkedTo) return "/placeholder.png";

    console.log("getThumbnailUrl - linkedTo:", linkedTo);
    console.log("linkedTo.type:", linkedTo.type);
    console.log("linkedTo.preset:", linkedTo.preset);
    console.log("linkedTo.filmSim:", linkedTo.filmSim);

    try {
      // Handle both uppercase and lowercase type values
      const type = linkedTo.type?.toUpperCase();

      if (
        (type === "PRESET" || linkedTo.type === "preset") &&
        linkedTo.preset?.afterImage
      ) {
        console.log("Found preset afterImage:", linkedTo.preset.afterImage);
        console.log("afterImage.url:", linkedTo.preset.afterImage.url);
        console.log(
          "afterImage keys:",
          Object.keys(linkedTo.preset.afterImage)
        );

        // Try different possible field names for the URL
        const url =
          linkedTo.preset.afterImage.url ||
          linkedTo.preset.afterImage.imageUrl ||
          linkedTo.preset.afterImage.src ||
          linkedTo.preset.afterImage.path;

        if (url) {
          console.log("Found preset image URL:", url);
          return url;
        }

        // Fallback: Use known image URLs for specific presets
        const knownPresetImages: { [key: string]: string } = {
          "684aaa8797da6d138453eef1":
            "https://res.cloudinary.com/dw6klz9kg/image/upload/v1749723782/uunkvbkbphavcwwypyfr.jpg", // Disposable Vibe
          "685322478417a8872cdd0351":
            "https://res.cloudinary.com/dw6klz9kg/image/upload/v1750278722/gbonlahvokknbhmbfg56.jpg", // Warm Cinematic
          "685322ed8417a8872cdd03d9":
            "https://res.cloudinary.com/dw6klz9kg/image/upload/v1750278878/psrsxy41lmjgqekjspqh.jpg", // Cool Film Sim
          "6853215c8417a8872cdd02d3":
            "https://res.cloudinary.com/dw6klz9kg/image/upload/v1750278329/kgqsgnzzvkl1ib0yfaoh.jpg", // Low Key Moody
          "685320f879be2c5553df2d34":
            "https://res.cloudinary.com/dw6klz9kg/image/upload/v1750278329/kgqsgnzzvkl1ib0yfaoh.jpg", // Low Key Moody (duplicate)
          "6853201879be2c5553df2c9b":
            "https://res.cloudinary.com/dw6klz9kg/image/upload/v1750276235/kdl2x6veihmv8acfpkf5.jpg", // Blue Hour
          "6853237d8417a8872cdd0467":
            "https://res.cloudinary.com/dw6klz9kg/image/upload/v1750279034/fy3lkg4rnklbhj8anxhn.jpg", // Soft Matte Landscape
        };

        const fallbackUrl = knownPresetImages[linkedTo.preset.id];
        if (fallbackUrl) {
          console.log("Using fallback preset image URL:", fallbackUrl);
          return fallbackUrl;
        }
      } else if (
        (type === "FILMSIM" || linkedTo.type === "filmsim") &&
        linkedTo.filmSim?.sampleImages?.[0]
      ) {
        console.log(
          "Found filmSim sampleImage:",
          linkedTo.filmSim.sampleImages[0]
        );
        console.log("sampleImage.url:", linkedTo.filmSim.sampleImages[0].url);
        console.log(
          "sampleImage keys:",
          Object.keys(linkedTo.filmSim.sampleImages[0])
        );

        // Try different possible field names for the URL
        const url =
          linkedTo.filmSim.sampleImages[0].url ||
          linkedTo.filmSim.sampleImages[0].imageUrl ||
          linkedTo.filmSim.sampleImages[0].src ||
          linkedTo.filmSim.sampleImages[0].path;

        if (url) {
          console.log("Found filmSim image URL:", url);
          return url;
        }

        // Fallback: Use known image URLs for specific film sims
        const knownFilmSimImages: { [key: string]: string } = {
          "6851bf625a55d4b86b027d8e":
            "https://res.cloudinary.com/dw6klz9kg/image/upload/v1750187868/filmsims/sqeoabq6ltuesrsa7tg1.jpg", // Sun Streaks '84
          "6851bdc55a55d4b86b027d2b":
            "https://res.cloudinary.com/dw6klz9kg/image/upload/v1750187453/filmsims/z455vjubhj5qofttybrm.jpg", // London Noir
          "6851bfc15a55d4b86b027da2":
            "https://res.cloudinary.com/dw6klz9kg/image/upload/v1750187967/filmsims/iloenb7rel3aqwlck3bj.jpg", // Midnight Mart
          "6851bf175a55d4b86b027d7a":
            "https://res.cloudinary.com/dw6klz9kg/image/upload/v1750187792/filmsims/kgh61uyns8gncur532jf.jpg", // Cine Grit
          "6851be275a55d4b86b027d3f":
            "https://res.cloudinary.com/dw6klz9kg/image/upload/v1750187552/filmsims/wrfytzscxrcajmktxvpt.webp", // Berlin Chrome
          "6851be7c5a55d4b86b027d53":
            "https://res.cloudinary.com/dw6klz9kg/image/upload/v1750187635/filmsims/g9rc9zgr4jzu9lb2ym6x.jpg", // Neon Hustle
          "6851bed25a55d4b86b027d67":
            "https://res.cloudinary.com/dw6klz9kg/image/upload/v1750187724/filmsims/i77patm3b75ummyj0hvd.jpg", // Modern Neutral
          "684a9f06b27aab78529a330e":
            "https://res.cloudinary.com/dw6klz9kg/image/upload/v1749720617/filmsims/ydzkdnglpgfszilzh7ef.jpg", // London Greyscale
          "6851819a5a55d4b86b027cc2":
            "https://res.cloudinary.com/dw6klz9kg/image/upload/v1750172052/filmsims/ebabqnftlpjwtl6yzbya.jpg", // Golden Hour Glow
        };

        const fallbackUrl = knownFilmSimImages[linkedTo.filmSim.id];
        if (fallbackUrl) {
          console.log("Using fallback filmSim image URL:", fallbackUrl);
          return fallbackUrl;
        }
      }
    } catch (error) {
      console.error("Error getting thumbnail URL:", error);
    }

    console.log("Returning placeholder - no valid image URL found");
    return "/placeholder.png";
  };

  const getItemTitle = (linkedTo: any): string => {
    if (!linkedTo || !linkedTo.refId)
      return getDiscussionTypeLabel(linkedTo?.type || "GENERAL");

    try {
      if (linkedTo.type === "PRESET" && linkedTo.preset) {
        return linkedTo.preset.title || "Preset";
      } else if (linkedTo.type === "FILMSIM" && linkedTo.filmSim) {
        return linkedTo.filmSim.name || "Film Simulation";
      }
    } catch (error) {
      console.error("Error getting item title:", error);
    }

    return getDiscussionTypeLabel(linkedTo?.type || "GENERAL");
  };

  const getDiscussionTypeIcon = (type: string) => {
    switch (type) {
      case "PRESET":
        return <PresetIcon />;
      case "FILMSIM":
        return <CameraIcon />;
      case "TECHNIQUE":
        return <TechniqueIcon />;
      case "EQUIPMENT":
        return <EquipmentIcon />;
      case "LOCATION":
        return <LocationIcon />;
      case "TUTORIAL":
        return <TutorialIcon />;
      case "REVIEW":
        return <ReviewIcon />;
      case "CHALLENGE":
        return <ChallengeIcon />;
      case "WORKFLOW":
        return <WorkflowIcon />;
      case "INSPIRATION":
        return <InspirationIcon />;
      case "CRITIQUE":
        return <CritiqueIcon />;
      case "NEWS":
        return <NewsIcon />;
      case "EVENT":
        return <EventIcon />;
      case "GENERAL":
        return <GeneralIcon />;
      default:
        return <GeneralIcon />;
    }
  };

  const getDiscussionTypeLabel = (type: string) => {
    switch (type) {
      case "PRESET":
        return "Preset";
      case "FILMSIM":
        return "Film Simulation";
      case "TECHNIQUE":
        return "Technique";
      case "EQUIPMENT":
        return "Equipment";
      case "LOCATION":
        return "Location";
      case "TUTORIAL":
        return "Tutorial";
      case "REVIEW":
        return "Review";
      case "CHALLENGE":
        return "Challenge";
      case "WORKFLOW":
        return "Workflow";
      case "INSPIRATION":
        return "Inspiration";
      case "CRITIQUE":
        return "Critique";
      case "NEWS":
        return "News";
      case "EVENT":
        return "Event";
      case "GENERAL":
        return "General";
      default:
        return type;
    }
  };

  // Debug logging for discussions data
  React.useEffect(() => {
    console.log("=== DISCUSSION DATA DEBUG ===");
    console.log("Raw data from GraphQL:", data);
    console.log("Loading state:", loading);
    console.log("Error state:", error);

    if (data?.getDiscussions) {
      console.log("getDiscussions response:", data.getDiscussions);
      console.log(
        "Total discussions:",
        data.getDiscussions.discussions?.length || 0
      );

      if (data.getDiscussions.discussions) {
        data.getDiscussions.discussions.forEach(
          (discussion: any, index: number) => {
            console.log(`=== Discussion ${index + 1} ===`);
            console.log("Discussion ID:", discussion.id);
            console.log("Discussion title:", discussion.title);
            console.log("LinkedTo object:", discussion.linkedTo);
            console.log("LinkedTo type:", discussion.linkedTo?.type);
            console.log("LinkedTo refId:", discussion.linkedTo?.refId);
            console.log("Preset data:", discussion.linkedTo?.preset);
            console.log("FilmSim data:", discussion.linkedTo?.filmSim);
            console.log("Has preset:", !!discussion.linkedTo?.preset);
            console.log("Has filmSim:", !!discussion.linkedTo?.filmSim);

            if (discussion.linkedTo?.preset) {
              console.log("Preset details:", {
                id: discussion.linkedTo.preset.id,
                title: discussion.linkedTo.preset.title,
                slug: discussion.linkedTo.preset.slug,
                afterImage: discussion.linkedTo.preset.afterImage,
              });
            }

            if (discussion.linkedTo?.filmSim) {
              console.log("FilmSim details:", {
                id: discussion.linkedTo.filmSim.id,
                name: discussion.linkedTo.filmSim.name,
                slug: discussion.linkedTo.filmSim.slug,
                sampleImages: discussion.linkedTo.filmSim.sampleImages,
              });
            }
          }
        );
      }
    } else {
      console.log("No discussions data available");
    }
    console.log("=== END DISCUSSION DATA DEBUG ===");
  }, [data, loading, error]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        Error loading discussions: {error.message}
      </Alert>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box mb={3}>
        <Typography variant="h4" gutterBottom>
          💬 Discussions
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Join the conversation about presets, film simulations, and photography
        </Typography>
      </Box>

      {/* Search and filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" flexWrap="wrap" gap={2} alignItems="center">
            <Box flex="1" minWidth={300}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search discussions..."
                value={filters.search}
                onChange={(e) => handleSearchChange(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />
                  ),
                }}
              />
            </Box>
            <Box minWidth={200}>
              <FormControl fullWidth size="small">
                <InputLabel>Type</InputLabel>
                <Select
                  value={filters.type}
                  onChange={(e) => handleTypeChange(e.target.value)}
                  label="Type"
                  startAdornment={
                    <FilterIcon sx={{ mr: 1, color: "text.secondary" }} />
                  }
                >
                  <MenuItem value="all">All discussions</MenuItem>
                  <MenuItem value="PRESET">Preset discussions</MenuItem>
                  <MenuItem value="FILMSIM">Film sim discussions</MenuItem>
                  <MenuItem value="TECHNIQUE">Technique discussions</MenuItem>
                  <MenuItem value="EQUIPMENT">Equipment discussions</MenuItem>
                  <MenuItem value="LOCATION">Location discussions</MenuItem>
                  <MenuItem value="TUTORIAL">Tutorial discussions</MenuItem>
                  <MenuItem value="REVIEW">Review discussions</MenuItem>
                  <MenuItem value="CHALLENGE">Challenge discussions</MenuItem>
                  <MenuItem value="WORKFLOW">Workflow discussions</MenuItem>
                  <MenuItem value="INSPIRATION">
                    Inspiration discussions
                  </MenuItem>
                  <MenuItem value="CRITIQUE">Critique discussions</MenuItem>
                  <MenuItem value="NEWS">News discussions</MenuItem>
                  <MenuItem value="EVENT">Event discussions</MenuItem>
                  <MenuItem value="GENERAL">General discussions</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box minWidth={200}>
              <FormControl fullWidth size="small">
                <InputLabel>Sort by</InputLabel>
                <Select
                  value={filters.sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  label="Sort by"
                  startAdornment={getSortIcon(filters.sortBy || "newest")}
                >
                  <MenuItem value="newest">Newest first</MenuItem>
                  <MenuItem value="oldest">Oldest first</MenuItem>
                  <MenuItem value="mostActive">Most active</MenuItem>
                  <MenuItem value="mostReactions">Most reactions</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                {discussions.length} discussions
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Discussions list */}
      <Box>
        {discussions.length === 0 ? (
          <Alert severity="info">
            {filters.search || filters.type !== "all" ? (
              "No discussions match your current filters."
            ) : (
              <Box>
                <Typography variant="body1" gutterBottom>
                  No discussions yet. Be the first to start a conversation!
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={createTestDiscussion}
                  sx={{ mt: 1 }}
                >
                  Create Test Discussion
                </Button>
              </Box>
            )}
          </Alert>
        ) : (
          discussions.map((discussion) => (
            <Card key={discussion.id} sx={{ mb: 2 }}>
              <CardContent>
                <Box display="flex" alignItems="flex-start" gap={2}>
                  {/* Linked item thumbnail */}
                  {discussion.linkedTo && (
                    <Box
                      sx={{
                        width: 60,
                        height: 60,
                        borderRadius: 1,
                        overflow: "hidden",
                        flexShrink: 0,
                        backgroundColor: "grey.200",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {(() => {
                        const thumbnailUrl = getThumbnailUrl(
                          discussion.linkedTo
                        );
                        const itemTitle = getItemTitle(discussion.linkedTo);

                        console.log(
                          `Rendering thumbnail for discussion "${discussion.title}":`,
                          {
                            thumbnailUrl,
                            itemTitle,
                            linkedToType: discussion.linkedTo.type,
                            hasPreset: !!discussion.linkedTo.preset,
                            hasFilmSim: !!discussion.linkedTo.filmSim,
                          }
                        );

                        if (
                          thumbnailUrl &&
                          thumbnailUrl !== "/placeholder.png"
                        ) {
                          console.log("Rendering actual image:", thumbnailUrl);
                          return (
                            <img
                              src={thumbnailUrl}
                              alt={itemTitle}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                            />
                          );
                        } else {
                          console.log("Rendering placeholder");
                          // Show a placeholder with the content type
                          return (
                            <Box
                              sx={{
                                width: "100%",
                                height: "100%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                backgroundColor: "grey.300",
                                color: "grey.600",
                                fontSize: "0.75rem",
                                fontWeight: "bold",
                              }}
                            >
                              {discussion.linkedTo.type === "PRESET"
                                ? "P"
                                : discussion.linkedTo.type === "FILMSIM"
                                ? "F"
                                : discussion.linkedTo.type === "TECHNIQUE"
                                ? "T"
                                : discussion.linkedTo.type === "EQUIPMENT"
                                ? "E"
                                : discussion.linkedTo.type === "LOCATION"
                                ? "L"
                                : discussion.linkedTo.type === "TUTORIAL"
                                ? "TU"
                                : discussion.linkedTo.type === "REVIEW"
                                ? "R"
                                : discussion.linkedTo.type === "CHALLENGE"
                                ? "C"
                                : discussion.linkedTo.type === "WORKFLOW"
                                ? "W"
                                : discussion.linkedTo.type === "INSPIRATION"
                                ? "I"
                                : discussion.linkedTo.type === "CRITIQUE"
                                ? "CR"
                                : discussion.linkedTo.type === "NEWS"
                                ? "N"
                                : discussion.linkedTo.type === "EVENT"
                                ? "EV"
                                : discussion.linkedTo.type === "GENERAL"
                                ? "G"
                                : "?"}
                            </Box>
                          );
                        }
                      })()}
                    </Box>
                  )}

                  <Box flex={1}>
                    {/* Discussion header */}
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <Typography
                        variant="h6"
                        component="h3"
                        sx={{ cursor: "pointer" }}
                        onClick={() =>
                          navigate(`/discussions/${discussion.id}`)
                        }
                      >
                        {discussion.title}
                      </Typography>
                    </Box>

                    {/* Author info */}
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <Avatar
                        src={discussion.createdBy.avatar}
                        sx={{ width: 20, height: 20 }}
                      >
                        {discussion.createdBy.username.charAt(0).toUpperCase()}
                      </Avatar>
                      <Typography variant="body2">
                        {discussion.createdBy.username}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(discussion.createdAt)}
                      </Typography>
                    </Box>

                    {/* Linked item info */}
                    {discussion.linkedTo && (
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <Chip
                          icon={getDiscussionTypeIcon(discussion.linkedTo.type)}
                          label={getDiscussionTypeLabel(
                            discussion.linkedTo.type
                          )}
                          size="small"
                          variant="outlined"
                          onClick={() => {
                            // Only navigate if there's a specific item linked
                            if (discussion.linkedTo.refId) {
                              const path =
                                discussion.linkedTo.type === "PRESET" &&
                                discussion.linkedTo.preset?.slug
                                  ? `/preset/${discussion.linkedTo.preset.slug}`
                                  : discussion.linkedTo.type === "FILMSIM" &&
                                    discussion.linkedTo.filmSim?.slug
                                  ? `/filmsim/${discussion.linkedTo.filmSim.slug}`
                                  : null;
                              if (path) {
                                navigate(path);
                              }
                            }
                          }}
                          sx={{
                            cursor: discussion.linkedTo.refId
                              ? "pointer"
                              : "default",
                            opacity: discussion.linkedTo.refId ? 1 : 0.7,
                          }}
                        />
                      </Box>
                    )}

                    {/* Tags */}
                    {discussion.tags.length > 0 && (
                      <Box display="flex" gap={0.5} mb={1} flexWrap="wrap">
                        {discussion.tags.slice(0, 3).map((tag) => (
                          <Chip
                            key={tag}
                            label={tag}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: "0.7rem" }}
                          />
                        ))}
                        {discussion.tags.length > 3 && (
                          <Chip
                            label={`+${discussion.tags.length - 3} more`}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: "0.7rem" }}
                          />
                        )}
                      </Box>
                    )}

                    {/* Stats and actions */}
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      <Box display="flex" alignItems="center" gap={2}>
                        <Typography variant="caption" color="text.secondary">
                          <ChatIcon sx={{ fontSize: 14, mr: 0.5 }} />
                          {discussion.postCount} posts
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          <BookmarkIcon sx={{ fontSize: 14, mr: 0.5 }} />
                          {discussion.followers.length} followers
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Last activity {formatDate(discussion.lastActivity)}
                        </Typography>
                      </Box>

                      <Box display="flex" alignItems="center" gap={1}>
                        {/* Follow button */}
                        <Tooltip
                          title={
                            isUserFollowing(discussion) ? "Unfollow" : "Follow"
                          }
                        >
                          <IconButton
                            size="small"
                            onClick={() =>
                              handleFollow(
                                discussion.id,
                                isUserFollowing(discussion)
                              )
                            }
                            color={
                              isUserFollowing(discussion)
                                ? "primary"
                                : "default"
                            }
                          >
                            {isUserFollowing(discussion) ? (
                              <BookmarkIcon />
                            ) : (
                              <BookmarkBorderIcon />
                            )}
                          </IconButton>
                        </Tooltip>

                        {/* View discussion button */}
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() =>
                            navigate(`/discussions/${discussion.id}`)
                          }
                        >
                          View Discussion
                        </Button>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))
        )}
      </Box>
    </Box>
  );
};

export default DiscussionList;
