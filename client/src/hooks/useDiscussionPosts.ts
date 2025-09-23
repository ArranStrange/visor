import { useState, useEffect } from "react";
import { useQuery, useApolloClient } from "@apollo/client";
import { DiscussionPost } from "../types/discussions";
import { GET_POSTS } from "../graphql/queries/discussions";

interface UseDiscussionPostsProps {
  discussionId: string | undefined;
  isEmbedded: boolean;
  showFullThread: boolean;
}

export const useDiscussionPosts = ({
  discussionId,
  isEmbedded,
  showFullThread,
}: UseDiscussionPostsProps) => {
  const client = useApolloClient();
  const [allPosts, setAllPosts] = useState<DiscussionPost[]>([]);
  const [loadingReplies, setLoadingReplies] = useState(false);

  const {
    data: topLevelPostsData,
    loading: topLevelLoading,
    error: topLevelError,
    refetch: refetchTopLevel,
  } = useQuery(GET_POSTS, {
    variables: {
      discussionId: discussionId || "",
      parentId: null,
      page: 1,
      limit: isEmbedded && !showFullThread ? 3 : 20,
    },
    skip: !discussionId,
  });

  const fetchReplies = async (parentId: string): Promise<DiscussionPost[]> => {
    try {
      const result = await client.query({
        query: GET_POSTS,
        variables: {
          discussionId: discussionId || "",
          parentId,
        },
      });
      return result.data?.getPosts?.posts || [];
    } catch (error) {
      console.error(`Error fetching replies for post ${parentId}:`, error);
      return [];
    }
  };

  const fetchAllPosts = async () => {
    if (!topLevelPostsData?.getPosts?.posts) return;

    setLoadingReplies(true);
    try {
      const topLevelPosts = topLevelPostsData.getPosts.posts;
      const allPostsWithReplies: DiscussionPost[] = [...topLevelPosts];

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

  useEffect(() => {
    if (topLevelPostsData?.getPosts?.posts) {
      fetchAllPosts();
    }
  }, [topLevelPostsData]);

  return {
    posts: allPosts,
    postsLoading: topLevelLoading || loadingReplies,
    postsError: topLevelError,
    refetchTopLevel,
    fetchAllPosts,
  };
};
