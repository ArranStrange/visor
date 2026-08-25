import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { ApolloError, useMutation } from "@apollo/client";
import type { DocumentNode } from "@apollo/client";
import { useAuth } from "../context/AuthContext";
import {
  Discussion as DiscussionType,
  DiscussionTargetType,
} from "../types/discussions";
import {
  FOLLOW_DISCUSSION,
  UNFOLLOW_DISCUSSION,
  DELETE_POST,
  UPDATE_POST,
  CREATE_POST,
  CREATE_DISCUSSION,
  GET_DISCUSSION_BY_ITEM,
  type CreateDiscussionMutationData,
  type CreateDiscussionMutationVariables,
  type CreatePostMutationData,
  type CreatePostMutationVariables,
  type DeletePostMutationData,
  type DeletePostMutationVariables,
  type FollowDiscussionMutationData,
  type FollowDiscussionMutationVariables,
  type UnfollowDiscussionMutationData,
  type UnfollowDiscussionMutationVariables,
  type UpdatePostMutationData,
  type UpdatePostMutationVariables,
} from "../graphql/discussions";
import {
  useCreateNotification,
  createDiscussionReplyNotification,
} from "../utils/notificationUtils";
import { getErrorMessage } from "../utils/errorHandling";

interface DiscussionQueryRef {
  query: DocumentNode;
  variables: Record<string, unknown>;
}

interface UseDiscussionOperationsResult {
  user: ReturnType<typeof useAuth>["user"];
  deleteError: string | null;
  setDeleteError: Dispatch<SetStateAction<string | null>>;
  creatingPost: boolean;
  isUserFollowing: (discussion: DiscussionType) => boolean;
  handleFollow: () => Promise<void>;
  handleCreatePost: (content: string) => Promise<void>;
  handleEdit: (postIndex: number, content: string) => Promise<void>;
  handleDelete: (postIndex: number) => Promise<void>;
}

export const useDiscussionOperations = (
  itemId: string,
  itemType: "preset" | "filmsim",
  itemTitle: string,
  discussion: DiscussionType | null,
  // Optional override for which query to refetch after createPost/deletePost/updatePost.
  // Defaults to GET_DISCUSSION_BY_ITEM (itemType/itemId), used when a page addresses
  // the discussion by id instead (e.g. DiscussionDetail via GET_DISCUSSION).
  postsQueryRef?: DiscussionQueryRef
): UseDiscussionOperationsResult => {
  const { user } = useAuth();
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const createNotification = useCreateNotification();

  const itemQueryRef: DiscussionQueryRef = {
    query: GET_DISCUSSION_BY_ITEM,
    variables: {
      type:
        itemType === "preset"
          ? DiscussionTargetType.PRESET
          : DiscussionTargetType.FILMSIM,
      refId: itemId,
    },
  };
  const postsRefetchQuery = postsQueryRef ?? itemQueryRef;

  const [followDiscussion] = useMutation<
    FollowDiscussionMutationData,
    FollowDiscussionMutationVariables
  >(FOLLOW_DISCUSSION, {
    refetchQueries: [itemQueryRef],
  });

  const [unfollowDiscussion] = useMutation<
    UnfollowDiscussionMutationData,
    UnfollowDiscussionMutationVariables
  >(UNFOLLOW_DISCUSSION, {
    refetchQueries: [itemQueryRef],
  });

  const [createPost, { loading: creatingPost }] = useMutation<
    CreatePostMutationData,
    CreatePostMutationVariables
  >(CREATE_POST, {
    refetchQueries: [postsRefetchQuery],
    awaitRefetchQueries: true,
  });

  const [createDiscussion] = useMutation<
    CreateDiscussionMutationData,
    CreateDiscussionMutationVariables
  >(CREATE_DISCUSSION, {
    refetchQueries: [itemQueryRef],
  });

  const [deletePost] = useMutation<
    DeletePostMutationData,
    DeletePostMutationVariables
  >(DELETE_POST, {
    refetchQueries: [postsRefetchQuery],
    awaitRefetchQueries: true,
  });

  const [updatePost] = useMutation<
    UpdatePostMutationData,
    UpdatePostMutationVariables
  >(UPDATE_POST, {
    refetchQueries: [postsRefetchQuery],
    awaitRefetchQueries: true,
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
          linkedToType:
            itemType === "preset"
              ? DiscussionTargetType.PRESET
              : DiscussionTargetType.FILMSIM,
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
          input: {
            discussionId: discussion?.id || "",
            postIndex,
            content: content.trim(),
          },
        },
      });

      if (!result.data?.updatePost) {
        console.error("Failed to update post - no data returned");
      }
    } catch (error) {
      console.error("Error updating post:", error);

      const errorMessage = getErrorMessage(
        error,
        "Failed to update post. Please try again."
      );

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

      if (!result.data?.deletePost) {
        if (result.errors && result.errors.length > 0) {
          const firstError = result.errors[0];
          const resultError = new ApolloError({ graphQLErrors: result.errors });
          let errorMessage = getErrorMessage(
            resultError,
            "Failed to delete post. Please try again."
          );

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
                errorMessage = getErrorMessage(resultError, errorMessage);
            }
          }

          setDeleteError(errorMessage);
        } else {
          setDeleteError("Failed to delete post. Please try again.");
        }
      }
    } catch (error) {
      console.error("Delete post error:", error);

      const errorMessage = getErrorMessage(
        error,
        "Failed to delete post. Please try again."
      );

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
