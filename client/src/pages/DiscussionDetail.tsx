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
  // console.log("Posts query data:", postsData);
  // console.log("Posts array:", posts);
  // console.log("Posts count:", posts.length);

  // Log individual posts to see their structure
  // posts.forEach((post: any, index: number) => {
  //   console.log(`Post ${index}:`, {
  //     id: post.id,
  //     parentId: post.parentId,
  //     content: post.content,
  //     author: post.author.username,
  //     discussionId: post.discussionId,
  //   });
  // });

  const [createPost] = useMutation(CREATE_POST, {
    update: (cache, { data, errors }) => {
      if (errors) {
        console.error("Mutation had errors:", errors);
        return;
      }

      if (data?.createPost) {
        // console.log("Manually updating cache with new post:", data.createPost);

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

  const [deletePost] = useMutation(DELETE_POST, {
    update: (cache, { data, errors }, { variables }) => {
      if (errors) {
        console.error("Delete post mutation had errors:", errors);
        return;
      }

      if (data?.deletePost) {
        // console.log("Post deleted successfully, updating cache");

        // Option 1: Remove the post completely from cache (hard deletion)
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

        // Option 2: Mark the post as deleted (soft deletion)
        // This approach keeps the post in the cache but marks it as deleted
        try {
          const postRef = cache.identify({
            __typename: "DiscussionPost",
            id: variables?.id,
          });
          if (postRef) {
            cache.modify({
              id: postRef,
              fields: {
                isDeleted: () => true,
                deletedAt: () => new Date().toISOString(),
                deletedBy: () => ({
                  __typename: "User",
                  id: user?.id,
                  username: user?.username,
                }),
              },
            });
          }
        } catch (error) {
          console.log("Could not update post in cache, will refetch instead");
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
        console.log("Post updated successfully, updating cache");

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
        console.log("Reaction added successfully, updating cache");

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
        console.log("Reaction removed successfully, updating cache");

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

      // console.log("Creating post with input:", input);

      const result = await createPost({
        variables: {
          input,
        },
      });

      // console.log("Post created successfully:", result);
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
        // console.log("Image upload not implemented yet");
      }

      // console.log("Creating reply with input:", {
      //   discussionId,
      //   parentId: postId,
      //   content: content.trim(),
      //   imageUrl,
      // });

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

      // console.log("Reply created successfully");
      // console.log("Reply result:", result);
      // console.log("Reply data:", result.data);
      // console.log("Reply errors:", result.errors);
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
    // Find the post to get more details
    const postToEdit = posts.find((p: DiscussionPost) => p.id === postId);

    if (!postToEdit) {
      console.error("Post not found. Please refresh the page and try again.");
      return;
    }

    // Debug: Log the current user and post author
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
        // console.log("Post updated successfully");
        // Refetch posts to update the UI
        await refetchPosts();
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
      // You could show a toast notification here with the error message
    }
  };

  const handleDelete = async (postId: string) => {
    // console.log("Attempting to delete post:", postId);

    // Find the post to get more details
    const postToDelete = posts.find((p: DiscussionPost) => p.id === postId);

    if (!postToDelete) {
      console.error("Post not found. Please refresh the page and try again.");
      return;
    }

    // Debug: Log the current user and post author
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

      // console.log("Delete post result:", result);

      if (result.data?.deletePost) {
        // console.log("Post deleted successfully");
        // Refetch posts to update the UI
        await refetchPosts();
      } else if (result.errors && result.errors.length > 0) {
        console.error("Backend returned errors:", result.errors);

        // Log the complete error structure for debugging
        // result.errors.forEach((err: any, index: number) => {
        //   console.log(`Error ${index + 1} complete structure:`, {
        //     message: err.message,
        //     path: err.path,
        //     extensions: err.extensions,
        //     locations: err.locations,
        //     originalError: err.originalError,
        //     fullError: err,
        //   });
        // });

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

        console.error("Delete post error:", errorMessage);
        // You could show a toast notification here with the error message
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

      // Extract error message from GraphQL errors
      let errorMessage = "Failed to delete post. Please try again.";
      if (error.graphQLErrors && error.graphQLErrors.length > 0) {
        errorMessage = error.graphQLErrors[0].message || errorMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }

      console.error("Delete post error:", errorMessage);
      // You could show a toast notification here with the error message
    }
  };

  const handleReact = async (postId: string, reactionType: string) => {
    try {
      // Check if user already has this reaction
      const post = posts.find((p: DiscussionPost) => p.id === postId);
      const hasReaction = post?.reactions.some(
        (r: any) =>
          r.emoji === reactionType &&
          r.users.some((u: any) => u.id === user?.id)
      );

      if (hasReaction) {
        // Remove reaction
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
        // Add reaction
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

      // Extract error message from GraphQL errors
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

  // Check if the auth token is valid
  const isTokenValid = (): boolean => {
    const token = localStorage.getItem("visor_token");
    if (!token) return false;

    try {
      // Basic JWT token validation - check if it's not expired
      const payload = JSON.parse(atob(token.split(".")[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp > currentTime;
    } catch (error) {
      console.error("Error parsing token:", error);
      return false;
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
      </Box>
    </Container>
  );
};

export default DiscussionDetail;
