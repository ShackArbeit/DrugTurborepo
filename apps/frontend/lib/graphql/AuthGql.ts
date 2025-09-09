import { gql } from '@apollo/client';

export const LOGIN_MUTATION = gql`
  mutation Login($authInput: AuthInput!) {
    login(authInput: $authInput) {
      access_token
    }
  }
`;

export const REGISTER_MUTATION = gql`
  mutation Register($data: RegisterUserInput!) {
    register(data: $data) {
      id
      username
      role
    }
  }
`;

export const GET_ME= gql`
    query Me{
        me{
           id
           username
           role
        }
    }

`