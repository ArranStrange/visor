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
      }
      isActive
      createdAt
      updatedAt
    }
  }
`;

// GET_POSTS query removed - posts are now included directly in discussion queries
