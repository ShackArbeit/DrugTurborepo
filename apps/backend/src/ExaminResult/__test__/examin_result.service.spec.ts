import { Test,TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { NotFoundException,BadRequestException } from "@nestjs/common";
import { ExaminResult } from "../examin_result.entity";
import { Evidence } from "../../Evidences/evidence.entity";
import { ExaminResultService } from "../examin_result.service";
import { CreateExaminResultsInput,UpdateExaminResultsInput } from "../dto/examin-result.inputs";



// 前置模擬資料
type MockType<T> = {
  [P in keyof T]?: jest.Mock<any,any[]>;
}

const evidenceData:Evidence={
       id:1,
       caseId: 1,
       evidenceNumber:'E001',
       evidenceType:'手機',
       evidenceBrand:'蘋果',
       evidenceSerialNo:'EXU-201',
       evidenceOriginalNo:'20250730',
       photoFront:'Front.jpg',
       photoBack:'Back.jpg',
       receiveTime:'2025-07-18T10:00:00Z',
       deliverySignature:'張三簽名',
       receiverSignature:'李四簽名',
       createdAt:'2025-07-30T10:00:00Z',
       case:undefined
} as unknown as Evidence

const examinResult:ExaminResult={
      id:10,
      evidence_id:1,
      is_rejected: false,
      is_beyond_scope: false,
      is_lab_related: false,
      is_info_complete: true,
      examiner_name: '王警官',
      remarks: '測試成功',
      created_at: '2025-07-18T10:00:00Z',
      updated_at: '2025-07-18T12:00:00Z',
      evidences:evidenceData
} as unknown as ExaminResult

describe('開始測試 Examin_Result_Service',()=>{
      let service:ExaminResultService
      let resultRepositoryMock:MockType<Repository<ExaminResult>>
      let evidenceRepositoryMock:MockType<Repository<Evidence>>
      beforeEach(async()=>{
          resultRepositoryMock={
               create:jest.fn(),
               save:jest.fn(),
               find:jest.fn(),
               findOne:jest.fn(),
               findOneBy:jest.fn(),
               merge:jest.fn(),
               delete:jest.fn()
          }
          evidenceRepositoryMock={
              findOne:jest.fn()
          }
          const module:TestingModule = await Test.createTestingModule({
               providers:[ExaminResultService,
                  {provide:getRepositoryToken(ExaminResult),useValue:resultRepositoryMock},
                  {provide:getRepositoryToken(Evidence),useValue:evidenceRepositoryMock}
               ]
          }).compile()
          service = module.get<ExaminResultService>(ExaminResultService)
      })
      it('應該是有被定義的',()=>{
            expect(service).toBeDefined()
      })
      describe('測試建立新的鑑識結果',()=>{
            it('應該成功建立鑑識結果',async()=>{
            const input: CreateExaminResultsInput={
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
            evidenceRepositoryMock.findOne!.mockResolvedValue(evidenceData)
            resultRepositoryMock.findOne!
            .mockResolvedValueOnce(undefined) 
            .mockResolvedValueOnce(examinResult); 
            resultRepositoryMock.create!.mockReturnValue({...input,evidence_id: evidenceData.id})
            resultRepositoryMock.save!.mockResolvedValue(examinResult)

            const result=await service.createResult(input)

            expect(evidenceRepositoryMock.findOne).toHaveBeenCalledWith({where: { evidenceNumber: 'E001' }})
            expect(resultRepositoryMock.create).toHaveBeenCalledWith({
            ...input,
            evidence_id:evidenceData.id
            })
            expect(resultRepositoryMock.save).toHaveBeenCalled()
            expect(result).toEqual(examinResult)
         })
         it('找不到證物時應拋出 NotFoundException',async()=>{
               evidenceRepositoryMock.findOne!.mockReturnValue(undefined)
               const input ={...examinResult,evidenceNumber:'E001'} as any;
               await expect(service.createResult(input)).rejects.toThrow(NotFoundException)
         })
         it('已存在結果時應拋出 BadRequestException',async()=>{
               evidenceRepositoryMock.findOne!.mockResolvedValue(evidenceData)
               resultRepositoryMock.findOne!.mockResolvedValue(examinResult)
               const input={...examinResult,evidenceNumber:'E001'} as any
               await expect(service.createResult(input)).rejects.toThrow(BadRequestException)
         })
      })
      describe('測試更新鑑識結果',()=>{
            it('應該是可以成功更新',async()=>{
                   const updateResult:UpdateExaminResultsInput={examiner_name: '王警官2'}
                   const existing={...examinResult}
                   const merged={...existing,...updateResult}
                   resultRepositoryMock.findOneBy!.mockResolvedValue(existing)
                   resultRepositoryMock.merge!.mockReturnValue(merged)
                   resultRepositoryMock.save!.mockReturnValue(merged)
                   resultRepositoryMock.findOne!.mockReturnValue(merged)
                   const result= await service.updateResult(existing.id,updateResult)
                   expect(resultRepositoryMock.findOneBy).toHaveBeenCalledWith({id:existing.id})
                   expect(resultRepositoryMock.merge).toHaveBeenCalledWith(existing,updateResult)
                   expect(resultRepositoryMock.save).toHaveBeenCalledWith(merged)
                   expect(result.examiner_name).toBe('王警官2')
            })
            it('找不到 ID 所以無法更新',async()=>{
                    resultRepositoryMock.findOneBy!.mockReturnValue(undefined as any)
                    await expect(service.updateResult(99,{examiner_name: '王警官2'})).rejects.toThrow(NotFoundException)
            })
      })
      describe('測試返回所有的鑑識結果',()=>{
            it('應該可以成功返回所有結果',async()=>{
                   resultRepositoryMock.find!.mockResolvedValue(examinResult)
                   const result= await service.findAllResult()
                   expect(resultRepositoryMock.find).toHaveBeenCalledWith({relations:['evidences']})
                   expect(result).toMatchObject(examinResult)
            })
            it('應該查詢失敗',async()=>{
                    resultRepositoryMock.find!.mockRejectedValue(new Error('find error'))
                    await expect(service.findAllResult()).rejects.toThrow('find error')
            })
      })
      describe('測試返回單一的鑑識結果', ()=>{
            it('應該有找到結果',async()=>{
                  resultRepositoryMock.findOne!.mockResolvedValue(examinResult)
                  const result= await service.findOneResult(10)
                  expect(resultRepositoryMock.findOne).toHaveBeenCalledWith({
                        where:{id:10},
                        relations:['evidences']
                  })
                  expect(result).toMatchObject(examinResult)
            })
              
      })
      describe('測試刪除鑑識結果',()=>{
            it('應該刪除成功',async()=>{
                    resultRepositoryMock.delete!.mockResolvedValue({affected:1})
                    const result = await service.remove(1)
                    expect(resultRepositoryMock.delete).toHaveBeenCalledWith(1)
                    expect(result).toBe(true)
            })
            it('應該刪除失敗',async()=>{
                    resultRepositoryMock.delete!.mockResolvedValue({affected:0})
                    const result = await service.remove(1)
                    expect(result).toBe(false)
            })
      })
})