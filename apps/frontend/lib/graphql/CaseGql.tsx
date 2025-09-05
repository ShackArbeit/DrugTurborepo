import { gql } from '@apollo/client';

//  查詢所有的案件
export const GET_ALL_CAESE=gql`
    query GetAllCases{
       cases{
                id
                caseName
                caseNumber
                caseType
                prefixLetter
                section
                submitUnit
                Creator_Name
                submitterName
                submitterPhone
                submitterTel
                satisfaction_levelOne
                satisfaction_levelTwo
                satisfaction_levelThree
                satisfaction_levelFour
                year
                createdAt  
       }
    }
`
// 依照 ID 查詢特定案件
export const GET_CASE_BY_ID=gql`
    query GetCaseById($id:Int!){
         case(id:$id){
            id
            caseNumber
            caseType
            caseName
            submitUnit
            Creator_Name
            submitterName
            submitterPhone
            submitterTel
            satisfaction_levelOne
            satisfaction_levelTwo
            satisfaction_levelThree
            satisfaction_levelFour
            createdAt
            year
            prefixLetter
            section
            evidences {
              id
              evidenceNumber
              evidenceType
              is_Pickup
            }
        }
    }
`
// 新增案件
export const CREATE_CASE=gql`
     mutation CreateCase($input:CreateCaseInput!){
         createCase(input: $input){
              id
              caseNumber
         }
     }
`
// 更新案件
export const UPDATE_CASE = gql`
  mutation UpdateCase($id: Int!, $input: UpdateCaseInput!) {
    updateCase(id: $id, input: $input) {
      id
      caseNumber
    }
  }
`;

// 移除案件
export const REMOVE_CASE = gql`
  mutation RemoveCase($id: Int!) {
    removeCase(id: $id)
  }
`;

// 查詢特定案件所存在的證物數量
export const CASE_BY_CASE_NUMBER=gql`
     query CaseByCaseNumber($caseNumber:String!){
           caseByCaseNumber(caseNumber:$caseNumber){
                id
                caseNumber
                evidenceCount
           }
    }
`