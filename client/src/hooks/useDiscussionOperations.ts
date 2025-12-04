import { useState } from "react";
import { useMutation } from "@apollo/client";
import { useAuth } from "../context/AuthContext";
import { Discussion as DiscussionType } from "../types/discussions";
import {
  FOLLOW_DISCUSSION,
  UNFOLLOW_DISCUSSION,
  DELETE_POST,
  UPDATE_POST,
  CREATE_POST,
  CREATE_DISCUSSION,
} from "../graphql/mutations/discussions";
import { GET_DISCUSSION_BY_ITEM } from "../graphql/queries/discussions";
import {
  useCreateNotification,
  createDiscussionReplyNotification,
} from "lib/utils/notificationUtils";

export const useDiscussionOperations = (
  itemId: string,
  itemType: "preset" | "filmsim",
  itemTitle: string,
  discussion: DiscussionType | null
) => {
  const { user } = useAuth();
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const createNotification = useCreateNotification();

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

  const [createPost, { loading: creatingPost }] = useMutation(CREATE_POST, {
    update: (cache, { data, errors }) => {
      if (errors) {
        console.error("Mutation had errors:", errors);
        return;
      }

      if (data?.createPost && discussion) {
        const existingDiscussion = cache.readQuery({
          query: GET_DISCUSSION_BY_ITEM,
          variables: {
            type: itemType.toUpperCase() as "PRESET" | "FILMSIM",
            refId: itemId,
          },
        }) as any;

        if (existingDiscussion?.getDiscussionByLinkedItem) {
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
            query: GET_DISCUSSION_BY_ITEM,
            variables: {
              type: itemType.toUpperCase() as "PRESET" | "FILMSIM",
              refId: itemId,
            },
            data: {
              getDiscussionByLinkedItem: {
                ...existingDiscussion.getDiscussionByLinkedItem,
                posts: [
                  ...(existingDiscussion.getDiscussionByLinkedItem.posts || []),
                  newPost,
                ],
              },
            },
          });
        }
      }
    },
  });

  const [createDiscussion] = useMutation(CREATE_DISCUSSION, {
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

  const [deletePost] = useMutation(DELETE_POST, {
    update: (cache, { data, errors }, { variables }) => {
      if (errors) {
        console.error("Delete post mutation had errors:", errors);
        return;
      }

      if (data?.deletePost) {
        const postIndexToRemove = variables?.postIndex;

        if (postIndexToRemove !== undefined && postIndexToRemove >= 0) {
          cache.modify({
            id: cache.identify({
              __typename: "Discussion",
              id: variables?.discussionId,
            }),
            fields: {
              posts(existingPosts = []) {
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
        const existingDiscussion = cache.readQuery({
          query: GET_DISCUSSION_BY_ITEM,
          variables: {
            type: itemType.toUpperCase() as "PRESET" | "FILMSIM",
            refId: itemId,
          },
        }) as any;

        if (existingDiscussion?.getDiscussionByLinkedItem) {
          const updatedPosts = (
            existingDiscussion.getDiscussionByLinkedItem.posts || []
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
            query: GET_DISCUSSION_BY_ITEM,
            variables: {
              type: itemType.toUpperCase() as "PRESET" | "FILMSIM",
              refId: itemId,
            },
            data: {
              getDiscussionByLinkedItem: {
                ...existingDiscussion.getDiscussionByLinkedItem,
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

  const handleCreatePost = async (content: string) => {
    if (!content.trim()) return;

    try {
      let currentDiscussionId = discussion?.id;

      if (!currentDiscussionId) {
        const discussionInput = {
          title: `Discussion about ${itemTitle}`,
          linkedToType: itemType.toUpperCase() as "PRESET" | "FILMSIM",
          linkedToId: itemId,
        };

        const discussionResult = await createDiscussion({
          variables: { input: discussionInput },
        });

        if (discussionResult.data?.createDiscussion) {
          currentDiscussionId = discussionResult.data.createDiscussion.id;
        } else {
          console.error("Failed to create discussion");
          return;
        }
      }

      const postInput = {
        discussionId: currentDiscussionId,
        content: content.trim(),
      };

      const result = await createPost({
        variables: { input: postInput },
      });

      if (result.data?.createPost) {
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
      }
    } catch (error) {
      console.error("Error creating post:", error);
    }
  };

  const handleEdit = async (postIndex: number, content: string) => {
    const postToEdit = discussion?.posts[postIndex];

    if (!postToEdit) {
      console.error("Post not found. Please refresh the page and try again.");
      return;
    }

    if (!user) {
      console.error("You must be logged in to edit posts.");
      return;
    }

    if (postToEdit.userId !== user.id) {
      console.error("You can only edit your own posts.");
      return;
    }

    try {
      const result = await updatePost({
        variables: {
          discussionId: discussion?.id || "",
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
    const postToDelete = discussion?.posts[postIndex];

    if (!postToDelete) {
      setDeleteError("Post not found. Please refresh the page and try again.");
      return;
    }

    if (!user) {
      setDeleteError("You must be logged in to delete posts.");
      return;
    }

    if (postToDelete.userId !== user.id) {
      setDeleteError("You can only delete your own posts.");
      return;
    }

    setDeleteError(null);

    try {
      const result = await deletePost({
        variables: {
          discussionId: discussion?.id || "",
          postIndex: postIndex,
        },
      });

      if (result.data?.deletePost) {
        console.log("Post deleted successfully");
      } else if (result.errors && result.errors.length > 0) {
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
              errorMessage =
                "Server error occurred while deleting the post. Please try again later or contact support if the issue persists.";
              break;
            default:
              errorMessage = firstError.message || errorMessage;
          }
        }

        setDeleteError(errorMessage);
      } else {
        setDeleteError("Failed to delete post. Please try again.");
      }
    } catch (error: any) {
      console.error("Delete post error:", error);

      let errorMessage = "Failed to delete post. Please try again.";
      if (error.graphQLErrors && error.graphQLErrors.length > 0) {
        errorMessage = error.graphQLErrors[0].message || errorMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }

      setDeleteError(errorMessage);
    }
  };

  return {
    user,
    deleteError,
    setDeleteError,
    creatingPost,
    isUserFollowing,
    handleFollow,
    handleCreatePost,
    handleEdit,
    handleDelete,
  };
};
