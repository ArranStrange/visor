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
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  CameraAlt as CameraIcon,
  Palette as PresetIcon,
  TrendingUp as TrendingIcon,
  Schedule as ScheduleIcon,
  Chat as ChatIcon,
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

  const [searchDebounced, setSearchDebounced] = useState("");

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setSearchDebounced(filters.search || "");
    }, 300); // 300ms delay

    return () => clearTimeout(timer);
  }, [filters.search]);

  const { loading, error, data, refetch } = useQuery(GET_DISCUSSIONS, {
    variables: {
      search: searchDebounced || undefined,
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

  const discussions: DiscussionType[] = data?.getDiscussions?.discussions || [];

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

  const highlightSearchTerms = (
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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    console.error("DiscussionList error details:", {
      message: error.message,
      graphQLErrors: error.graphQLErrors,
      networkError: error.networkError,
    });

    return (
      <Box py={4}>
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Error Loading Discussions
          </Typography>
          <Typography variant="body2" gutterBottom>
            {error.message}
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Button
              variant="contained"
              onClick={() => refetch()}
              sx={{ mr: 2 }}
            >
              Retry
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate("/discussions/new")}
            >
              Create New Discussion
            </Button>
          </Box>
        </Alert>
      </Box>
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
                placeholder="Search discussions, posts, and content..."
                value={filters.search}
                onChange={(e) => handleSearchChange(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />
                  ),
                  endAdornment: filters.search && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ mr: 1 }}
                    >
                      {loading
                        ? "Searching..."
                        : `${discussions.length} results`}
                    </Typography>
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

      {/* Search results summary */}
      {filters.search && (
        <Box mb={2}>
          <Typography variant="body2" color="text.secondary">
            {loading ? (
              "Searching..."
            ) : (
              <>
                Found {discussions.length} discussion
                {discussions.length !== 1 ? "s" : ""}
                {filters.type !== "all" &&
                  ` in ${getDiscussionTypeLabel(
                    filters.type as DiscussionTargetType
                  )}`}
                {filters.search && ` matching "${filters.search}"`}
              </>
            )}
          </Typography>
        </Box>
      )}

      {/* Discussions list */}
      <Box>
        {discussions.length === 0 ? (
          <Alert severity="info">
            {filters.search ? (
              <Box>
                <Typography variant="body1" gutterBottom>
                  No discussions found matching "{filters.search}".
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Try:
                </Typography>
                <Box component="ul" sx={{ pl: 2, mb: 2 }}>
                  <li>Using different keywords</li>
                  <li>Checking your spelling</li>
                  <li>Using fewer words</li>
                  <li>Clearing the type filter</li>
                </Box>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() =>
                    setFilters((prev) => ({ ...prev, search: "", type: "all" }))
                  }
                >
                  Clear Search
                </Button>
              </Box>
            ) : filters.type !== "all" ? (
              `No ${getDiscussionTypeLabel(
                filters.type as string
              ).toLowerCase()} discussions found.`
            ) : (
              <Typography variant="body1">
                No discussions yet. Be the first to start a conversation!
              </Typography>
            )}
          </Alert>
        ) : (
          discussions.map((discussion) => (
            <Card key={discussion.id} sx={{ mb: 2 }}>
              <CardContent>
                <Box display="flex" alignItems="flex-start" gap={2}>
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
                        {highlightSearchTerms(
                          discussion.title,
                          filters.search || ""
                        )}
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
