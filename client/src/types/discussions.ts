export interface Discussion {
  id: string;
  title: string;
  linkedTo: DiscussionTarget;
  tags: string[];
  createdBy: User;
  followers: User[];
  postCount: number;
  lastActivity: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DiscussionTarget {
  type: DiscussionTargetType;
  refId: string;
  preset?: Preset;
  filmSim?: FilmSim;
}

export interface DiscussionPost {
  id: string;
  discussionId: string;
  parentId?: string;
  author: User;
  content: string;
  imageUrl?: string;
  mentions: Mention[];
  reactions: Reaction[];
  isEdited: boolean;
  editedAt?: string;
  isDeleted: boolean;
  deletedAt?: string;
  deletedBy?: User;
  createdAt: string;
  updatedAt: string;
  replies?: DiscussionPost[];
}

export interface Mention {
  type: MentionType;
  refId: string;
  displayName: string;
  user?: User;
  preset?: Preset;
  filmSim?: FilmSim;
}

export interface Reaction {
  emoji: string;
  users: User[];
  count: number;
}

export interface DiscussionConnection {
  discussions: Discussion[];
  totalCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PostConnection {
  posts: DiscussionPost[];
  totalCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export enum DiscussionTargetType {
  PRESET = "PRESET",
  FILMSIM = "FILMSIM",
}

export enum MentionType {
  USER = "USER",
  PRESET = "PRESET",
  FILMSIM = "FILMSIM",
}

export interface CreateDiscussionInput {
  title: string;
  linkedToType: DiscussionTargetType;
  linkedToId: string;
  tags?: string[];
}

export interface UpdateDiscussionInput {
  title?: string;
  tags?: string[];
  isActive?: boolean;
}

export interface CreatePostInput {
  discussionId?: string;
  parentId?: string;
  content: string;
  imageUrl?: string;
  linkedToType?: DiscussionTargetType;
  linkedToId?: string;
}

export interface UpdatePostInput {
  content: string;
  imageUrl?: string;
}

export interface AddReactionInput {
  postId: string;
  emoji: string;
}

export interface RemoveReactionInput {
  postId: string;
  emoji: string;
}

// Supporting types
export interface User {
  id: string;
  username: string;
  avatar?: string;
}

export interface Preset {
  id: string;
  title: string;
  slug: string;
  thumbnail?: string;
}

export interface FilmSim {
  id: string;
  name: string;
  slug: string;
  thumbnail?: string;
}
