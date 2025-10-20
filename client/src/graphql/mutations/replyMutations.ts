import { gql } from "@apollo/client";

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
