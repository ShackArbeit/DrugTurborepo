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
import { UnionDefinitionFactory } from "@nestjs/graphql/dist/schema-builder/factories/union-definition.factory";

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

     beforeEach(async()=>{
           evidenceRepositoryMock={
                  create:jest.fn(),
                  save:jest.fn(),
                  find:jest.fn(),
                  findOne:jest.fn(),
                  findOneBy:jest.fn(),
                  merge:jest.fn(),
                  delete:jest.fn()
           }
           caseRepositoryMock={
                findOne:jest.fn()
           }
           const module:TestingModule=await Test.createTestingModule({
                providers:[EvidenceService,
                  {provide:getRepositoryToken(Evidence),useValue:evidenceRepositoryMock},
                  {provide:getRepositoryToken(Case),useValue:caseRepositoryMock}
                ]
           }).compile()
           service=module.get<EvidenceService>(EvidenceService)
     })
     it('應該是有被定義的',()=>{
         expect(service).toBeDefined()
     })
     describe('建立新的 Evidence 證物',()=>{
          const input:CreateEvidenceInput={
                      caseNumber: 'A001',
                      evidenceNumber: 'E002',
                      evidenceType: '手機',
                      evidenceBrand: 'Apple',
                      evidenceSerialNo: 'SN999',
                      evidenceOriginalNo: 'TAG999',
                      photoFront: 'front.jpg',
                      photoBack: 'back.jpg',
                      receiveTime: '2025-07-18T11:00:00Z',
                      deliverySignature: '簽章A',
                      receiverSignature: '簽章B',
               }
         it('應該成功建立新的 Evidence',async()=>{
               caseRepositoryMock.findOne!.mockResolvedValue(caseData)
               evidenceRepositoryMock.create!.mockReturnValue({...input,caseId:1})
               evidenceRepositoryMock.save!.mockResolvedValue(newEvidence)
               evidenceRepositoryMock.findOne!.mockResolvedValue(newEvidence)
               const result=await service.createEvidence(input)
               expect(caseRepositoryMock.findOne).toHaveBeenCalledWith({ where: { caseNumber: 'A001' } })
               expect(evidenceRepositoryMock.create).toHaveBeenCalledWith({
                     ...input,
                     caseId:caseData.id
               })
               expect(evidenceRepositoryMock.save).toHaveBeenCalled()
               expect(result).toEqual(newEvidence)
         })
         it('找不到對應的 CaseNumber 時應該出現錯誤',async()=>{
               caseRepositoryMock.findOne!.mockResolvedValue(undefined)
               const input:CreateEvidenceInput={...evidenceArray[0],caseNumber:'A002'} as any
               await expect(service.createEvidence(input)).rejects.toThrow(NotFoundException)
         })
     })
     describe('測試查找所有的證物結果',()=>{
         it('應該是正常查詢到所有結果',async()=>{
               evidenceRepositoryMock.find!.mockResolvedValue(evidenceArray)
               const result=await service.findAllEvidence()
               expect(evidenceRepositoryMock.find).toHaveBeenCalledWith({relations:['case','examinResult']})
               expect(result).toMatchObject(evidenceArray)
               expect(result[0].examinResult).toBeDefined()
               expect(result[0].examinResult?.id).toBe(77)
               expect(result[0].pickup).toBeDefined()
               expect(result[0].pickup?.id).toBe(88)
               expect(result[0].case?.id).toBe(1)
         })
         it('查詢失敗應該拋出錯誤',async()=>{
               evidenceRepositoryMock.find!.mockRejectedValue(new Error('find error'))
               await expect(service.findAllEvidence()).rejects.toThrow('find error')
         })
     })
     describe('測試查找單一 Evidence 證物',()=>{
           it('應該找到單一 Evidence 證物',async()=>{
                evidenceRepositoryMock.findOne!.mockResolvedValue(evidenceArray[0])
                const result=await service.findOneEvidence(1)
                expect(evidenceRepositoryMock.findOne).toHaveBeenCalledWith({
                     where:{id:1},
                     relations:['case','examinResult']
                })
                expect(result).toMatchObject(evidenceArray[0])
           })
           it('應該顯示找不到單一 Evidence 證物',async()=>{
                evidenceRepositoryMock.findOne!.mockResolvedValue(undefined as any)
                await expect(service.findOneEvidence(99)).rejects.toThrow(NotFoundException)
           })
     })
     describe('測試更新單一 Evidence 證物',()=>{
         it('應該顯示成功更新',async()=>{
               const id=1
               const updateEvidenceInput:UpdateEvidenceInput={evidenceType:'這是更新後的證物類型'}
               const existing={...evidenceArray[0]}
               const merged={...existing,...updateEvidenceInput}
               evidenceRepositoryMock.findOneBy!.mockResolvedValue(existing)
               evidenceRepositoryMock.merge!.mockReturnValue(merged)
               evidenceRepositoryMock.save!.mockReturnValue(merged)
               evidenceRepositoryMock.findOne!.mockReturnValue(merged)

               const result=await service.updateEvidence(existing.id,updateEvidenceInput)
               expect(evidenceRepositoryMock.findOneBy).toHaveBeenCalledWith({id:existing.id})
               expect(evidenceRepositoryMock.merge).toHaveBeenCalledWith(existing,updateEvidenceInput)
               expect(evidenceRepositoryMock.save).toHaveBeenCalledWith(merged)
               expect(result.evidenceType).toEqual('這是更新後的證物類型')
         })
         it('應該顯示更新錯誤',async()=>{
               evidenceRepositoryMock.findOneBy!.mockReturnValueOnce(undefined as any)
               await expect(service.updateEvidence(99,{evidenceType:'這是更新後的證物類型'})).rejects.toThrow(NotFoundException)
         })
     })
     describe('測試刪除是否正常',()=>{
         it('應該成功刪除',async()=>{
               evidenceRepositoryMock.delete!.mockResolvedValue({affected:1})
               const result=await service.removeEvidence(1)
               expect(evidenceRepositoryMock.delete).toHaveBeenCalledWith(1)
               expect(result).toBe(true)
         })
         it('未刪除任何資料回應錯誤',async()=>{
               evidenceRepositoryMock.delete!.mockResolvedValue({affected:0})
               const result=await service.removeEvidence(1)
               expect(result).toBe(false)
         })
     })
})


