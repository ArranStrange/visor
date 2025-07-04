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
  AlertTitle,
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
import {
  CREATE_POST,
  DELETE_POST,
  UPDATE_POST,
  ADD_REACTION,
  REMOVE_REACTION,
} from "../graphql/mutations/discussions";
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
    skip: !discussionId || discussionId === "new",
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
    skip: !discussionId || discussionId === "new",
  });

  // Enhanced data validation and filtering
  const rawPosts = postsData?.getPosts?.posts || [];
  const validPosts = rawPosts.filter((post: any) => {
    // Validate required fields
    const hasValidId = post?.id && typeof post.id === "string";
    const hasValidDate = post?.createdAt && typeof post.createdAt === "string";
    const hasValidContent = post?.content && typeof post.content === "string";
    const hasValidAuthor = post?.author && typeof post.author === "object";

    // Log invalid posts for debugging
    if (!hasValidId || !hasValidDate || !hasValidContent || !hasValidAuthor) {
      console.warn("⚠️ Invalid post filtered out:", {
        id: post?.id,
        idType: typeof post?.id,
        createdAt: post?.createdAt,
        createdAtType: typeof post?.createdAt,
        content: post?.content,
        author: post?.author,
        post: post,
      });
    }

    return hasValidId && hasValidDate && hasValidContent && hasValidAuthor;
  });

  // Enhanced error detection
  const hasSerializationErrors = postsError?.graphQLErrors?.some(
    (err: any) =>
      err.message.includes("Cannot return null") ||
      err.message.includes("String cannot represent value") ||
      err.message.includes("Expected non-nullable")
  );

  const [createPost] = useMutation(CREATE_POST, {
    update: (cache, { data, errors }) => {
      if (errors) {
        console.error("Mutation had errors:", errors);
        return;
      }

      if (data?.createPost) {
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
      }
    },
  });

  const [deletePost] = useMutation(DELETE_POST, {
    update: (cache, { data, errors }, { variables }) => {
      if (errors) {
        console.error("Delete post mutation had errors:", errors);
        return;
      }

      if (data?.deletePost) {
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
                postCount: existingDiscussion.getDiscussion.postCount - 1,
              },
            },
          });
        }
      }
    },
  });

  const [updatePost] = useMutation(UPDATE_POST, {
    update: (cache, { data, errors }) => {
      if (errors) {
        console.error("Update post mutation had errors:", errors);
        return;
      }

      if (data?.updatePost) {
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
          // Update the post in cache
          const updatedPosts = existingPosts.getPosts.posts.map((post: any) =>
            post.id === data.updatePost.id ? data.updatePost : post
          );

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
                posts: updatedPosts,
              },
            },
          });
        }
      }
    },
  });

  const [addReaction] = useMutation(ADD_REACTION, {
    update: (cache, { data, errors }) => {
      if (errors) {
        console.error("Add reaction mutation had errors:", errors);
        return;
      }

      if (data?.addReaction) {
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
          // Update the post in cache
          const updatedPosts = existingPosts.getPosts.posts.map((post: any) =>
            post.id === data.addReaction.id ? data.addReaction : post
          );

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
                posts: updatedPosts,
              },
            },
          });
        }
      }
    },
  });

  const [removeReaction] = useMutation(REMOVE_REACTION, {
    update: (cache, { data, errors }) => {
      if (errors) {
        console.error("Remove reaction mutation had errors:", errors);
        return;
      }

      if (data?.removeReaction) {
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
          // Update the post in cache
          const updatedPosts = existingPosts.getPosts.posts.map((post: any) =>
            post.id === data.removeReaction.id ? data.removeReaction : post
          );

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
                posts: updatedPosts,
              },
            },
          });
        }
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
      let imageUrl: string | undefined;

      if (images && images.length > 0) {
        console.log("Image upload not implemented yet");
      }

      const input = {
        discussionId,
        content: content.trim(),
        imageUrl,
      };

      const result = await createPost({
        variables: {
          input,
        },
      });
    } catch (error: any) {
      console.error("Failed to create post:", error);
      console.error("Error details:", {
        message: error.message,
        graphQLErrors: error.graphQLErrors,
        networkError: error.networkError,
      });
    }
  };

  const handleReply = async (
    postId: string,
    content: string,
    images?: File[]
  ) => {
    if (!discussionId || !content.trim()) return;

    try {
      let imageUrl: string | undefined;

      if (images && images.length > 0) {
        console.log("Image upload not implemented yet");
      }

      const result = await createPost({
        variables: {
          input: {
            discussionId,
            parentId: postId,
            content: content.trim(),
            imageUrl,
          },
        },
      });
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
    const postToEdit = validPosts.find((p: DiscussionPost) => p.id === postId);

    if (!postToEdit) {
      console.error("Post not found. Please refresh the page and try again.");
      return;
    }

    console.log("[DEBUG] Edit attempt:", {
      currentUser: user,
      postAuthor: postToEdit.author,
      postId: postId,
      tokenExists: !!localStorage.getItem("visor_token"),
      userComparison: {
        currentUserId: user?.id,
        postAuthorId: postToEdit.author?.id,
        idsMatch: user?.id === postToEdit.author?.id,
        currentUserType: typeof user?.id,
        postAuthorType: typeof postToEdit.author?.id,
      },
    });

    try {
      const result = await updatePost({
        variables: {
          id: postId,
          input: { content: content.trim() },
        },
      });

      if (result.data?.updatePost) {
        await refetchPosts();
      } else {
        console.error("Failed to update post - no data returned");
      }
    } catch (error: any) {
      console.error("Error updating post:", error);

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
    const postToDelete = validPosts.find(
      (p: DiscussionPost) => p.id === postId
    );

    if (!postToDelete) {
      console.error("Post not found. Please refresh the page and try again.");
      return;
    }

    console.log("[DEBUG] Delete attempt:", {
      currentUser: user,
      postAuthor: postToDelete.author,
      postId: postId,
      tokenExists: !!localStorage.getItem("visor_token"),
      userComparison: {
        currentUserId: user?.id,
        postAuthorId: postToDelete.author?.id,
        idsMatch: user?.id === postToDelete.author?.id,
        currentUserType: typeof user?.id,
        postAuthorType: typeof postToDelete.author?.id,
      },
    });

    try {
      const result = await deletePost({
        variables: { id: postId },
      });

      if (result.data?.deletePost) {
        await refetchPosts();
      } else if (result.errors && result.errors.length > 0) {
        console.error("Backend returned errors:", result.errors);

        const firstError = result.errors[0];
        let errorMessage = "Failed to delete post. Please try again.";

        if (firstError.message) {
          errorMessage = firstError.message;
        }

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

        console.error("Delete post error:", errorMessage);
      } else {
        console.error("Failed to delete post - no data returned");
      }
    } catch (error: any) {
      console.error("Error deleting post:", error);
      console.error("Error details:", {
        message: error.message,
        graphQLErrors: error.graphQLErrors,
        networkError: error.networkError,
      });

      let errorMessage = "Failed to delete post. Please try again.";
      if (error.graphQLErrors && error.graphQLErrors.length > 0) {
        errorMessage = error.graphQLErrors[0].message || errorMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }

      console.error("Delete post error:", errorMessage);
    }
  };

  const handleReact = async (postId: string, reactionType: string) => {
    try {
      const post = validPosts.find((p: DiscussionPost) => p.id === postId);
      const hasReaction = post?.reactions.some(
        (r: any) =>
          r.emoji === reactionType &&
          r.users.some((u: any) => u.id === user?.id)
      );

      if (hasReaction) {
        const result = await removeReaction({
          variables: {
            input: { postId, emoji: reactionType },
          },
        });

        if (result.data?.removeReaction) {
          console.log("Reaction removed successfully");
          await refetchPosts();
        } else {
          console.error("Failed to remove reaction - no data returned");
        }
      } else {
        const result = await addReaction({
          variables: {
            input: { postId, emoji: reactionType },
          },
        });

        if (result.data?.addReaction) {
          console.log("Reaction added successfully");
          await refetchPosts();
        } else {
          console.error("Failed to add reaction - no data returned");
        }
      }
    } catch (error: any) {
      console.error("Error handling reaction:", error);

      let errorMessage = "Failed to update reaction. Please try again.";
      if (error.graphQLErrors && error.graphQLErrors.length > 0) {
        errorMessage = error.graphQLErrors[0].message || errorMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }

      console.error("Reaction error:", errorMessage);
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
            <AlertTitle>Error Loading Discussion</AlertTitle>
            Unable to load the discussion. Please try refreshing the page.
            {discussionError.message && (
              <Box mt={1}>
                <Typography variant="body2" color="text.secondary">
                  Error: {discussionError.message}
                </Typography>
              </Box>
            )}
          </Alert>
        </Box>
      </Container>
    );
  }

  // Enhanced error handling for posts with serialization issues
  if (postsError || hasSerializationErrors) {
    return (
      <Container maxWidth="lg">
        <Box py={4}>
          <Alert severity="warning" sx={{ mb: 3 }}>
            <AlertTitle>Data Loading Issue</AlertTitle>
            Some posts couldn't be loaded due to backend data inconsistencies.
            You can still view the discussion and create new posts.
            {postsError?.message && (
              <Box mt={1}>
                <Typography variant="body2" color="text.secondary">
                  Technical details: {postsError.message}
                </Typography>
              </Box>
            )}
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

              {/* Post composer - show even when posts fail to load */}
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
          <Alert severity="error">
            <AlertTitle>Discussion Not Found</AlertTitle>
            The discussion you're looking for doesn't exist or has been removed.
          </Alert>
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

        {/* Post composer - moved above posts */}
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

        {/* Posts */}
        <Box>
          {validPosts.length === 0 ? (
            <Alert severity="info">
              No posts yet. Be the first to join the discussion!
            </Alert>
          ) : (
            organizePostsIntoThreads(validPosts).map((post: DiscussionPost) =>
              renderPostWithReplies(post)
            )
          )}
        </Box>
      </Box>
    </Container>
  );
};

export default DiscussionDetail;
