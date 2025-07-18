import { Test,TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { NotFoundException } from "@nestjs/common";
import { Evidence } from "../evidence.entity";
import { Case } from "../../Case/case.entity";
import { ExaminResult } from "../../ExaminResult/examin_result.entity";
import { PickUp } from "../../Pickup/pickup.entity";
import { EvidenceService } from "../evidence.service";
import { CreateEvidenceInput,UpdateEvidenceInput } from "../dto/evidence.inputs";

// 前置模擬資料
type MockType<T> = {
  [P in keyof T]?: jest.Mock<any,any[]>;
};
const caseData:Case={
        id: 1,
        caseNumber: 'A001',
        section: '刑事股',
        year: 2025,
        prefixLetter: 'A',
        caseType: '毒品',
        caseName: '案件說明',
        submitUnit: '單位',
        submitterName: '王小明',
        submitterPhone: '0911222333',
        submitterTel: '02-33334444',
        submitterSignature: '簽章',
        createdAt: '2025-07-18T00:00:00Z',
        evidences: [],
}
const examinResult: ExaminResult = {
      id: 77,
      evidence_id: 1,
      is_rejected: false,
      is_beyond_scope: false,
      is_lab_related: false,
      is_info_complete: true,
      examiner_name: '李警官',
      remarks: '結果OK',
      created_at: '2025-07-18T11:00:00Z',
      updated_at: '2025-07-18T11:00:00Z',
      evidences: undefined,
} as ExaminResult;

const pickup: PickUp = {
      id: 88,
      evidence_id: 1,
      pickup_time: '2025-07-18T12:00:00Z',
      photo_path: 'photo.jpg',
      satisfaction_levelOne: '非常滿意',
      satisfaction_levelTwo: '非常滿意',
      satisfaction_levelThree: '非常滿意',
      satisfaction_levelFour: '非常滿意',
      receiver_name: '張警員',
      delivery_signature: '交付簽章',
      receiver_signature: '領回簽章',
      remarks: '備註',
      created_at: '2025-07-18T12:00:00Z',
      evidences: undefined,
} as PickUp;

const evidenceArray: Evidence[] = [
  {
      id: 1,
      caseId: 1,
      evidenceNumber: 'E001',
      evidenceType: '手機',
      evidenceBrand: 'Apple',
      evidenceSerialNo: 'SN123',
      evidenceOriginalNo: 'TAG123',
      photoFront: 'photo1.jpg',
      photoBack: 'photo2.jpg',
      receiveTime: '2025-07-18T10:00:00Z',
      deliverySignature: '交付簽章',
      receiverSignature: '收件簽章',
      createdAt: '2025-07-18T10:00:00Z',
      case: caseData,
      examinResult: examinResult,
      pickup: pickup,
  } as Evidence,
];

const newEvidence: Evidence = {
      ...evidenceArray[0],
      id: 2,
      caseId: 2,
      evidenceNumber: 'E002',
      evidenceType: '手機2',
      evidenceBrand: 'Apple2',
      evidenceSerialNo: 'SN55',
      evidenceOriginalNo: 'TAG183',
      photoFront: 'photo2.jpg',
      photoBack: 'photo3.jpg',
      receiveTime: '2025-07-31T10:00:00Z',
      deliverySignature: '交付簽章2',
      receiverSignature: '收件簽章2',
      createdAt: '2025-07-31T10:00:00Z', 
} as Evidence;
//  開始測試
describe('開始測試 Evidence Service',()=>{
     let service:EvidenceService
     let evidenceRepositoryMock:MockType<Repository<Evidence>>
     let caseRepositoryMock:MockType<Repository<Case>>

     beforeEach(()=>{
           
     })
})


