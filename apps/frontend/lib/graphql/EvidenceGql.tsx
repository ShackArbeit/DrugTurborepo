import { gql } from '@apollo/client';

// 查詢所有證物

export const GET_ALL_EVIDENCES=gql`
    query GetAllCases{
             evidences{
                  id
                  evidenceNumber
                  evidenceType
                  evidenceBrand
                  evidenceSerialNo
                  evidenceOriginalNo
                  createdAt
                  deliveryName
                  receiverName
                  is_rejected
                  is_beyond_scope
                  is_lab_related
                  is_info_complete
                  deliveryName2
                  receiverName2
                  is_Pickup
                  case{
                  id 
                    caseNumber
                    caseName
                    caseType
                  }
       }
    }
`

// 依照 ID 查詢特定證物
export const GET_EVIDENCE_BY_ID = gql`
  query GetEvidenceById($id: Int!) {
    evidence(id: $id) {
      id
      evidenceNumber
      evidenceType
      evidenceBrand
      evidenceSerialNo
      evidenceOriginalNo
      deliveryName
      receiverName
      createdAt
      is_rejected
      is_beyond_scope
      is_lab_related
      is_info_complete
      deliveryName2
      receiverName2
      is_Pickup
      photoFront
      photoBack
      photoFront2
      photoBack2
      case {
        id
        caseName
        caseNumber
        submitUnit
        evidences { id evidenceNumber createdAt }
      }
    }
  }
`;
// 新增證物
export const CREATE_EVIDENCE=gql`
    mutation CreateEvidence($input:CreateEvidenceInput!){
        createEvidence(input:$input){
            id
            evidenceNumber
            evidenceType
            evidenceBrand
        }
    }
`
// 更新證物
export const UPDATE_EVIDENCE=gql`
    mutation UpdateEvidence($id:Int!,$input: UpdateEvidenceInput!){
           updateEvidence(id:$id,input:$input){    
                  id
                  evidenceNumber
                  evidenceType
                  evidenceBrand
           } 
    }
`
// 刪除證物
export const REMOVE_EVIDENCE=gql`
    mutation RemoveEvidence($id:Int!){
         removeEvidence(id:$id)
    }
`


