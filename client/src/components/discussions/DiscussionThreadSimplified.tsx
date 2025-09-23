import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Chip,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Avatar,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  CameraAlt as CameraIcon,
  Palette as PresetIcon,
} from "@mui/icons-material";
import { useQuery } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Discussion as DiscussionType } from "../../types/discussions";
import { GET_DISCUSSION_BY_ITEM } from "../../graphql/queries/discussions";
import Post from "./Post";
import PostComposer from "./PostComposer";
import { useDiscussionPosts } from "../../hooks/useDiscussionPosts";
import { useDiscussionMutations } from "../../hooks/useDiscussionMutations";
import {
  organizePostsIntoThreads,
  formatDate,
} from "../../utils/discussionUtils";

interface DiscussionThreadProps {
  itemId: string;
  itemType: "preset" | "filmsim";
  itemTitle: string;
  itemSlug: string;
  itemThumbnail?: string;
  isEmbedded?: boolean;
  showPreviewOnly?: boolean;
  minimalHeader?: boolean;
}

const DiscussionThreadSimplified: React.FC<DiscussionThreadProps> = ({
  itemId,
  itemType,
  itemTitle,
  itemSlug,
  itemThumbnail,
  isEmbedded = true,
  showPreviewOnly = false,
  minimalHeader = false,
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showFullThread, setShowFullThread] = useState(false);
  const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set());
  const [loadedPostCount, setLoadedPostCount] = useState(10);

  const {
    loading: discussionLoading,
    error: discussionError,
    data: discussionData,
  } = useQuery(GET_DISCUSSION_BY_ITEM, {
    variables: {
      type: itemType.toUpperCase() as "PRESET" | "FILMSIM",
      refId: itemId,
    },
    skip: !itemId || !itemType,
  });

  const discussion: DiscussionType | null =
    discussionData?.getDiscussionByLinkedItem;

  const { posts, postsLoading, postsError, refetchTopLevel, fetchAllPosts } =
    useDiscussionPosts({
      discussionId: discussion?.id,
      isEmbedded,
      showFullThread,
    });

  const {
    creatingPost,
    handleFollow,
    handleCreatePost,
    handleReply,
    handleEdit,
    handleDelete,
    isUserFollowing,
  } = useDiscussionMutations({
    discussion,
    itemType,
    itemId,
    isEmbedded,
    showFullThread,
    refetchTopLevel,
    fetchAllPosts,
  });

  const handleToggleExpand = (postId: string) => {
    setExpandedPosts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  const handleLoadMore = () => {
    setLoadedPostCount((prev) => prev + 10);
  };

  // Render a post and its replies recursively
  const renderPostWithReplies = (post: any, depth: number = 0) => {
    return (
      <Box key={post.id}>
        <Post
          post={post}
          depth={depth}
          onReply={handleReply}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onPin={() => {}}
          onHighlight={() => {}}
          onReport={() => {}}
          onBlock={() => {}}
          maxDepth={3}
        />
        {/* Render replies */}
        {post.replies && post.replies.length > 0 && depth < 3 && (
          <Box>
            {post.replies.map((reply: any) =>
              renderPostWithReplies(reply, depth + 1)
            )}
          </Box>
        )}
      </Box>
    );
  };

  // Render a collapsed post for preview mode
  const renderCollapsedPost = (post: any) => {
    const isExpanded = expandedPosts.has(post.id);
    const hasReplies = post.replies && post.replies.length > 0;

    return (
      <Box key={post.id}>
        <Post
          post={post}
          depth={0}
          onReply={handleReply}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onPin={() => {}}
          onHighlight={() => {}}
          onReport={() => {}}
          onBlock={() => {}}
          maxDepth={3}
        />

        {/* Show replies only if expanded */}
        {hasReplies && isExpanded && post.replies && (
          <Box ml={3} mt={1}>
            {post.replies.map((reply: any) => (
              <Post
                key={reply.id}
                post={reply}
                depth={1}
                onReply={handleReply}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onPin={() => {}}
                onHighlight={() => {}}
                onReport={() => {}}
                onBlock={() => {}}
                maxDepth={3}
              />
            ))}
          </Box>
        )}

        {/* Expand/Collapse button for posts with replies */}
        {hasReplies && post.replies && (
          <Box ml={3} mt={1}>
            <Button
              size="small"
              variant="text"
              onClick={() => handleToggleExpand(post.id)}
              sx={{ minWidth: "auto", px: 1 }}
            >
              {isExpanded
                ? `Hide ${post.replies.length} replies`
                : `Show ${post.replies.length} replies`}
            </Button>
          </Box>
        )}
      </Box>
    );
  };

  if (discussionLoading || postsLoading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (discussionError) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        Error loading discussion: {discussionError.message}
      </Alert>
    );
  }

  if (postsError) {
    return (
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            💬 Discussions
          </Typography>
          {!showPreviewOnly && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              Unable to load posts at this time. The discussion system is being
              updated.
            </Alert>
          )}
          {discussion && user && !showPreviewOnly && (
            <PostComposer
              onSubmit={handleCreatePost}
              placeholder={`Start a discussion about this ${itemType}...`}
              buttonText="Start Discussion"
            />
          )}
        </CardContent>
      </Card>
    );
  }

  if (!discussion) {
    return (
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            💬 Discussions
          </Typography>
          {!showPreviewOnly && (
            <Typography variant="body2" color="text.secondary" mb={2}>
              No discussion thread found for this {itemType}.
            </Typography>
          )}
          {user && !showPreviewOnly && (
            <PostComposer
              onSubmit={handleCreatePost}
              placeholder={`Start a discussion about this ${itemType}...`}
              buttonText="Start Discussion"
            />
          )}
        </CardContent>
      </Card>
    );
  }

  // Show only the first few posts if embedded and not expanded
  const displayPosts =
    isEmbedded && !showFullThread
      ? posts.slice(0, showPreviewOnly ? loadedPostCount : 3)
      : posts;
  const hasMorePosts =
    isEmbedded && posts.length > (showPreviewOnly ? loadedPostCount : 3);

  // Organize posts into threaded structure
  const threadedPosts = organizePostsIntoThreads(displayPosts);

  return (
    <Box>
      {/* Discussion Header */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          {minimalHeader ? (
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
            >
              <Typography variant="h6" gutterBottom>
                Discussions
              </Typography>
              <Box display="flex" alignItems="center" gap={1}>
                <Tooltip
                  title={isUserFollowing(discussion) ? "Unfollow" : "Follow"}
                >
                  <IconButton
                    size="small"
                    onClick={handleFollow}
                    color={isUserFollowing(discussion) ? "primary" : "default"}
                  >
                    {isUserFollowing(discussion) ? (
                      <BookmarkIcon />
                    ) : (
                      <BookmarkBorderIcon />
                    )}
                  </IconButton>
                </Tooltip>

                {isEmbedded && (
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => navigate(`/discussions/${discussion.id}`)}
                  >
                    View Full Thread
                  </Button>
                )}
              </Box>
            </Box>
          ) : (
            <Box display="flex" alignItems="flex-start" gap={2}>
              <Avatar
                src={discussion.createdBy.avatar}
                sx={{ width: 50, height: 50, mt: 0.5 }}
              >
                {discussion.createdBy.username.charAt(0).toUpperCase()}
              </Avatar>
              <Box flex={1}>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <Typography variant="h4" component="h1" sx={{ flex: 1 }}>
                    {discussion.title}
                  </Typography>

                  <Tooltip
                    title={isUserFollowing(discussion) ? "Unfollow" : "Follow"}
                  >
                    <IconButton
                      size="small"
                      onClick={handleFollow}
                      color={
                        isUserFollowing(discussion) ? "primary" : "default"
                      }
                    >
                      {isUserFollowing(discussion) ? (
                        <BookmarkIcon />
                      ) : (
                        <BookmarkBorderIcon />
                      )}
                    </IconButton>
                  </Tooltip>

                  {isEmbedded && (
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => navigate(`/discussions/${discussion.id}`)}
                    >
                      View Full Thread
                    </Button>
                  )}
                </Box>

                {/* Linked item */}
                {discussion.linkedTo && (
                  <Box display="flex" gap={1} mb={2}>
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

                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography variant="caption" color="text.secondary">
                    by {discussion.createdBy.username}
                    {" • "}
                    {formatDate(discussion.createdAt)}
                  </Typography>
                  <Box display="flex" gap={1}>
                    <Typography variant="caption" color="text.secondary">
                      {discussion.postCount} posts
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {discussion.followers.length} followers
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Last activity {formatDate(discussion.lastActivity)}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Show the rest of the component only if not in preview mode */}
      {!showPreviewOnly ? (
        <>
          {/* Post composer */}
          {user && (
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <PostComposer
                  onSubmit={handleCreatePost}
                  placeholder="Add to the discussion..."
                  buttonText={creatingPost ? "Posting..." : "Post"}
                />
              </CardContent>
            </Card>
          )}

          {/* Posts */}
          <Box>
            {threadedPosts.length === 0 ? (
              <Alert severity="info">
                No posts yet. Be the first to join the discussion!
              </Alert>
            ) : (
              threadedPosts.map((post: any) => renderPostWithReplies(post))
            )}

            {/* Show more button */}
            {hasMorePosts && (
              <Box textAlign="center" mt={2}>
                <Button variant="outlined" onClick={handleLoadMore}>
                  Load {Math.min(10, posts.length - loadedPostCount)} more posts
                </Button>
              </Box>
            )}
          </Box>
        </>
      ) : (
        // Preview mode
        <>
          {/* Post composer */}
          {user && (
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <PostComposer
                  onSubmit={handleCreatePost}
                  placeholder="Add to the discussion..."
                  buttonText={creatingPost ? "Posting..." : "Post"}
                />
              </CardContent>
            </Card>
          )}

          {/* Posts */}
          <Box>
            {threadedPosts.length === 0 ? (
              <Alert severity="info">
                No posts yet. Be the first to join the discussion!
              </Alert>
            ) : (
              threadedPosts.map((post: any) => renderCollapsedPost(post))
            )}

            {/* Show more button */}
            {hasMorePosts && (
              <Box textAlign="center" mt={2}>
                <Button variant="outlined" onClick={handleLoadMore}>
                  Load {Math.min(10, posts.length - loadedPostCount)} more posts
                </Button>
              </Box>
            )}
          </Box>
        </>
      )}
    </Box>
  );
};

export default DiscussionThreadSimplified;
