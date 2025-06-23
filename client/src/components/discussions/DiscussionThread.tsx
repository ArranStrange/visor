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
} from "../../graphql/mutations/discussions";
import Post from "./Post";
import PostComposer from "./PostComposer";
import { CREATE_DISCUSSION } from "../../graphql/mutations/discussions";
import { useApolloClient } from "@apollo/client";

interface DiscussionThreadProps {
  itemId: string;
  itemType: "preset" | "filmsim";
  itemTitle: string;
  itemSlug: string;
  itemThumbnail?: string;
  isEmbedded?: boolean;
}

const DiscussionThread: React.FC<DiscussionThreadProps> = ({
  itemId,
  itemType,
  itemTitle,
  itemSlug,
  itemThumbnail,
  isEmbedded = true,
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showFullThread, setShowFullThread] = useState(false);
  const [showComposer, setShowComposer] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [replyImageUrl, setReplyImageUrl] = useState<string | undefined>();

  const client = useApolloClient();

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

  // Debug posts data
  console.log("DiscussionThread - Posts query data:", topLevelPostsData);
  console.log("DiscussionThread - Posts array:", posts);
  console.log("DiscussionThread - Posts count:", posts.length);

  // Log individual posts to see their structure
  posts.forEach((post: any, index: number) => {
    console.log(`DiscussionThread - Post ${index}:`, {
      id: post.id,
      parentId: post.parentId,
      content: post.content,
      author: post.author?.username || post.author,
      discussionId: post.discussionId,
    });
  });

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
  const [createPost, { loading: creatingPost }] = useMutation(CREATE_POST, {
    update: (cache, { data, errors }) => {
      if (errors) {
        console.error("Mutation had errors:", errors);
        return;
      }

      if (data?.createPost && discussion?.id) {
        console.log(
          "DiscussionThread - Manually updating cache with new post:",
          data.createPost
        );

        // Read the existing posts
        const existingPosts = cache.readQuery({
          query: GET_POSTS,
          variables: {
            discussionId: discussion.id,
            page: 1,
            limit: isEmbedded && !showFullThread ? 3 : 20,
          },
        }) as any;

        if (existingPosts?.getPosts) {
          // Add the new post to the cache
          cache.writeQuery({
            query: GET_POSTS,
            variables: {
              discussionId: discussion.id,
              page: 1,
              limit: isEmbedded && !showFullThread ? 3 : 20,
            },
            data: {
              getPosts: {
                ...existingPosts.getPosts,
                posts: [...existingPosts.getPosts.posts, data.createPost],
                totalCount: existingPosts.getPosts.totalCount + 1,
              },
            },
          });
        }

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
                  existingDiscussion.getDiscussionByLinkedItem.postCount + 1,
              },
            },
          });
        }
      } else {
        console.log("No createPost data returned from mutation");
      }
    },
  });

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

  const handleCreatePost = async (content: string, images?: File[]) => {
    if (!content.trim()) return;

    try {
      // For now, we'll handle image upload separately
      let imageUrl: string | undefined;

      if (images && images.length > 0) {
        // TODO: Implement image upload to your storage service
        console.log("Image upload not implemented yet");
      }

      let currentDiscussionId = discussion?.id;

      // If no discussion exists, create one first
      if (!currentDiscussionId) {
        console.log("No discussion exists, creating one...");
        const discussionInput = {
          title: `Discussion about ${itemTitle}`,
          linkedToType: itemType.toUpperCase() as "PRESET" | "FILMSIM",
          linkedToId: itemId,
          tags: [itemType],
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
        imageUrl,
      };

      console.log("Creating post with input:", postInput);

      const result = await createPost({
        variables: { input: postInput },
      });

      if (result.data?.createPost) {
        console.log("Post created successfully:", result.data.createPost);

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
      // For now, we'll handle image upload separately
      let imageUrl: string | undefined;

      if (images && images.length > 0) {
        // TODO: Implement image upload to your storage service
        console.log("Image upload not implemented yet");
      }

      const replyInput = {
        discussionId: discussion?.id || "",
        parentId: postId,
        content: content.trim(),
        imageUrl,
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
    // TODO: Implement edit functionality
    console.log("Edit post:", postId, content);
  };

  const handleDelete = async (postId: string) => {
    // TODO: Implement delete functionality
    console.log("Delete post:", postId);
  };

  const handleReact = async (postId: string, reactionType: string) => {
    // TODO: Implement reaction functionality
    console.log("React to post:", postId, reactionType);
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
    const hasReplies = post.replies && post.replies.length > 0;
    const isCollapsed = collapsedPosts.has(post.id);

    return (
      <Box key={post.id}>
        <Post
          post={post}
          depth={depth}
          onReply={handleReply}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onReact={handleReact}
          onPin={() => {}}
          onHighlight={() => {}}
          onReport={() => {}}
          onBlock={() => {}}
          maxDepth={3}
          hasReplies={hasReplies}
          isCollapsed={isCollapsed}
          onToggleCollapse={handleToggleCollapse}
        />
        {/* Render replies only if not collapsed */}
        {hasReplies && !isCollapsed && depth < 3 && (
          <Box>
            {post.replies.map((reply) =>
              renderPostWithReplies(reply, depth + 1)
            )}
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
          <Alert severity="warning" sx={{ mb: 2 }}>
            Unable to load posts at this time. The discussion system is being
            updated.
          </Alert>
          {discussion && user && (
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
          <Typography variant="body2" color="text.secondary" mb={2}>
            No discussion thread found for this {itemType}.
          </Typography>
          {user && (
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
    isEmbedded && !showFullThread ? posts.slice(0, 3) : posts;
  const hasMorePosts = isEmbedded && posts.length > 3;

  // Organize posts into threaded structure
  const threadedPosts = organizePostsIntoThreads(displayPosts);

  return (
    <Box>
      {/* Discussion Header */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            mb={2}
          >
            <Box display="flex" alignItems="center" gap={2}>
              <Typography variant="h6">💬 Discussions</Typography>
            </Box>

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

          {/* Discussion info */}
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <Avatar
              src={discussion.createdBy.avatar}
              sx={{ width: 32, height: 32 }}
            >
              {discussion.createdBy.username.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Box display="flex" alignItems="center" gap={1}>
                <Typography variant="subtitle2">
                  {discussion.createdBy.username}
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary">
                {formatDate(discussion.createdAt)}
              </Typography>
            </Box>
          </Box>

          {/* Discussion title */}
          <Typography variant="h6" gutterBottom>
            {discussion.title}
          </Typography>

          {/* Linked item info */}
          {discussion.linkedTo && (
            <Box display="flex" alignItems="center" gap={1} mb={2}>
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
            <Box display="flex" gap={0.5} mb={2} flexWrap="wrap">
              {discussion.tags.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: "0.7rem" }}
                />
              ))}
            </Box>
          )}

          {/* Stats */}
          <Box display="flex" alignItems="center" gap={2}>
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
        </CardContent>
      </Card>

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
            <Button variant="outlined" onClick={() => setShowFullThread(true)}>
              Show {posts.length - 3} more posts
            </Button>
          </Box>
        )}
      </Box>

      {/* Post composer */}
      {user && (
        <Box mt={2}>
          <PostComposer
            onSubmit={handleCreatePost}
            placeholder="Add to the discussion..."
            buttonText={creatingPost ? "Posting..." : "Post"}
          />
        </Box>
      )}
    </Box>
  );
};

export default DiscussionThread;
