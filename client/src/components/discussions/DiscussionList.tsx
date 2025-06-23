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
            {filters.search || filters.type !== "all"
              ? "No discussions match your current filters."
              : "No discussions yet. Be the first to start a conversation!"}
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
                      }}
                    >
                      <img
                        src={
                          discussion.linkedTo.preset?.thumbnail ||
                          discussion.linkedTo.filmSim?.thumbnail ||
                          "/placeholder.png"
                        }
                        alt={
                          discussion.linkedTo.preset?.title ||
                          discussion.linkedTo.filmSim?.name ||
                          "Linked item"
                        }
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
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
                          icon={
                            discussion.linkedTo.type === "PRESET" ? (
                              <PresetIcon />
                            ) : (
                              <CameraIcon />
                            )
                          }
                          label={
                            discussion.linkedTo.preset?.title ||
                            discussion.linkedTo.filmSim?.name
                          }
                          size="small"
                          variant="outlined"
                          onClick={() => {
                            const path =
                              discussion.linkedTo.type === "PRESET"
                                ? `/preset/${discussion.linkedTo.preset?.slug}`
                                : `/filmsim/${discussion.linkedTo.filmSim?.slug}`;
                            navigate(path);
                          }}
                          sx={{ cursor: "pointer" }}
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
