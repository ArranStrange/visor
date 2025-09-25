export interface DiscussionPost {
  userId: string;
  username: string;
  avatar?: string;
  content: string;
  timestamp: string;
  isEdited?: boolean;
  editedAt?: string;
}

export interface Discussion {
  id: string;
  title: string;
  linkedTo: DiscussionTarget;
  createdBy: User;
  followers: User[];
  posts: DiscussionPost[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DiscussionTarget {
  type: DiscussionTargetType;
  refId: string;
  preset?: Preset;
  filmSim?: FilmSim;
  technique?: Technique;
  equipment?: Equipment;
  location?: Location;
  tutorial?: Tutorial;
  review?: Review;
  challenge?: Challenge;
  workflow?: Workflow;
  inspiration?: Inspiration;
  critique?: Critique;
  news?: News;
  event?: Event;
}

export interface DiscussionConnection {
  discussions: Discussion[];
  totalCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export enum DiscussionTargetType {
  PRESET = "PRESET",
  FILMSIM = "FILMSIM",
  GENERAL = "GENERAL",
  TECHNIQUE = "TECHNIQUE",
  EQUIPMENT = "EQUIPMENT",
  LOCATION = "LOCATION",
  TUTORIAL = "TUTORIAL",
  REVIEW = "REVIEW",
  CHALLENGE = "CHALLENGE",
  WORKFLOW = "WORKFLOW",
  INSPIRATION = "INSPIRATION",
  CRITIQUE = "CRITIQUE",
  NEWS = "NEWS",
  EVENT = "EVENT",
}

export interface CreateDiscussionInput {
  title: string;
  linkedToType: DiscussionTargetType;
  linkedToId: string;
}

export interface UpdateDiscussionInput {
  title?: string;
  isActive?: boolean;
}

export interface CreatePostInput {
  discussionId: string;
  content: string;
}

export interface UpdatePostInput {
  discussionId: string;
  postIndex: number;
  content: string;
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
  afterImage?: {
    url: string;
  };
}

export interface FilmSim {
  id: string;
  name: string;
  slug: string;
  sampleImages?: Array<{
    url: string;
  }>;
}

// New discussion type interfaces
export interface Technique {
  id: string;
  name: string;
  slug: string;
  description?: string;
  category?: string;
  difficulty?: string;
  thumbnail?: {
    url: string;
  };
}

export interface Equipment {
  id: string;
  name: string;
  slug: string;
  type: string; // camera, lens, accessory, etc.
  brand?: string;
  model?: string;
  description?: string;
  image?: {
    url: string;
  };
}

export interface Location {
  id: string;
  name: string;
  slug: string;
  city?: string;
  country?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  description?: string;
  thumbnail?: {
    url: string;
  };
}

export interface Tutorial {
  id: string;
  title: string;
  slug: string;
  description?: string;
  difficulty?: string;
  duration?: string;
  thumbnail?: {
    url: string;
  };
}

export interface Review {
  id: string;
  title: string;
  slug: string;
  productName?: string;
  rating?: number;
  summary?: string;
  thumbnail?: {
    url: string;
  };
}

export interface Challenge {
  id: string;
  title: string;
  slug: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  rules?: string[];
  prize?: string;
  thumbnail?: {
    url: string;
  };
}

export interface Workflow {
  id: string;
  title: string;
  slug: string;
  description?: string;
  steps?: string[];
  software?: string[];
  thumbnail?: {
    url: string;
  };
}

export interface Inspiration {
  id: string;
  title: string;
  slug: string;
  description?: string;
  source?: string;
  tags?: string[];
  thumbnail?: {
    url: string;
  };
}

export interface Critique {
  id: string;
  title: string;
  slug: string;
  imageUrl?: string;
  description?: string;
  feedback?: string;
  rating?: number;
}

export interface News {
  id: string;
  title: string;
  slug: string;
  summary?: string;
  content?: string;
  source?: string;
  publishedAt?: string;
  thumbnail?: {
    url: string;
  };
}

export interface Event {
  id: string;
  title: string;
  slug: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  type?: string; // workshop, meetup, exhibition, etc.
  thumbnail?: {
    url: string;
  };
}
