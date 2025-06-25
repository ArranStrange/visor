import { gql } from "@apollo/client";

export const CREATE_DISCUSSION = gql`
  mutation CreateDiscussion($input: CreateDiscussionInput!) {
    createDiscussion(input: $input) {
      id
      title
      linkedTo {
        type
        refId
        preset {
          id
          title
          slug
          afterImage {
            url
          }
        }
        filmSim {
          id
          name
          slug
          sampleImages {
            url
          }
        }
      }
      tags
      createdBy {
        id
        username
        avatar
      }
      followers {
        id
        username
        avatar
      }
      postCount
      lastActivity
      isActive
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_DISCUSSION = gql`
  mutation UpdateDiscussion($id: ID!, $input: UpdateDiscussionInput!) {
    updateDiscussion(id: $id, input: $input) {
      id
      title
      linkedTo {
        type
        refId
        preset {
          id
          title
          slug
          afterImage {
            url
          }
        }
        filmSim {
          id
          name
          slug
          sampleImages {
            url
          }
        }
      }
      tags
      createdBy {
        id
        username
        avatar
      }
      followers {
        id
        username
        avatar
      }
      postCount
      lastActivity
      isActive
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_DISCUSSION = gql`
  mutation DeleteDiscussion($id: ID!) {
    deleteDiscussion(id: $id)
  }
`;

export const FOLLOW_DISCUSSION = gql`
  mutation FollowDiscussion($discussionId: ID!) {
    followDiscussion(discussionId: $discussionId) {
      id
      followers {
        id
        username
        avatar
      }
    }
  }
`;

export const UNFOLLOW_DISCUSSION = gql`
  mutation UnfollowDiscussion($discussionId: ID!) {
    unfollowDiscussion(discussionId: $discussionId) {
      id
      followers {
        id
        username
        avatar
      }
    }
  }
`;

export const CREATE_POST = gql`
  mutation CreatePost($input: CreatePostInput!) {
    createPost(input: $input) {
      id
      discussionId
      parentId
      author {
        id
        username
        avatar
      }
      content
      imageUrl
      mentions {
        type
        refId
        displayName
        user {
          id
          username
          avatar
        }
        preset {
          id
          title
          slug
        }
        filmSim {
          id
          name
          slug
        }
      }
      reactions {
        emoji
        users {
          id
          username
          avatar
        }
        count
      }
      isEdited
      editedAt
      isDeleted
      deletedAt
      deletedBy {
        id
        username
      }
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_POST = gql`
  mutation UpdatePost($id: ID!, $input: UpdatePostInput!) {
    updatePost(id: $id, input: $input) {
      id
      discussionId
      parentId
      author {
        id
        username
        avatar
      }
      content
      imageUrl
      mentions {
        type
        refId
        displayName
        user {
          id
          username
          avatar
        }
        preset {
          id
          title
          slug
        }
        filmSim {
          id
          name
          slug
        }
      }
      reactions {
        emoji
        users {
          id
          username
          avatar
        }
        count
      }
      isEdited
      editedAt
      isDeleted
      deletedAt
      deletedBy {
        id
        username
      }
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_POST = gql`
  mutation DeletePost($id: ID!) {
    deletePost(id: $id)
  }
`;

export const ADD_REACTION = gql`
  mutation AddReaction($input: AddReactionInput!) {
    addReaction(input: $input) {
      id
      reactions {
        emoji
        users {
          id
          username
          avatar
        }
        count
      }
    }
  }
`;

export const REMOVE_REACTION = gql`
  mutation RemoveReaction($input: RemoveReactionInput!) {
    removeReaction(input: $input) {
      id
      reactions {
        emoji
        users {
          id
          username
          avatar
        }
        count
      }
    }
  }
`;
