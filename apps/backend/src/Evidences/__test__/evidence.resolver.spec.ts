import { Test,TestingModule } from "@nestjs/testing";
import { NotFoundException } from "@nestjs/common";
import { Evidence } from "../evidence.entity";
import { Case } from "../../Case/case.entity";
import { ExaminResult } from "../../ExaminResult/examin_result.entity";
import { PickUp } from "../../Pickup/pickup.entity";
import { EvidenceService } from "../evidence.service";
import { EvidenceResolver } from "../evidence.resolver";
import { CreateEvidenceInput,UpdateEvidenceInput } from "../dto/evidence.inputs";
import { EventListenerTypes } from "typeorm/metadata/types/EventListenerTypes";

// 型別安全的 MockType
type MockType<T> = {
  [P in keyof T]?: jest.Mock<any,any[]>;
};




describe('開始測試 Evidence Resolver',()=>{
       let resolver: EvidenceResolver;
       let evidenceService:MockType<EvidenceService>
       const mockCase: Case = {
              id: 99,
              caseNumber: 'C999',
              section: '刑事股',
              year: 2025,
              prefixLetter: 'C',
              caseType: '毒品',
              caseName: '案件名稱',
              submitUnit: '刑事股',
              submitterName: '小王',
              submitterPhone: '0912000000',
              submitterTel: '02-2222222',
              submitterSignature: '簽章',
              createdAt: '2025-07-17T00:00:00Z',
              evidences: [],
       };
       const mockExaminResult: ExaminResult = {
              id: 77,
              evidence_id: 1,
              is_rejected: false,
              is_beyond_scope: false,
              is_lab_related: false,
              is_info_complete: true,
              examiner_name: '李警官',
              remarks: 'OK',
              created_at: '2025-07-18T11:00:00Z',
              updated_at: '2025-07-18T11:00:00Z',
              evidences: undefined,
       } as ExaminResult;
       const mockPickup: PickUp = {
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
       const mockEvidence: Evidence = {
              id: 1,
              caseId: 1,
              evidenceNumber: 'E001',
              evidenceType: '手機',
              evidenceBrand: 'Apple',
              evidenceSerialNo: 'SN123',
              evidenceOriginalNo: 'TAG123',
              photoFront: 'front.jpg',
              photoBack: 'back.jpg',
              receiveTime: '2025-07-18T10:00:00Z',
              deliverySignature: '交付簽章',
              receiverSignature: '收件簽章',
              createdAt: '2025-07-18T10:00:00Z',
              case: mockCase,
              examinResult: mockExaminResult,
              pickup: mockPickup,
       } as Evidence;
       const mockEvidenceList:Evidence[]=[mockEvidence]
       const createInput:CreateEvidenceInput={
                  caseNumber: 'A001',
                  evidenceNumber: 'E002',
                  evidenceType: '手機',
                  evidenceBrand: 'Samsung',
                  evidenceSerialNo: 'SN888',
                  evidenceOriginalNo: 'TAG888',
                  photoFront: 'front2.jpg',
                  photoBack: 'back2.jpg',
                  receiveTime: '2025-07-18T12:00:00Z',
                  deliverySignature: '簽章A',
                 receiverSignature: '簽章B',
       }
       const createdEvidence={...mockEvidence,...createInput,id:2}
       beforeEach(async()=>{
              // 初始化 mock service
              evidenceService={
                     findAllEvidence:jest.fn().mockResolvedValue(mockEvidenceList),
                     findOneEvidence:jest.fn().mockImplementation((id:number)=>{
                             if(mockEvidence.id===id){
                                   return Promise.resolve(mockEvidence)
                             }else{
                                   return Promise.reject(new NotFoundException(`Evidence with id ${id} not found`))
                             }
                     }),
                     createEvidence:jest.fn().mockResolvedValue(createdEvidence),
                     updateEvidence:jest.fn().mockImplementation((id:number,input:UpdateEvidenceInput)=>{
                            if(mockEvidence.id===id){
                                   return Promise.resolve({...mockEvidence,...input})
                            }else{
                                   return Promise.reject(new NotFoundException(`更新後查無 ID 為 ${id} 的證物。`))
                            }
                     }),
                     removeEvidence:jest.fn().mockImplementation((id:number)=>{
                            if(mockEvidence.id===id){
                                    return Promise.resolve(true)
                            }else{
                                    return Promise.resolve(false)
                            }
                     })
              }
         const module:TestingModule=await Test.createTestingModule({
              providers:[EvidenceResolver,{provide:EvidenceService,useValue:evidenceService}]
          }).compile()
          resolver=module.get<EvidenceResolver>(EvidenceResolver)
       })
       it('CaseResolver 應該要被定義的', () => {
         expect(resolver).toBeDefined();
       });
       // 測試回傳所有結果
       describe('測試回傳全部結果',()=>{
              it('應該測試正常',async()=>{
              const result=await resolver.findAll()
              expect(evidenceService.findAllEvidence).toHaveBeenCalled()
              expect(result).toEqual(mockEvidenceList)
              expect(result[0].examinResult).toBeDefined();
              expect(result[0].examinResult?.id).toBe(77);
              expect(result[0].pickup).toBeDefined();
              expect(result[0].pickup?.id).toBe(88);
          })      
       })
       // 測試回傳單一結果
       describe('測試回傳單一結果',()=>{
              it('應該正常顯示',async()=>{
                    const result=await resolver.findOne(mockEvidence.id)
                    expect(evidenceService.findOneEvidence).toHaveBeenCalled()
                    expect(evidenceService.findOneEvidence).toHaveBeenCalledWith(mockEvidence.id)
                    expect(result).toEqual(mockEvidence)
              })
              it('找不到結果而拋出錯誤',async()=>{
                       await expect(resolver.findOne(99)).rejects.toThrow(NotFoundException)
              })
       })
       // 測試新增證物
       describe('測試新增證物',()=>{
              it('應該顯示成功新增',async()=>{
                     const result=await resolver.createEvidence(createInput)
                     expect(evidenceService.createEvidence).toHaveBeenCalledWith(createInput)
                     expect(result).toEqual(createdEvidence)
              })
       })
       // 測試更新證物
       describe('測試更新證物',()=>{
              const updateInput: UpdateEvidenceInput = { evidenceBrand: '新的廠牌名稱' };
            it('應該要顯示成功更新',async()=>{
               
                 const result=await resolver.updateEvidence(updateInput,mockEvidence.id)
                 expect(evidenceService.updateEvidence).toHaveBeenCalledWith(mockEvidence.id,updateInput)
                 expect(result.evidenceBrand).toBe('新的廠牌名稱')
            })
            it('應該要顯示更新失敗',async()=>{
                await expect(resolver.updateEvidence({},999)).rejects.toThrow(NotFoundException)
                expect(evidenceService.updateEvidence).toHaveBeenCalledWith(999,{})
            })
       })
       // 測試刪除證物
       describe('測試刪除證物',()=>{
              it('應該正常',async()=>{
                     const id=1
                     const result=await resolver.removeEvidence(id)
                     expect(evidenceService.removeEvidence).toHaveBeenCalledWith(1)
                     expect(result).toBe(true)
              })
              it('應該要顯示刪除失敗',async()=>{
                     const result=await resolver.removeEvidence(999)
                     expect(result).toBe(false)
              })
       })
})