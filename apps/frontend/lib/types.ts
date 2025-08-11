export interface PickUp {
  id: number
  evidence_id: number
  caseId?: number
  evidence?: Evidence
  created_at: string
  delivery_signature: string
  receiver_name: string
  receiver_signature: string
  pickup_time: string
  photo_path: string
  remarks: string
  satisfaction_levelOne: string
  satisfaction_levelTwo: string
  satisfaction_levelThree: string
  satisfaction_levelFour: string
}

export interface ExaminResult {
  id: number
  evidence_id: number
  evidences?: Evidence
  examiner_name: string
  is_beyond_scope: boolean
  is_info_complete: boolean
  is_lab_related: boolean
  is_rejected: boolean
  remarks: string
  created_at: string
  updated_at: string
}

export interface Evidence {
  id: number
  caseId: number
  case?: Case
  evidenceNumber: string
  evidenceType: string
  evidenceBrand: string
  evidenceOriginalNo: string
  evidenceSerialNo: string
  pickup: PickUp
  examinResult: ExaminResult
  photoFront: string
  photoBack: string
  receiverSignature?: string
  deliverySignature?: string
  receiveTime: string
  createdAt: string
}

export interface Case {
  id: number
  caseNumber: string
  caseName: string
  caseType: string
  submitUnit: string
  submitterName: string
  submitterPhone: string
  submitterSignature: string
  submitterTel: string
  year: number
  section: string
  prefixLetter: string
  createdAt: string
  evidences: Evidence[]
}
