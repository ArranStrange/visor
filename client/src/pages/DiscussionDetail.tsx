import React from "react";
import {
  Container,
  Box,
  Typography,
  Breadcrumbs,
  Link,
  Card,
  CardContent,
  Avatar,
  Chip,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  NavigateNext as NavigateNextIcon,
  CameraAlt as CameraIcon,
  Palette as PresetIcon,
} from "@mui/icons-material";
import { useQuery, useMutation } from "@apollo/client";
import { useParams, useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "../context/AuthContext";
import {
  GET_DISCUSSION,
  CREATE_REPLY,
  UPDATE_REPLY,
  DELETE_REPLY,
} from "../graphql/discussions";
import { DiscussionPost } from "../types/discussions";
import Post from "../components/discussions/Post";
import PostComposer from "../components/discussions/PostComposer";
import { useDiscussionOperations } from "../hooks/useDiscussionOperations";

const DiscussionDetail: React.FC = () => {
  const { discussionId } = useParams<{ discussionId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const {
    loading: discussionLoading,
    error: discussionError,
    data: discussionData,
  } = useQuery(GET_DISCUSSION, {
    variables: { id: discussionId! },
    skip: !discussionId || discussionId === "new",
    errorPolicy: "all",
  });

  const discussion = discussionData?.getDiscussion;

  const posts = discussion?.posts || [];

  const itemType: "preset" | "filmsim" =
    discussion?.linkedTo?.type === "FILMSIM" ? "filmsim" : "preset";
  const itemId = discussion?.linkedTo?.refId || "";
  const itemTitle = discussion?.title || "";

  const { handleCreatePost, handleEdit, handleDelete } =
    useDiscussionOperations(itemId, itemType, itemTitle, discussion ?? null, {
      query: GET_DISCUSSION,
      variables: { id: discussionId! },
    });

  const [createReply] = useMutation(CREATE_REPLY, {
    refetchQueries: [
      { query: GET_DISCUSSION, variables: { id: discussionId! } },
    ],
  });

  const [updateReply] = useMutation(UPDATE_REPLY, {
    refetchQueries: [
      { query: GET_DISCUSSION, variables: { id: discussionId! } },
    ],
  });

  const [deleteReply] = useMutation(DELETE_REPLY, {
    refetchQueries: [
      { query: GET_DISCUSSION, variables: { id: discussionId! } },
    ],
  });

  const handleReply = async (postIndex: number, content: string) => {
    try {
      await createReply({
        variables: {
          input: {
            discussionId: discussionId!,
            postIndex,
            content: content.trim(),
          },
        },
      });
    } catch (error) {
      console.error("Failed to create reply:", error);
    }
  };

  const handleEditReply = async (
    postIndex: number,
    replyIndex: number,
    content: string
  ) => {
    try {
      await updateReply({
        variables: {
          input: {
            discussionId: discussionId!,
            postIndex,
            replyIndex,
            content: content.trim(),
          },
        },
      });
    } catch (error) {
      console.error("Failed to update reply:", error);
    }
  };

  const handleDeleteReply = async (postIndex: number, replyIndex: number) => {
    try {
      await deleteReply({
        variables: {
          discussionId: discussionId!,
          postIndex,
          replyIndex,
        },
      });
    } catch (error) {
      console.error("Failed to delete reply:", error);
    }
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

  if (discussionLoading) {
    return (
      <Container maxWidth="lg">
        <Box py={4} display="flex" justifyContent="center">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (discussionError) {
    return (
      <Container maxWidth="lg">
        <Box py={4}>
          <Alert severity="error">
            Error loading discussion: {discussionError.message}
          </Alert>
        </Box>
      </Container>
    );
  }

  if (!discussion) {
    return (
      <Container maxWidth="lg">
        <Box py={4}>
          <Typography variant="h4" gutterBottom>
            Discussion not found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Discussion ID: {discussionId}
          </Typography>
          {discussionError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              Error: {(discussionError as any)?.message || "Unknown error"}
            </Alert>
          )}
        </Box>
      </Container>
    );
  }

  // Get image URL from linked preset or filmSim
  const getLinkedImage = () => {
    if (
      discussion.linkedTo.type === "PRESET" &&
      discussion.linkedTo.preset?.afterImage?.url
    ) {
      return discussion.linkedTo.preset.afterImage.url;
    }
    if (
      discussion.linkedTo.type === "FILMSIM" &&
      discussion.linkedTo.filmSim?.sampleImages?.[0]?.url
    ) {
      return discussion.linkedTo.filmSim.sampleImages[0].url;
    }
    return null;
  };

  const linkedImage = getLinkedImage();

  return (
    <Container maxWidth="lg">
      <Box py={2}>
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" />}
          sx={{ mb: 2 }}
        >
          <Link
            color="inherit"
            href="/discussions"
            onClick={(e) => {
              e.preventDefault();
              navigate("/discussions");
            }}
          >
            Discussions
          </Link>
          <Typography color="text.primary">{discussion.title}</Typography>
        </Breadcrumbs>

        {/* Discussion Header */}
        <Card sx={{ mb: 2 }}>
          <CardContent sx={{ pb: 2, "&:last-child": { pb: 2 } }}>
            <Box display="flex" alignItems="flex-start" gap={2}>
              {linkedImage && (
                <Box
                  sx={{
                    width: 120,
                    height: 120,
                    borderRadius: 2,
                    overflow: "hidden",
                    flexShrink: 0,
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    const path =
                      discussion.linkedTo.type === "PRESET"
                        ? `/preset/${discussion.linkedTo.preset?.slug}`
                        : `/filmsim/${discussion.linkedTo.filmSim?.slug}`;
                    navigate(path);
                  }}
                >
                  <img
                    src={linkedImage}
                    alt={
                      discussion.linkedTo.preset?.title ||
                      discussion.linkedTo.filmSim?.name ||
                      ""
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
                <Box display="flex" alignItems="center" gap={1.5} mb={0.5}>
                  <Avatar
                    src={discussion.createdBy.avatar}
                    sx={{ width: 32, height: 32 }}
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

                <Typography variant="h5" component="h1" mb={0.5}>
                  {discussion.title}
                </Typography>

                {/* Linked item */}
                {discussion.linkedTo && (
                  <Box display="flex" gap={1} mb={1}>
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

                <Box display="flex" gap={2} mt={0.5}>
                  <Typography variant="caption" color="text.secondary">
                    {discussion.posts.length} posts
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {discussion.followers.length} followers
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Last activity {formatDate(discussion.updatedAt)}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {user && (
          <Card sx={{ mb: 2 }}>
            <CardContent sx={{ py: 2, "&:last-child": { pb: 2 } }}>
              <PostComposer
                onSubmit={handleCreatePost}
                placeholder="Add to the discussion..."
                buttonText="Post"
              />
            </CardContent>
          </Card>
        )}

        {/* Posts */}
        <Box>
          {posts.length === 0 ? (
            <Alert severity="info">
              No posts yet. Be the first to join the discussion!
            </Alert>
          ) : (
            posts.map((post: DiscussionPost, index: number) => (
              <Post
                key={index}
                post={post}
                postIndex={index}
                discussionId={discussion.id}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onReply={handleReply}
                onEditReply={handleEditReply}
                onDeleteReply={handleDeleteReply}
              />
            ))
          )}
        </Box>
      </Box>
    </Container>
  );
};

export default DiscussionDetail;
