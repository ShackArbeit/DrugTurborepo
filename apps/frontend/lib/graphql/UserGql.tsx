import { gql } from '@apollo/client';

export const ME_QUERY = gql`
  query Me {
    me {
      id
      username
      email
      role
      __typename
    }
  }
`;


export const USERS_QUERY = gql`
  query Users {
    users {
      id
      username
      email
      role
      __typename
    }
  }
`;

export const UPDATE_USER_ROLE = gql`
  mutation UpdateUserRole($userEmail: String!, $newRole: Role!) {
    updateUserRole(userEmail: $userEmail, newRole: $newRole) {
      id
      username
      email
      role
      __typename
    }
  }
`;