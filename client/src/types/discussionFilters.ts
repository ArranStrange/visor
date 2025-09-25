import { DiscussionTargetType } from "./discussions";

export interface DiscussionFilters {
  search?: string;
  type?: DiscussionTargetType | "all";
  sortBy?: string;
}

export interface DiscussionSortOptions {
  newest: string;
  oldest: string;
  mostActive: string;
  mostReactions: string;
}

export const SORT_OPTIONS: DiscussionSortOptions = {
  newest: "newest",
  oldest: "oldest",
  mostActive: "mostActive",
  mostReactions: "mostReactions",
} as const;
