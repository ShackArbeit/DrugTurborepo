import { gql } from '@apollo/client';

export const ME_QUERY=gql`
      query me{
          id
          username
          email
          role      
      }
`

export const USERS_QUERY= gql`
     query Users{
           users{
               id
               username
               email
               role          
           }
     }

`
export const UPDATE_USER_ROLE = gql`
     mutation UpdateUserRole($userEmail: String!, $newRole: Role!){
         updateUserRole(userEmail:$userEmail,newRole:$newRole){
             id
             username
             email
             role
         }
     }

`