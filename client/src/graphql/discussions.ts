import { gql } from "@apollo/client";

export const GET_DISCUSSION = gql`
  query GetDiscussion($id: ID!) {
    getDiscussion(id: $id) {
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
          thumbnail
        }
        filmSim {
          id
          name
          slug
          sampleImages {
            url
          }
          thumbnail
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
        replies {
          userId
          username
          avatar
          content
          timestamp
          isEdited
          editedAt
        }
      }
      isActive
      createdAt
      updatedAt
    }
  }
`;

export const GET_DISCUSSIONS = gql`
  query GetDiscussions(
    $page: Int
    $limit: Int
    $type: DiscussionTargetType
    $search: String
    $createdBy: ID
  ) {
    getDiscussions(
      page: $page
      limit: $limit
      type: $type
      search: $search
      createdBy: $createdBy
    ) {
      discussions {
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
          replies {
            userId
            username
            avatar
            content
            timestamp
            isEdited
            editedAt
          }
        }
        isActive
        createdAt
        updatedAt
      }
      totalCount
      hasNextPage
      hasPreviousPage
    }
  }
`;

export const GET_DISCUSSION_BY_ITEM = gql`
  query GetDiscussionByLinkedItem($type: DiscussionTargetType!, $refId: ID!) {
    getDiscussionByLinkedItem(type: $type, refId: $refId) {
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
          thumbnail
        }
        filmSim {
          id
          name
          slug
          sampleImages {
            url
          }
          thumbnail
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
        replies {
          userId
          username
          avatar
          content
          timestamp
          isEdited
          editedAt
        }
      }
      isActive
      createdAt
      updatedAt
    }
  }
`;

// GET_POSTS query removed - posts are now included directly in discussion queries

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

export const CREATE_REPLY = gql`
  mutation CreateReply($input: CreateReplyInput!) {
    createReply(input: $input) {
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

export const UPDATE_REPLY = gql`
  mutation UpdateReply($input: UpdateReplyInput!) {
    updateReply(input: $input) {
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

export const DELETE_REPLY = gql`
  mutation DeleteReply(
    $discussionId: ID!
    $postIndex: Int!
    $replyIndex: Int!
  ) {
    deleteReply(
      discussionId: $discussionId
      postIndex: $postIndex
      replyIndex: $replyIndex
    )
  }
`;

export const ADMIN_DELETE_DISCUSSION = gql`
  mutation AdminDeleteDiscussion($id: ID!) {
    adminDeleteDiscussion(id: $id)
  }
`;

export const ADMIN_DELETE_POST = gql`
  mutation AdminDeletePost($discussionId: ID!, $postIndex: Int!) {
    adminDeletePost(discussionId: $discussionId, postIndex: $postIndex) {
      id
      title
      posts {
        userId
        username
        avatar
        content
        timestamp
        isEdited
        editedAt
        replies {
          userId
          username
          avatar
          content
          timestamp
          isEdited
          editedAt
        }
      }
    }
  }
`;

export const ADMIN_DELETE_REPLY = gql`
  mutation AdminDeleteReply(
    $discussionId: ID!
    $postIndex: Int!
    $replyIndex: Int!
  ) {
    adminDeleteReply(
      discussionId: $discussionId
      postIndex: $postIndex
      replyIndex: $replyIndex
    )
  }
`;

export const ADMIN_UPDATE_DISCUSSION = gql`
  mutation AdminUpdateDiscussion($id: ID!, $input: UpdateDiscussionInput!) {
    adminUpdateDiscussion(id: $id, input: $input) {
      id
      title
      description
      linkedTo {
        type
        refId
        preset {
          id
          title
          slug
          afterImage {
            id
            url
          }
        }
        filmSim {
          id
          name
          slug
          sampleImages {
            id
            url
          }
        }
      }
      createdBy {
        id
        username
        avatar
      }
      createdAt
      updatedAt
      posts {
        userId
        username
        avatar
        content
        timestamp
        isEdited
        editedAt
        replies {
          userId
          username
          avatar
          content
          timestamp
          isEdited
          editedAt
        }
      }
      followers {
        id
        username
        avatar
      }
    }
  }
`;
