import { Test,TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { NotFoundException } from "@nestjs/common";
import { Case } from "../case.entity";
import { CaseService } from "../case.service";
import { CreateCaseInput,UpdateCaseInput } from "../dto/case.inputs";

// 型別安全的 MockType
type MockType<T> = {
  [P in keyof T]?: jest.Mock<any,any[]>;
};

const mockCaseArray: Case[] = [
  {
    id: 1,
    caseNumber: 'A001',
    section: '燕股',
    year: 2025,
    prefixLetter: '偵字',
    caseType: '詐欺',
    caseName: '測試案件1',
    submitUnit: '廉政署',
    submitterName: '張三', 
    submitterPhone: '0905324765',
    submitterTel: '22467926',
    submitterSignature: '簽名1',
    createdAt: '2022-07-01',
    evidences: []
  } as Case,
  {
    id: 2,
    caseNumber: 'A002',
    section: '信股',
    year: 2024,
    prefixLetter: '他字',
    caseType: '貪汙',
    caseName: '測試案件2',
    submitUnit: '桃園地檢',
    submitterName: '李四', 
    submitterPhone: '0905324740',
    submitterTel: '22467946',
    submitterSignature: '簽名2',
    createdAt: '2022-08-01',
    evidences: []
  } as Case,
];

// mockNewCase 也可能需要補齊必填屬性，但目前範例中沒有使用到，先不改動
const mockNewCase: Case = {
  id: 3,
  caseNumber: 'A003',
  caseName: '新增案件',
  // 其他必填屬性也應該在這裡補齊，例如：
  section: '義股',
  year: 2025,
  prefixLetter: '偵字',
  caseType: '一般',
  submitUnit: '某單位',
  submitterName: '王五', 
  submitterPhone: '0912345678',
  createdAt: '2023-01-01',
  evidences: [],
} as Case;

describe('CaseService',()=>{
        let service:CaseService
        let caseRepositoryMock: MockType<Repository<Case>>;

        beforeEach(async()=>{
            caseRepositoryMock={
                create:jest.fn(),
                save:jest.fn(),
                find:jest.fn(),
                findOne:jest.fn(),
                findOneBy:jest.fn(),
                merge:jest.fn(),
                delete:jest.fn()
            }
            // 建立一個測試專用的 NestJS 模組，功能類似 @Module() 裝飾器
               const module: TestingModule = await Test.createTestingModule({
            // 接著在此測試模組內模擬 providers 的提供，這裡放入CustomerService並測試其邏輯
                  providers: [
                  CaseService,
            // 這裡的 provide 表示匯入 Case Entity 的匯入點
            // 這裡的 useValue 表示是使用 mock 的 function 模組 caseRepositoryMock
            // 而不是使用真實的 TypeORM 儲存庫實例
                  { provide: getRepositoryToken(Case), useValue: caseRepositoryMock },
                  ],
                }).compile();
            // 接著正式定義 service 變數是模擬的模組而非真實的 function 及資料庫
             service=module.get<CaseService>(CaseService)
        })
        it('應該是被有定義的',()=>{
            expect(service).toBeDefined()
        })
        // 測試 Create function 是否正常
        describe('createCase',()=>{
             const input: CreateCaseInput = {
                caseNumber: 'A003',
                section: '股',
                year: 2025,
                prefixLetter: 'A',
                caseType: '毒品',
                caseName: '新增案件',
                submitUnit: '單位',
                submitterName: '王小明',
                submitterPhone: '0912000000',
                submitterTel: '02-22222222',
                submitterSignature: '簽名',
                createdAt: '2025-07-17T00:00:00Z',
          };
              it('應該要成功建立新案件',async()=>{
                  caseRepositoryMock.create!.mockReturnValue(input)
                  caseRepositoryMock.save!.mockReturnValue(mockNewCase)
                  const result=await service.createCase(input)
                  expect(caseRepositoryMock.create).toHaveBeenCalledWith(input)
                  expect(caseRepositoryMock.save).toHaveBeenCalledWith(input)
                  expect(result).toMatchObject(mockNewCase)
              })
             it('建立失敗應拋出錯誤', async () => {
                const input = { ...mockNewCase } as CreateCaseInput;
                caseRepositoryMock.create!.mockReturnValue(input);
               caseRepositoryMock.save!.mockRejectedValue(new Error('save error'));
               await expect(service.createCase(input)).rejects.toThrow('save error');
        });
        // 測試 findAll
        describe('測試查找所有案件結果',()=>{
             it('應該返回所有案件(包含 Evidence)',async()=>{
                  caseRepositoryMock.find!.mockResolvedValue(mockCaseArray)
                  const result=await service.findAll()
                  expect(caseRepositoryMock.find).toHaveBeenCalledWith({ relations:['evidences']})
                  expect(result).toMatchObject(mockCaseArray)
             })
             it('查詢失敗應該拋出錯誤',async()=>{
                  caseRepositoryMock.find!.mockRejectedValue(new Error('find error'))
                  await expect(service.findAll()).rejects.toThrow('find error')
             })
        })
        // 測試 findOne
        describe('測試查找單一案件結果',()=>{
             it('應該可以找到特定的案件結果',async()=>{
                  caseRepositoryMock.findOne!.mockResolvedValue(mockCaseArray[0])
                  const result=await service.findOne(1)
                  expect(caseRepositoryMock.findOne).toHaveBeenCalledWith({
                         where:{id:1},
                          relations: ['evidences'],
                  })
                  expect(result).toMatchObject(mockCaseArray[0])
             })
             it('應該找不到特定案件結果',async()=>{
                   caseRepositoryMock.findOne!.mockResolvedValue(undefined as any);
                   await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
             })
        })
      })
})
