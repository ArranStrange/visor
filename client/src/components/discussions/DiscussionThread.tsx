import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Chip,
  Divider,
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
import { formatDistanceToNow } from "date-fns";
import { useQuery, useMutation } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  Discussion as DiscussionType,
  DiscussionPost,
} from "../../types/discussions";
import {
  GET_DISCUSSION_BY_ITEM,
  GET_POSTS,
} from "../../graphql/queries/discussions";
import { CREATE_POST } from "../../graphql/mutations/discussions";
import {
  FOLLOW_DISCUSSION,
  UNFOLLOW_DISCUSSION,
  DELETE_POST,
  UPDATE_POST,
} from "../../graphql/mutations/discussions";
import Post from "./Post";
import PostComposer from "./PostComposer";
import { CREATE_DISCUSSION } from "../../graphql/mutations/discussions";
import { useApolloClient } from "@apollo/client";
import {
  useCreateNotification,
  createDiscussionReplyNotification,
} from "../../utils/notificationUtils";

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

const DiscussionThread: React.FC<DiscussionThreadProps> = ({
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
  const [showComposer, setShowComposer] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [replyImageUrl, setReplyImageUrl] = useState<string | undefined>();
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
  const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set());
  const [loadedPostCount, setLoadedPostCount] = useState(10);

  const client = useApolloClient();
  const createNotification = useCreateNotification();

  const {
    loading: discussionLoading,
    error: discussionError,
    data: discussionData,
    refetch: refetchDiscussion,
  } = useQuery(GET_DISCUSSION_BY_ITEM, {
    variables: {
      type: itemType.toUpperCase() as "PRESET" | "FILMSIM",
      refId: itemId,
    },
    skip: !itemId || !itemType,
  });

  const discussion: DiscussionType | null =
    discussionData?.getDiscussionByLinkedItem;

  // Query for top-level posts only
  const {
    data: topLevelPostsData,
    loading: topLevelLoading,
    error: topLevelError,
    refetch: refetchTopLevel,
  } = useQuery(GET_POSTS, {
    variables: {
      discussionId: discussion?.id || "",
      parentId: null, // Only get top-level posts
      page: 1,
      limit: isEmbedded && !showFullThread ? 3 : 20,
    },
    skip: !discussion?.id,
  });

  // Get all posts including replies by making multiple queries
  const [allPosts, setAllPosts] = useState<DiscussionPost[]>([]);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [collapsedPosts, setCollapsedPosts] = useState<Set<string>>(new Set());

  // Function to toggle collapse state for a post
  const handleToggleCollapse = (postId: string) => {
    setCollapsedPosts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  // Function to fetch replies for a specific post
  const fetchReplies = async (parentId: string): Promise<DiscussionPost[]> => {
    try {
      const result = await client.query({
        query: GET_POSTS,
        variables: {
          discussionId: discussion?.id || "",
          parentId,
        },
      });
      return result.data?.getPosts?.posts || [];
    } catch (error) {
      console.error(`Error fetching replies for post ${parentId}:`, error);
      return [];
    }
  };

  // Function to fetch all posts including replies
  const fetchAllPosts = async () => {
    if (!topLevelPostsData?.getPosts?.posts) return;

    setLoadingReplies(true);
    try {
      const topLevelPosts = topLevelPostsData.getPosts.posts;
      const allPostsWithReplies: DiscussionPost[] = [...topLevelPosts];

      // Fetch replies for each top-level post
      for (const post of topLevelPosts) {
        const replies = await fetchReplies(post.id);
        allPostsWithReplies.push(...replies);
      }

      setAllPosts(allPostsWithReplies);
    } catch (error) {
      console.error("Error fetching all posts:", error);
    } finally {
      setLoadingReplies(false);
    }
  };

  // Fetch all posts when top-level posts change
  useEffect(() => {
    if (topLevelPostsData?.getPosts?.posts) {
      fetchAllPosts();
    }
  }, [topLevelPostsData]);

  // Use allPosts instead of direct query data
  const posts: DiscussionPost[] = allPosts;
  const postsLoading = topLevelLoading || loadingReplies;
  const postsError = topLevelError;

  // Debug posts data - commented out to reduce console noise
  // console.log("DiscussionThread - Posts query data:", topLevelPostsData);
  // console.log("DiscussionThread - Posts array:", posts);
  // console.log("DiscussionThread - Posts count:", posts.length);

  // Log individual posts to see their structure - commented out to reduce console noise
  // posts.forEach((post: any, index: number) => {
  //   console.log(`DiscussionThread - Post ${index}:`, {
  //     id: post.id,
  //     parentId: post.parentId,
  //     content: post.content,
  //     author: post.author?.username || post.author,
  //     discussionId: post.discussionId,
  //   });
  // });

  const [followDiscussion] = useMutation(FOLLOW_DISCUSSION, {
    refetchQueries: [
      {
        query: GET_DISCUSSION_BY_ITEM,
        variables: {
          type: itemType.toUpperCase() as "PRESET" | "FILMSIM",
          refId: itemId,
        },
      },
    ],
  });

  const [unfollowDiscussion] = useMutation(UNFOLLOW_DISCUSSION, {
    refetchQueries: [
      {
        query: GET_DISCUSSION_BY_ITEM,
        variables: {
          type: itemType.toUpperCase() as "PRESET" | "FILMSIM",
          refId: itemId,
        },
      },
    ],
  });

  // Create post mutation
  const [createPost, { loading: creatingPost }] = useMutation(CREATE_POST);

  // Create discussion mutation
  const [createDiscussion, { loading: creatingDiscussion }] = useMutation(
    CREATE_DISCUSSION,
    {
      refetchQueries: [
        {
          query: GET_DISCUSSION_BY_ITEM,
          variables: {
            type: itemType.toUpperCase() as "PRESET" | "FILMSIM",
            refId: itemId,
          },
        },
      ],
    }
  );

  // Delete post mutation
  const [deletePost] = useMutation(DELETE_POST, {
    update: (cache, { data, errors }, { variables }) => {
      if (errors) {
        console.error("Delete post mutation had errors:", errors);
        return;
      }

      if (data?.deletePost) {
        console.log("Post deleted successfully, updating cache");

        // Remove the specific post from cache using cache.modify
        cache.modify({
          fields: {
            getPosts(existingPosts = {}, { readField }) {
              if (existingPosts.posts) {
                const filteredPosts = existingPosts.posts.filter(
                  (post: any) => {
                    const postId = readField("id", post);
                    return postId !== variables?.id;
                  }
                );

                return {
                  ...existingPosts,
                  posts: filteredPosts,
                  totalCount: existingPosts.totalCount - 1,
                };
              }
              return existingPosts;
            },
          },
        });

        // Update the discussion's postCount
        const existingDiscussion = cache.readQuery({
          query: GET_DISCUSSION_BY_ITEM,
          variables: {
            type: itemType.toUpperCase() as "PRESET" | "FILMSIM",
            refId: itemId,
          },
        }) as any;

        if (existingDiscussion?.getDiscussionByLinkedItem) {
          cache.writeQuery({
            query: GET_DISCUSSION_BY_ITEM,
            variables: {
              type: itemType.toUpperCase() as "PRESET" | "FILMSIM",
              refId: itemId,
            },
            data: {
              getDiscussionByLinkedItem: {
                ...existingDiscussion.getDiscussionByLinkedItem,
                postCount:
                  existingDiscussion.getDiscussionByLinkedItem.postCount - 1,
              },
            },
          });
        }
      }
    },
  });

  // Update post mutation
  const [updatePost] = useMutation(UPDATE_POST, {
    update: (cache, { data, errors }) => {
      if (errors) {
        console.error("Update post mutation had errors:", errors);
        return;
      }

      if (data?.updatePost) {
        console.log("Post updated successfully, updating cache");

        // Read the existing posts
        const existingPosts = cache.readQuery({
          query: GET_POSTS,
          variables: {
            discussionId: discussion?.id || "",
            parentId: null,
            page: 1,
            limit: isEmbedded && !showFullThread ? 3 : 20,
          },
        }) as any;

        if (existingPosts?.getPosts) {
          // Update the post in cache
          const updatedPosts = existingPosts.getPosts.posts.map((post: any) =>
            post.id === data.updatePost.id ? data.updatePost : post
          );

          cache.writeQuery({
            query: GET_POSTS,
            variables: {
              discussionId: discussion?.id || "",
              parentId: null,
              page: 1,
              limit: isEmbedded && !showFullThread ? 3 : 20,
            },
            data: {
              getPosts: {
                ...existingPosts.getPosts,
                posts: updatedPosts,
              },
            },
          });
        }
      }
    },
  });

  const isUserFollowing = (discussion: DiscussionType): boolean => {
    if (!user) return false;
    return discussion.followers.some((follower) => follower.id === user.id);
  };

  const handleFollow = async () => {
    if (!discussion) return;

    try {
      if (isUserFollowing(discussion)) {
        await unfollowDiscussion({
          variables: { discussionId: discussion.id },
        });
      } else {
        await followDiscussion({ variables: { discussionId: discussion.id } });
      }
    } catch (error) {
      console.error("Failed to follow/unfollow discussion:", error);
    }
  };

  const handleCreateReply = async (content: string, images?: File[]) => {
    if (!content.trim() || !replyingTo) return;

    try {
      const postInput = {
        discussionId: discussion?.id,
        parentId: replyingTo,
        content: content.trim(),
      };

      console.log("Creating reply with input:", postInput);

      const result = await createPost({
        variables: { input: postInput },
      });

      if (result.data?.createPost) {
        console.log("Reply created successfully:", result.data.createPost);
        setReplyingTo(null);
        // Refetch top-level posts to get the new reply
        await refetchTopLevel();
      }
    } catch (error) {
      console.error("Error creating reply:", error);
    }
  };

  const handleCreatePost = async (content: string, images?: File[]) => {
    if (!content.trim()) return;

    try {
      let currentDiscussionId = discussion?.id;

      // If no discussion exists, create one first
      if (!currentDiscussionId) {
        console.log("No discussion exists, creating one...");
        const discussionInput = {
          title: `Discussion about ${itemTitle}`,
          linkedToType: itemType.toUpperCase() as "PRESET" | "FILMSIM",
          linkedToId: itemId,
        };

        console.log("Creating discussion with input:", discussionInput);

        const discussionResult = await createDiscussion({
          variables: { input: discussionInput },
        });

        if (discussionResult.data?.createDiscussion) {
          currentDiscussionId = discussionResult.data.createDiscussion.id;
          console.log("Discussion created with ID:", currentDiscussionId);
        } else {
          console.error("Failed to create discussion");
          return;
        }
      }

      // Create the post
      const postInput = {
        discussionId: currentDiscussionId,
        content: content.trim(),
      };

      console.log("Creating post with input:", postInput);

      const result = await createPost({
        variables: { input: postInput },
      });

      if (result.data?.createPost) {
        console.log("Post created successfully:", result.data.createPost);

        // Create notifications for the new post
        if (discussion) {
          const linkedItem = discussion.linkedTo.preset
            ? {
                type: "PRESET",
                id: discussion.linkedTo.preset.id,
                title: discussion.linkedTo.preset.title,
                slug: discussion.linkedTo.preset.slug,
              }
            : discussion.linkedTo.filmSim
            ? {
                type: "FILMSIM",
                id: discussion.linkedTo.filmSim.id,
                title: discussion.linkedTo.filmSim.name,
                slug: discussion.linkedTo.filmSim.slug,
              }
            : undefined;

          await createDiscussionReplyNotification(
            createNotification,
            result.data.createPost,
            discussion,
            linkedItem
          );
        }

        // Refetch top-level posts to get the new post
        await refetchTopLevel();
      }
    } catch (error) {
      console.error("Error creating post:", error);
    }
  };

  const handleReply = async (
    postId: string,
    content: string,
    images?: File[]
  ) => {
    if (!content.trim()) return;

    try {
      const replyInput = {
        discussionId: discussion?.id || "",
        parentId: postId,
        content: content.trim(),
      };

      console.log("Creating reply with input:", replyInput);

      const result = await createPost({
        variables: { input: replyInput },
      });

      if (result.data?.createPost) {
        console.log("Reply created successfully:", result.data.createPost);

        // Refetch all posts to include the new reply
        await fetchAllPosts();
      }
    } catch (error) {
      console.error("Error creating reply:", error);
    }
  };

  const handleEdit = async (postId: string, content: string) => {
    // Find the post to get more details
    const postToEdit = posts.find((p) => p.id === postId);

    if (!postToEdit) {
      console.error("Post not found. Please refresh the page and try again.");
      return;
    }

    if (!user) {
      console.error("You must be logged in to edit posts.");
      return;
    }

    if (postToEdit.author.id !== user.id) {
      console.error("You can only edit your own posts.");
      return;
    }

    try {
      const result = await updatePost({
        variables: {
          id: postId,
          input: { content: content.trim() },
        },
      });

      if (result.data?.updatePost) {
        console.log("Post updated successfully");
        // Refetch posts to update the UI
        await refetchTopLevel();
      } else {
        console.error("Failed to update post - no data returned");
      }
    } catch (error: any) {
      console.error("Error updating post:", error);

      // Extract error message from GraphQL errors
      let errorMessage = "Failed to update post. Please try again.";
      if (error.graphQLErrors && error.graphQLErrors.length > 0) {
        errorMessage = error.graphQLErrors[0].message || errorMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }

      console.error("Update post error:", errorMessage);
    }
  };

  const handleDelete = async (postId: string) => {
    console.log("Attempting to delete post:", postId);

    // Find the post to get more details
    const postToDelete = posts.find((p) => p.id === postId);

    if (!postToDelete) {
      setDeleteError("Post not found. Please refresh the page and try again.");
      return;
    }

    if (!user) {
      setDeleteError("You must be logged in to delete posts.");
      return;
    }

    if (postToDelete.author.id !== user.id) {
      setDeleteError("You can only delete your own posts.");
      return;
    }

    setDeleteError(null); // Clear any previous errors
    setDeletingPostId(postId);

    try {
      const result = await deletePost({
        variables: { id: postId },
      });

      if (result.data?.deletePost) {
        console.log("Post deleted successfully");
        // Refetch posts to update the UI
        await refetchTopLevel();
      } else if (result.errors && result.errors.length > 0) {
        console.error("Backend returned errors:", result.errors);

        // Log the complete error structure for debugging
        result.errors.forEach((err: any, index: number) => {
          console.log(`Error ${index + 1} complete structure:`, {
            message: err.message,
            path: err.path,
            extensions: err.extensions,
            locations: err.locations,
            originalError: err.originalError,
            fullError: err,
          });
        });

        // Extract error message from the first error
        const firstError = result.errors[0];
        let errorMessage = "Failed to delete post. Please try again.";

        if (firstError.message) {
          errorMessage = firstError.message;
        }

        // Check for specific error types
        if (firstError.extensions?.code) {
          switch (firstError.extensions.code) {
            case "UNAUTHENTICATED":
              errorMessage = "You must be logged in to delete posts.";
              break;
            case "FORBIDDEN":
              errorMessage = "You can only delete your own posts.";
              break;
            case "NOT_FOUND":
              errorMessage =
                "Post not found. It may have already been deleted.";
              break;
            case "INTERNAL_SERVER_ERROR":
              console.error(
                "Backend server error - check server logs for details"
              );
              errorMessage =
                "Server error occurred while deleting the post. Please try again later or contact support if the issue persists.";
              break;
            default:
              errorMessage = firstError.message || errorMessage;
          }
        }

        setDeleteError(errorMessage);
      } else {
        console.error("Failed to delete post - no data returned");
        setDeleteError("Failed to delete post. Please try again.");
      }
    } catch (error: any) {
      console.error("Delete post error:", error);

      // Extract error message from GraphQL errors
      let errorMessage = "Failed to delete post. Please try again.";
      if (error.graphQLErrors && error.graphQLErrors.length > 0) {
        errorMessage = error.graphQLErrors[0].message || errorMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }

      setDeleteError(errorMessage);
    } finally {
      setDeletingPostId(null);
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

  // Organize posts into a threaded structure
  const organizePostsIntoThreads = (
    posts: DiscussionPost[]
  ): DiscussionPost[] => {
    const postMap = new Map<string, DiscussionPost>();
    const rootPosts: DiscussionPost[] = [];

    // First, create a map of all posts
    posts.forEach((post) => {
      postMap.set(post.id, { ...post, replies: [] });
    });

    // Then, organize into threads
    posts.forEach((post) => {
      if (post.parentId) {
        // This is a reply
        const parentPost = postMap.get(post.parentId);
        if (parentPost) {
          parentPost.replies = parentPost.replies || [];
          parentPost.replies.push(postMap.get(post.id)!);
        }
      } else {
        // This is a root post
        rootPosts.push(postMap.get(post.id)!);
      }
    });

    return rootPosts;
  };

  // Render a post and its replies recursively
  const renderPostWithReplies = (post: DiscussionPost, depth: number = 0) => {
    return (
      <Box key={post.id}>
        <Post
          post={post}
          depth={depth}
          onReply={handleReply}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onPin={() => {}} // Not implemented in new schema
          onHighlight={() => {}} // Not implemented in new schema
          onReport={() => {}} // Not implemented in new schema
          onBlock={() => {}} // Not implemented in new schema
          maxDepth={3}
        />
        {/* Render replies */}
        {post.replies && post.replies.length > 0 && depth < 3 && (
          <Box>
            {post.replies.map((reply: DiscussionPost) =>
              renderPostWithReplies(reply, depth + 1)
            )}
          </Box>
        )}
      </Box>
    );
  };

  // Render a collapsed post for preview mode
  const renderCollapsedPost = (post: DiscussionPost) => {
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
            {post.replies.map((reply: DiscussionPost) => (
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
      {/* Discussion Header - matching DiscussionDetail layout */}
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
                {/* Follow button */}
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

                {/* View full thread button */}
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

                  {/* Follow button */}
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

                  {/* View full thread button */}
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
          {/* Error Alert */}
          {deleteError && (
            <Alert
              severity="error"
              sx={{ mb: 2 }}
              onClose={() => setDeleteError(null)}
            >
              {deleteError}
            </Alert>
          )}

          {/* Post composer - moved above posts */}
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
              threadedPosts.map((post: DiscussionPost) =>
                renderPostWithReplies(post)
              )
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
        // Preview mode - show full functionality but simplified post display
        <>
          {/* Error Alert */}
          {deleteError && (
            <Alert
              severity="error"
              sx={{ mb: 2 }}
              onClose={() => setDeleteError(null)}
            >
              {deleteError}
            </Alert>
          )}

          {/* Post composer - moved above posts */}
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

          {/* Posts - using the same Post component as DiscussionDetail */}
          <Box>
            {threadedPosts.length === 0 ? (
              <Alert severity="info">
                No posts yet. Be the first to join the discussion!
              </Alert>
            ) : (
              threadedPosts.map((post: DiscussionPost) =>
                renderCollapsedPost(post)
              )
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

export default DiscussionThread;
