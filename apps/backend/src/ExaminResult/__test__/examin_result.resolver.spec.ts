import { Test,TestingModule } from "@nestjs/testing";
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { ExaminResult } from "../examin_result.entity";
import { Evidence } from "../../Evidences/evidence.entity";
import { ExaminResultService } from "../examin_result.service";
import { ExaminResultResolver } from "../examin_result.resolver";
import { CreateExaminResultsInput,UpdateExaminResultsInput } from "../dto/examin-result.inputs";
import { EventListenerTypes } from "typeorm/metadata/types/EventListenerTypes";

// 型別安全的 MockType
type MockType<T> = {
  [P in keyof T]?: jest.Mock<any,any[]>;
};

describe('開始測試 Examin_Result',()=>{
      let resolver:ExaminResultResolver;
      let resultService:MockType<ExaminResultService>
      const mockEvidence:Evidence={
            id: 1,
            caseId: 1,
            evidenceNumber: 'E001',
            evidenceType: '手機',
            evidenceBrand: 'Apple',
            evidenceSerialNo: 'SN001',
            evidenceOriginalNo: 'TAG001',
            photoFront: 'front.jpg',
            photoBack: 'back.jpg',
            receiveTime: '2025-07-18T10:00:00Z',
            deliverySignature: '交付簽章',
            receiverSignature: '收件簽章',
            createdAt: '2025-07-18T10:00:00Z',
            case: undefined,
            examinResult: undefined,
            pickup: undefined,
      } as unknown as Evidence
      
      const mockResult:ExaminResult={
            id: 10,
            evidence_id: 1,
            is_rejected: false,
            is_beyond_scope: false,
            is_lab_related: false,
            is_info_complete: true,
            examiner_name: '王警官',
            remarks: '測試成功',
            created_at: '2025-07-18T10:00:00Z',
            updated_at: '2025-07-18T12:00:00Z',
            evidences:mockEvidence,
      } as unknown as ExaminResult

      const mockList:ExaminResult[]=[mockResult]
      const createInput:CreateExaminResultsInput={
            evidenceNumber: 'E001',
            is_rejected: false,
            is_beyond_scope: false,
            is_lab_related: false,
            is_info_complete: true,
            examiner_name: '王警官',
            remarks: '測試成功',
            created_at: '2025-07-18T10:00:00Z',
            updated_at: '2025-07-18T12:00:00Z',
      }
      const createdResult={...mockResult,id:11}
      const updateInput:UpdateExaminResultsInput={remarks: '新備註' }
      const updatedResult:ExaminResult={...mockResult,...updateInput}
      
      beforeEach(async()=>{
             resultService={
                  findAllResult:jest.fn().mockResolvedValue(mockList),
                  findOneResult:jest.fn().mockImplementation((id:number)=>{
                        if(mockResult.id===id){
                              return Promise.resolve(mockResult)
                        }else{
                               return Promise.reject(new NotFoundException(`Result with id ${id} not found`))
                        }
                  }),
                  createResult:jest.fn().mockResolvedValue(createdResult),
                  updateResult:jest.fn().mockImplementation((id:number,input:UpdateExaminResultsInput)=>{
                        if(mockResult.id===id){
                              return Promise.resolve({...mockResult,...input})
                        }else{
                              return Promise.reject(new NotFoundException(`更新後查無 ID 為 ${id} 的結果。`))
                        }
                  }),
                  remove:jest.fn().mockImplementation((id:number)=>{
                         if(mockResult.id===id){
                              return Promise.resolve(true)
                         }else{
                               return Promise.resolve(false)
                         }
                  })
             }
             const module:TestingModule= await Test.createTestingModule({
              providers:[ExaminResultResolver,{provide:ExaminResultService,useValue:resultService}]
           }).compile()
           resolver=module.get<ExaminResultResolver>(ExaminResultResolver)
      })
      it('ExaminResolver 應該要被定義的', () => {
           expect(resolver).toBeDefined();
       });
      describe('測試回傳所有的結果',()=>{
             it('應該正常回傳',async()=>{
                  const result = await resolver.findAll()
                  expect(resultService.findAllResult).toHaveBeenCalled()
                  expect(result).toEqual(mockList)
             })
      })
      describe('測試回傳單一結果',()=>{
            it('應該正常回傳單一結果',async()=>{
                    const result = await resolver.findOne(mockResult.id)
                    expect(resultService.findOneResult).toHaveBeenCalled()
                    expect(resultService.findOneResult).toHaveBeenCalledWith(mockResult.id)
                    expect(result).toEqual(mockResult)
            })
            it('應該找不到結果而有錯誤',async()=>{
                  await expect(resolver.findOne(99)).rejects.toThrow(NotFoundException)
            })
      })
      describe('測試建立新的鑑識結果',()=>{
            it('應該顯示成功新增',async()=>{
                   const result = await resolver.createExaminResult(createInput)
                   expect(resultService.createResult).toHaveBeenCalledWith(createInput)
                   expect(result).toEqual(createdResult)
            })
      })
      describe('測試更新結果',()=>{
            it('應該要顯示更新成功',async()=>{
                   const result = await resolver.updateExaminResult(mockResult.id,updateInput)
                   expect(resultService.updateResult).toHaveBeenCalledWith(mockResult.id,updateInput)
                   expect(result.remarks).toBe('新備註')

            })
            it('應該顯示更新失敗',async()=>{
                   await expect(resolver.updateExaminResult(99,{})).rejects.toThrow(NotFoundException)
                   expect(resultService.updateResult).toHaveBeenCalledWith(99,{})
            })
      })
      describe('測試刪除結果',()=>{
             it('應該正常刪除',async()=>{
                  const id=10
                  const result = await resolver.removeExaminResult(id)
                  expect(resultService.remove).toHaveBeenCalledWith(10)
                  expect(result).toBe(true)
             })
             it('應該無法刪除',async()=>{
                    const result = await resolver.removeExaminResult(999)
                    expect(result).toBe(false)
             })
      })
     
})