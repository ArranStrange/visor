import { gql } from "@apollo/client";

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
