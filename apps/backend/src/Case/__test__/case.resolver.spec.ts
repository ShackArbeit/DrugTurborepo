import { Test, TestingModule } from "@nestjs/testing";
import { NotFoundException, ExecutionContext } from "@nestjs/common";
import { CreateCaseInput, UpdateCaseInput } from "../dto/case.inputs";
import { Case } from "../case.entity";
import { CaseResolver } from "../case.resolver";
import { CaseService } from "../case.service";
import { EvidenceService } from "../../Evidences/evidence.service";
import { GqlAuthGuard } from "../../Auth/gql-auth.guard";
import { RolesGuard } from "../../Auth/role/roles.guard";

const mockGqlAuthGuard = {
  canActivate: jest.fn((context: ExecutionContext) => true),
};

const mockRolesGuard = {
  canActivate: jest.fn((context: ExecutionContext) => true),
};

type MockType<T> = {
  [P in keyof T]?: jest.Mock<any, any[]>;
};

describe("開始測試 Case Resolver", () => {
  let resolver: CaseResolver;
  let caseService: MockType<CaseService>;
  let evidenceService: MockType<EvidenceService>;

  const existingCase: Case = {
    id: 1,
    caseNumber: "A001",
    section: "刑事一股",
    year: 2025,
    prefixLetter: "A",
    caseType: "毒品",
    caseName: "測試案件",
    submitUnit: "刑事股",
    submitterName: "王小明",
    submitterPhone: "0912345678",
    submitterTel: "02-1111111",
    Creator_Name: "Shack",
    createdAt: "2025-07-17T00:00:00Z",
    satisfaction_levelOne:'滿意',
    satisfaction_levelTwo:'滿意',
    satisfaction_levelThree:'滿意',
    satisfaction_levelFour:'滿意',
    evidences: [],
  } as Case;

  const caseList: Case[] = [existingCase];

  const createInput: CreateCaseInput = {
    caseNumber: "A002",
    section: "刑事二股",
    year: 2025,
    prefixLetter: "B",
    caseType: "竊盜",
    caseName: "新增案件",
    submitUnit: "刑事股",
    submitterName: "李小華",
    submitterPhone: "0922333444",
    submitterTel: "02-2222222",
    Creator_Name: "Shack",
    satisfaction_levelOne:'滿意',
    satisfaction_levelTwo:'滿意',
    satisfaction_levelThree:'滿意',
    satisfaction_levelFour:'滿意',
    createdAt: "2025-07-18T00:00:00Z",
  };

  const createdCase: Case = { ...createInput, id: 2, evidences: [] } as Case;

  const updateInput: UpdateCaseInput = {
    caseName: "新增修改的案件名稱",
  };

  const updatedCase: Case = {
    ...existingCase,
    caseName: "新增修改的案件名稱",
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    caseService = {
      createCase: jest.fn().mockResolvedValue(createdCase),
      findAll: jest.fn().mockResolvedValue(caseList),
      findOne: jest.fn().mockImplementation((id: number) => {
        if (id === existingCase.id) {
          return Promise.resolve(existingCase);
        }
        return Promise.reject(new NotFoundException(`Case with id ${id} not found`));
      }),
      update: jest.fn().mockImplementation((id: number, input: UpdateCaseInput) => {
        if (id === existingCase.id) {
          return Promise.resolve(updatedCase);
        }
        return Promise.reject(new NotFoundException(`ID 為 ${id} 的案件不存在，無法更新。`));
      }),
      remove: jest.fn().mockImplementation((id: number) => {
        if (id === existingCase.id) return Promise.resolve(true);
        return Promise.resolve(false);
      }),
    };

    // 這裡不需要真的用到，但必須提供同一個 DI token，避免 Nest 解析失敗
    evidenceService = {
      // 如果你的 Resolver 內有呼叫其它方法，再補 mock：
      // findByCaseId: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CaseResolver,
        { provide: CaseService, useValue: caseService },
        { provide: EvidenceService, useValue: evidenceService }, // ★ 關鍵：補上 EvidenceService provider
        { provide: GqlAuthGuard, useValue: mockGqlAuthGuard },
        { provide: RolesGuard, useValue: mockRolesGuard },
      ],
    }).compile();

    resolver = module.get<CaseResolver>(CaseResolver);
  });

  it("CaseResolver 應該要被定義的", () => {
    expect(resolver).toBeDefined();
  });

  describe("測試查詢全部", () => {
    it("應該正常回傳所有的結果", async () => {
      const result = await resolver.findAll();
      expect(caseService.findAll).toHaveBeenCalled();
      expect(result).toEqual(caseList);
    });
  });

  describe("測試回傳單一是正常的", () => {
    it("應該正常回傳單一結果", async () => {
      const result = await resolver.findOne(existingCase.id);
      expect(caseService.findOne).toHaveBeenCalledWith(existingCase.id);
      expect(result).toEqual(existingCase);
    });

    it("找不到結果而拋出錯誤", async () => {
      await expect(resolver.findOne(99)).rejects.toThrow(NotFoundException);
      expect(caseService.findOne).toHaveBeenCalledWith(99);
    });
  });

  describe("測試新增案件", () => {
    it("應該要回傳新增成功的結果", async () => {
      const result = await resolver.createCase(createInput);
      expect(caseService.createCase).toHaveBeenCalledWith(createInput);
      expect(result).toEqual(createdCase);
    });
  });

  describe("測試更新案件", () => {
    it("應該要顯示更新成功", async () => {
      const result = await resolver.updateCase(existingCase.id, updateInput);
      expect(caseService.update).toHaveBeenCalledWith(existingCase.id, updateInput);
      expect(result).toEqual(updatedCase);
    });

    it("應該要顯示更新失敗的訊息", async () => {
      await expect(resolver.updateCase(999, updateInput)).rejects.toThrow(NotFoundException);
      expect(caseService.update).toHaveBeenCalledWith(999, updateInput);
    });
  });

  describe("測試移除是否正常", () => {
    it("應該顯示刪除成功", async () => {
      const result = await resolver.removeCase(existingCase.id);
      expect(caseService.remove).toHaveBeenCalledWith(existingCase.id);
      expect(result).toBe(true);
    });

    it("應該要顯示刪除失敗", async () => {
      const result = await resolver.removeCase(999);
      expect(caseService.remove).toHaveBeenCalledWith(999);
      expect(result).toBe(false);
    });
  });
});
