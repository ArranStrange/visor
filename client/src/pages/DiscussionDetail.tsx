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
import { GET_DISCUSSION } from "../graphql/queries/discussions";
import {
  CREATE_POST,
  DELETE_POST,
  UPDATE_POST,
} from "../graphql/mutations/discussions";
import { DiscussionPost } from "../types/discussions";
import Post from "../components/discussions/Post";
import PostComposer from "../components/discussions/PostComposer";
import {
  useCreateNotification,
  createDiscussionReplyNotification,
} from "../utils/notificationUtils";

const DiscussionDetail: React.FC = () => {
  const { discussionId } = useParams<{ discussionId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Debug logging - commented out to reduce console noise
  // console.log("DiscussionDetail - discussionId:", discussionId);
  // console.log("DiscussionDetail - discussionId type:", typeof discussionId);
  // console.log("DiscussionDetail - discussionId is valid:", discussionId && discussionId !== "new");

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

  const createNotification = useCreateNotification();
  const [createPost] = useMutation(CREATE_POST, {
    update: (cache, { data, errors }) => {
      if (errors) {
        console.error("Mutation had errors:", errors);
        return;
      }

      if (data?.createPost) {
        const existingDiscussion = cache.readQuery({
          query: GET_DISCUSSION,
          variables: { id: discussionId! },
        }) as any;

        if (existingDiscussion?.getDiscussion) {
          const newPost = {
            userId: data.createPost.userId,
            username: data.createPost.username,
            avatar: data.createPost.avatar,
            content: data.createPost.content,
            timestamp: data.createPost.timestamp,
            isEdited: data.createPost.isEdited,
            editedAt: data.createPost.editedAt,
          };

          cache.writeQuery({
            query: GET_DISCUSSION,
            variables: { id: discussionId! },
            data: {
              getDiscussion: {
                ...existingDiscussion.getDiscussion,
                posts: [
                  ...(existingDiscussion.getDiscussion.posts || []),
                  newPost,
                ],
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
        // Use cache.modify to safely update the posts array
        const postIndexToRemove = variables?.postIndex;

        if (postIndexToRemove !== undefined && postIndexToRemove >= 0) {
          cache.modify({
            id: cache.identify({
              __typename: "Discussion",
              id: variables?.discussionId,
            }),
            fields: {
              posts(existingPosts = []) {
                // Create a new array without the deleted post
                return existingPosts.filter(
                  (_: any, index: number) => index !== postIndexToRemove
                );
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

        const existingDiscussion = cache.readQuery({
          query: GET_DISCUSSION,
          variables: { id: discussionId! },
        }) as any;

        if (existingDiscussion?.getDiscussion) {
          const updatedPosts = (
            existingDiscussion.getDiscussion.posts || []
          ).map((post: any) => {
            if (
              post.userId === data.updatePost.userId &&
              post.timestamp === data.updatePost.timestamp
            ) {
              return {
                ...post,
                content: data.updatePost.content,
                isEdited: data.updatePost.isEdited,
                editedAt: data.updatePost.editedAt,
              };
            }
            return post;
          });

          cache.writeQuery({
            query: GET_DISCUSSION,
            variables: { id: discussionId! },
            data: {
              getDiscussion: {
                ...existingDiscussion.getDiscussion,
                posts: updatedPosts,
              },
            },
          });
        }
      }
    },
  });

  const handleCreatePost = async (content: string) => {
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
      const input = {
        discussionId,
        content: content.trim(),
      };

      const result = await createPost({
        variables: {
          input,
        },
      });

      if (result.data?.createPost && discussion) {
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
    } catch (error: any) {
      console.error("Failed to create post:", error);
      console.error("Error details:", {
        message: error.message,
        graphQLErrors: error.graphQLErrors,
        networkError: error.networkError,
      });
    }
  };

  const handleEdit = async (postIndex: number, content: string) => {
    const postToEdit = posts[postIndex];

    if (!postToEdit) {
      console.error("Post not found. Please refresh the page and try again.");
      return;
    }

    try {
      const result = await updatePost({
        variables: {
          discussionId: discussionId!,
          postIndex: postIndex,
          input: { content: content.trim() },
        },
      });

      if (result.data?.updatePost) {
        console.log("Post updated successfully");
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

  const handleDelete = async (postIndex: number) => {
    const postToDelete = posts[postIndex];

    if (!postToDelete) {
      console.error("Post not found. Please refresh the page and try again.");
      return;
    }

    try {
      const result = await deletePost({
        variables: {
          discussionId: discussionId!,
          postIndex: postIndex,
        },
      });

      if (result.data?.deletePost) {
        // Cache update is handled by the mutation
        console.log("Post deleted successfully");
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

  return (
    <Container maxWidth="lg">
      <Box py={4}>
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
            </Box>
          </CardContent>
        </Card>

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
            posts.map((post: DiscussionPost, index: number) => (
              <Post
                key={index}
                post={post}
                postIndex={index}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))
          )}
        </Box>
      </Box>
    </Container>
  );
};

export default DiscussionDetail;
