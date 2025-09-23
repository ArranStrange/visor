import { DiscussionPost } from "../types/discussions";

/**
 * Organizes posts into a threaded structure
 */
export const organizePostsIntoThreads = (
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

/**
 * Formats a date string to a human-readable relative time
 */
export const formatDate = (dateString: string | undefined | null): string => {
  if (!dateString) return "a moment ago";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "an unknown time ago";

    // Simple relative time formatting
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "just now";
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000)
      return `${Math.floor(diffInSeconds / 86400)} days ago`;

    return date.toLocaleDateString();
  } catch (e) {
    return "an unknown time ago";
  }
};
