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
      postCount
      lastActivity
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
        postCount
        lastActivity
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
      postCount
      lastActivity
      isActive
      createdAt
      updatedAt
    }
  }
`;

export const GET_POSTS = gql`
  query GetPosts($discussionId: ID!, $page: Int, $limit: Int, $parentId: ID) {
    getPosts(
      discussionId: $discussionId
      page: $page
      limit: $limit
      parentId: $parentId
    ) {
      posts {
        id
        discussionId
        parentId
        author {
          id
          username
          avatar
        }
        content
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
      totalCount
      hasNextPage
      hasPreviousPage
    }
  }
`;
