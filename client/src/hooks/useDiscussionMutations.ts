import { useMutation, useApolloClient } from "@apollo/client";
import { useAuth } from "../context/AuthContext";
import {
  CREATE_POST,
  DELETE_POST,
  UPDATE_POST,
  FOLLOW_DISCUSSION,
  UNFOLLOW_DISCUSSION,
} from "../graphql/mutations/discussions";
import {
  GET_DISCUSSION_BY_ITEM,
  GET_POSTS,
} from "../graphql/queries/discussions";
import {
  useCreateNotification,
  createDiscussionReplyNotification,
} from "../utils/notificationUtils";
import { Discussion as DiscussionType } from "../types/discussions";

interface UseDiscussionMutationsProps {
  discussion: DiscussionType | null;
  itemType: "preset" | "filmsim";
  itemId: string;
  isEmbedded: boolean;
  showFullThread: boolean;
  refetchTopLevel: () => void;
  fetchAllPosts: () => void;
}

export const useDiscussionMutations = ({
  discussion,
  itemType,
  itemId,
  isEmbedded,
  showFullThread,
  refetchTopLevel,
  fetchAllPosts,
}: UseDiscussionMutationsProps) => {
  const { user } = useAuth();
  const client = useApolloClient();
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

  const [createPost, { loading: creatingPost }] = useMutation(CREATE_POST);

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
      let currentDiscussionId = discussion?.id;

      // If no discussion exists, create one first
      if (!currentDiscussionId) {
        console.log("No discussion exists, creating one...");
        const discussionInput = {
          title: `Discussion about ${itemId}`,
          linkedToType: itemType.toUpperCase() as "PRESET" | "FILMSIM",
          linkedToId: itemId,
        };

        console.log("Creating discussion with input:", discussionInput);

        // Note: CREATE_DISCUSSION mutation would need to be imported and used here
        // For now, we'll assume the discussion exists
        return;
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
    if (!user) {
      console.error("You must be logged in to edit posts.");
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

    if (!user) {
      console.error("You must be logged in to delete posts.");
      return;
    }

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
      } else {
        console.error("Failed to delete post - no data returned");
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

      console.error("Delete post error:", errorMessage);
    }
  };

  const isUserFollowing = (discussion: DiscussionType): boolean => {
    if (!user) return false;
    return discussion.followers.some((follower) => follower.id === user.id);
  };

  return {
    creatingPost,
    handleFollow,
    handleCreatePost,
    handleReply,
    handleEdit,
    handleDelete,
    isUserFollowing,
  };
};
