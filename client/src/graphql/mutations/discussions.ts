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
        }
        filmSim {
          id
          name
          slug
        }
      }
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
      posts {
        userId
        username
        avatar
        content
        timestamp
        isEdited
        editedAt
      }
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
        }
        filmSim {
          id
          name
          slug
        }
      }
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
      posts {
        userId
        username
        avatar
        content
        timestamp
        isEdited
        editedAt
      }
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
      userId
      username
      avatar
      content
      timestamp
      isEdited
      editedAt
    }
  }
`;

export const UPDATE_POST = gql`
  mutation UpdatePost($input: UpdatePostInput!) {
    updatePost(input: $input) {
      userId
      username
      avatar
      content
      timestamp
      isEdited
      editedAt
    }
  }
`;

export const DELETE_POST = gql`
  mutation DeletePost($discussionId: ID!, $postIndex: Int!) {
    deletePost(discussionId: $discussionId, postIndex: $postIndex)
  }
`;
