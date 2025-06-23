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
import { GET_DISCUSSION, GET_POSTS } from "../graphql/queries/discussions";
import { CREATE_POST } from "../graphql/mutations/discussions";
import {
  Discussion as DiscussionType,
  DiscussionPost,
} from "../types/discussions";
import Post from "../components/discussions/Post";
import PostComposer from "../components/discussions/PostComposer";

const DiscussionDetail: React.FC = () => {
  const { discussionId } = useParams<{ discussionId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const {
    loading: discussionLoading,
    error: discussionError,
    data: discussionData,
    refetch: refetchDiscussion,
  } = useQuery(GET_DISCUSSION, {
    variables: { id: discussionId! },
    skip: !discussionId,
  });

  const discussion = discussionData?.getDiscussion;

  // Get posts for this discussion
  const {
    loading: postsLoading,
    error: postsError,
    data: postsData,
    refetch: refetchPosts,
  } = useQuery(GET_POSTS, {
    variables: {
      discussionId: discussionId!,
      page: 1,
      limit: 20,
    },
    skip: !discussionId,
  });

  const posts = postsData?.getPosts?.posts || [];

  // Debug posts data
  console.log("Posts query data:", postsData);
  console.log("Posts array:", posts);
  console.log("Posts count:", posts.length);

  // Log individual posts to see their structure
  posts.forEach((post: any, index: number) => {
    console.log(`Post ${index}:`, {
      id: post.id,
      parentId: post.parentId,
      content: post.content,
      author: post.author.username,
      discussionId: post.discussionId,
    });
  });

  const [createPost] = useMutation(CREATE_POST, {
    update: (cache, { data, errors }) => {
      if (errors) {
        console.error("Mutation had errors:", errors);
        return;
      }

      if (data?.createPost) {
        console.log("Manually updating cache with new post:", data.createPost);

        // Read the existing posts
        const existingPosts = cache.readQuery({
          query: GET_POSTS,
          variables: {
            discussionId: discussionId!,
            page: 1,
            limit: 20,
          },
        }) as any;

        if (existingPosts?.getPosts) {
          // Add the new post to the cache
          cache.writeQuery({
            query: GET_POSTS,
            variables: {
              discussionId: discussionId!,
              page: 1,
              limit: 20,
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
          query: GET_DISCUSSION,
          variables: { id: discussionId! },
        }) as any;

        if (existingDiscussion?.getDiscussion) {
          cache.writeQuery({
            query: GET_DISCUSSION,
            variables: { id: discussionId! },
            data: {
              getDiscussion: {
                ...existingDiscussion.getDiscussion,
                postCount: existingDiscussion.getDiscussion.postCount + 1,
              },
            },
          });
        }
      } else {
        console.log("No createPost data returned from mutation");
      }
    },
  });

  const handleCreatePost = async (content: string, images?: File[]) => {
    if (!discussionId || !content.trim()) {
      console.log("Missing discussionId or content:", {
        discussionId,
        content,
      });
      return;
    }

    if (!discussion) {
      console.log("No discussion found for ID:", discussionId);
      return;
    }

    try {
      // For now, we'll handle image upload separately
      // In a real implementation, you'd upload images first and get URLs
      let imageUrl: string | undefined;

      if (images && images.length > 0) {
        // TODO: Implement image upload to your storage service
        // For now, we'll skip image upload
        console.log("Image upload not implemented yet");
      }

      const input = {
        discussionId,
        content: content.trim(),
        imageUrl,
      };

      console.log("Creating post with input:", input);

      const result = await createPost({
        variables: {
          input,
        },
      });

      console.log("Post created successfully:", result);
    } catch (error: any) {
      console.error("Failed to create post:", error);
      console.error("Error details:", {
        message: error.message,
        graphQLErrors: error.graphQLErrors,
        networkError: error.networkError,
      });
      // You might want to show an error message to the user here
    }
  };

  const handleReply = async (
    postId: string,
    content: string,
    images?: File[]
  ) => {
    if (!discussionId || !content.trim()) return;

    try {
      // For now, we'll handle image upload separately
      let imageUrl: string | undefined;

      if (images && images.length > 0) {
        // TODO: Implement image upload to your storage service
        console.log("Image upload not implemented yet");
      }

      console.log("Creating reply with input:", {
        discussionId,
        parentId: postId,
        content: content.trim(),
        imageUrl,
      });

      const result = await createPost({
        variables: {
          input: {
            discussionId,
            parentId: postId, // This makes it a reply
            content: content.trim(),
            imageUrl,
          },
        },
      });

      console.log("Reply created successfully");
      console.log("Reply result:", result);
      console.log("Reply data:", result.data);
      console.log("Reply errors:", result.errors);
    } catch (error: any) {
      console.error("Failed to create reply:", error);
      console.error("Error details:", {
        message: error.message,
        graphQLErrors: error.graphQLErrors,
        networkError: error.networkError,
        stack: error.stack,
      });
    }
  };

  const handleEdit = async (postId: string, content: string) => {
    // This would be implemented with the UPDATE_POST mutation
    console.log("Editing post:", { postId, content });
    refetchDiscussion();
    refetchPosts();
  };

  const handleDelete = async (postId: string) => {
    // This would be implemented with the DELETE_POST mutation
    console.log("Deleting post:", { postId });
    refetchDiscussion();
    refetchPosts();
  };

  const handleReact = async (postId: string, reactionType: string) => {
    // This would be implemented with the ADD_REACTION mutation
    console.log("Reacting to post:", { postId, reactionType });
    refetchDiscussion();
    refetchPosts();
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
          onReact={handleReact}
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

  if (discussionLoading || postsLoading) {
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

  if (postsError) {
    return (
      <Container maxWidth="lg">
        <Box py={4}>
          <Alert severity="warning" sx={{ mb: 3 }}>
            Unable to load posts at this time. The discussion system is being
            updated.
          </Alert>
          {discussion && (
            <>
              {/* Breadcrumbs */}
              <Breadcrumbs
                separator={<NavigateNextIcon fontSize="small" />}
                sx={{ mb: 3 }}
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
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Box display="flex" alignItems="flex-start" gap={2}>
                    <Avatar
                      src={discussion.createdBy.avatar}
                      sx={{ width: 50, height: 50, mt: 0.5 }}
                    >
                      {discussion.createdBy.username.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box flex={1}>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <Typography
                          variant="h4"
                          component="h1"
                          sx={{ flex: 1 }}
                        >
                          {discussion.title}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              {/* Post Composer */}
              {user && (
                <Card sx={{ mb: 3 }}>
                  <CardContent>
                    <PostComposer
                      onSubmit={handleCreatePost}
                      placeholder="Add to the discussion..."
                      buttonText="Post"
                    />
                  </CardContent>
                </Card>
              )}
            </>
          )}
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
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box py={4}>
        {/* Breadcrumbs */}
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" />}
          sx={{ mb: 3 }}
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
        <Card sx={{ mb: 3 }}>
          <CardContent>
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

                {/* Tags */}
                {discussion.tags.length > 0 && (
                  <Box display="flex" gap={0.5} mb={2} flexWrap="wrap">
                    {discussion.tags.map((tag: string) => (
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
          </CardContent>
        </Card>

        {/* Posts */}
        <Box>
          {posts.length === 0 ? (
            <Alert severity="info">
              No posts yet. Be the first to join the discussion!
            </Alert>
          ) : (
            organizePostsIntoThreads(posts).map((post: DiscussionPost) =>
              renderPostWithReplies(post)
            )
          )}
        </Box>

        {/* New post composer */}
        <PostComposer
          onSubmit={handleCreatePost}
          placeholder="Add to the discussion..."
          buttonText="Post"
        />
      </Box>
    </Container>
  );
};

export default DiscussionDetail;
