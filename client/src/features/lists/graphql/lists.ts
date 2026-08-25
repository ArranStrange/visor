import { gql } from "@apollo/client";
import type { UserList } from "@/features/lists/types/lists";

export interface PublicProfileList extends UserList {
  createdAt?: string;
}

export interface GetPublicProfileListsQueryData {
  getUserLists: PublicProfileList[];
}

export interface GetPublicProfileListsQueryVariables {
  userId: string;
}

export type AddButtonList = Pick<
  UserList,
  "id" | "name" | "description" | "isPublic" | "presets" | "filmSims"
>;

export interface GetUserListsForAddButtonQueryData {
  getUserLists: AddButtonList[];
}

export interface GetUserListsForAddButtonQueryVariables {
  userId: string;
}

export interface AddToListMutationData {
  addToUserList: Pick<
    UserList,
    "id" | "name" | "description" | "isPublic"
  > | null;
}

export interface AddToListMutationVariables {
  listId: string;
  presetIds?: string[];
  filmSimIds?: string[];
}

export const BROWSE_USER_LISTS = gql`
  query BrowseUserLists($search: String, $page: Int, $limit: Int) {
    browseUserLists(search: $search, page: $page, limit: $limit) {
      lists {
        id
        name
        description
        isPublic
        isFeatured
        createdAt
        updatedAt
        owner {
          id
          username
          avatar
        }
        presets {
          id
          title
          slug
          afterImage {
            id
            url
          }
          tags {
            id
            name
            displayName
          }
        }
        filmSims {
          id
          name
          slug
          sampleImages {
            id
            url
          }
        }
      }
      totalCount
      hasNextPage
      hasPreviousPage
    }
  }
`;

// Used by MyLists.tsx - full shape including isFeatured/owner/timestamps.
export const GET_USER_LISTS = gql`
  query GetUserLists($userId: ID!) {
    getUserLists(userId: $userId) {
      id
      name
      description
      isPublic
      isFeatured
      owner {
        id
        username
        avatar
      }
      presets {
        id
        title
        slug
        afterImage {
          url
        }
      }
      filmSims {
        id
        name
        slug
        sampleImages {
          url
        }
      }
      createdAt
      updatedAt
    }
  }
`;

// Used by AddToListDialog.tsx - needs owner.id to filter to the current user's lists.
export const GET_USER_LISTS_FOR_ADD_DIALOG = gql`
  query GetUserLists($userId: ID!) {
    getUserLists(userId: $userId) {
      id
      name
      description
      isPublic
      owner {
        id
      }
      presets {
        id
        title
        slug
      }
      filmSims {
        id
        name
        slug
      }
    }
  }
`;

// Used by AddToListButton.tsx.
export const GET_USER_LISTS_FOR_ADD_BUTTON = gql`
  query GetUserLists($userId: ID!) {
    getUserLists(userId: $userId) {
      id
      name
      description
      isPublic
      presets {
        id
        title
        slug
      }
      filmSims {
        id
        name
        slug
      }
    }
  }
`;

// Used by PublicProfile.tsx.
export const GET_USER_LISTS_FOR_PUBLIC_PROFILE = gql`
  query GetUserLists($userId: ID!) {
    getUserLists(userId: $userId) {
      id
      name
      description
      isPublic
      createdAt
      presets {
        id
        title
        slug
        afterImage {
          url
        }
      }
      filmSims {
        id
        name
        slug
        sampleImages {
          url
        }
      }
    }
  }
`;

export const GET_LIST = gql`
  query GetList($id: ID!) {
    getUserList(id: $id) {
      id
      name
      description
      isPublic
      owner {
        id
        username
      }
      presets {
        id
        title
        slug
        afterImage {
          url
        }
      }
      filmSims {
        id
        name
        slug
        sampleImages {
          url
        }
      }
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_LIST = gql`
  mutation CreateList($input: CreateUserListInput!) {
    createUserList(input: $input) {
      id
      name
      description
      isPublic
      owner {
        id
        username
      }
    }
  }
`;

export const UPDATE_LIST = gql`
  mutation UpdateList($id: ID!, $input: UpdateUserListInput!) {
    updateUserList(id: $id, input: $input) {
      id
      name
      description
      isPublic
    }
  }
`;

export const DELETE_LIST = gql`
  mutation DeleteList($id: ID!) {
    deleteUserList(id: $id)
  }
`;

export const ADD_TO_LIST = gql`
  mutation AddToUserList($listId: ID!, $presetIds: [ID!], $filmSimIds: [ID!]) {
    addToUserList(
      listId: $listId
      presetIds: $presetIds
      filmSimIds: $filmSimIds
    ) {
      id
      name
      description
      isPublic
    }
  }
`;

export const FEATURE_LIST = gql`
  mutation FeatureUserList($id: ID!) {
    featureUserList(id: $id) {
      id
      isFeatured
    }
  }
`;

export const UNFEATURE_LIST = gql`
  mutation UnfeatureUserList($id: ID!) {
    unfeatureUserList(id: $id) {
      id
      isFeatured
    }
  }
`;
