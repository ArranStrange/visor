import { Discussion, User } from "../types/discussions";

export const isUserFollowing = (
  discussion: Discussion,
  user: User | null
): boolean => {
  if (!user) return false;
  return discussion.followers.some((follower) => follower.id === user.id);
};
