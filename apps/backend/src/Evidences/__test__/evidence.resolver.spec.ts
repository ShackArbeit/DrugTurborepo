import { Test, TestingModule } from "@nestjs/testing";
import { NotFoundException, ExecutionContext } from "@nestjs/common";
import { Evidence } from "../evidence.entity";
import { Case } from "../../Case/case.entity";;
import { EvidenceService } from "../evidence.service";
import { EvidenceResolver } from "../evidence.resolver";
import { CreateEvidenceInput, UpdateEvidenceInput } from "../dto/evidence.inputs";

// ✅ Mock 守衛通過
import { GqlAuthGuard } from "../../Auth/gql-auth.guard";
import { RolesGuard } from "../../Auth/role/roles.guard";

const mockGqlAuthGuard = {
  canActivate: jest.fn((context: ExecutionContext) => true),
};

const mockRolesGuard = {
  canActivate: jest.fn((context: ExecutionContext) => true),
};

// 型別安全的 MockType
type MockType<T> = {
  [P in keyof T]?: jest.Mock<any, any[]>;
};

describe("開始測試 Evidence Resolver", () => {
  let resolver: EvidenceResolver;
  let evidenceService: MockType<EvidenceService>;

  const mockCase: Case = {
    id: 99,
    caseNumber: "C999",
    section: "刑事股",
    year: 2025,
    prefixLetter: "C",
    caseType: "毒品",
    caseName: "案件名稱",
    submitUnit: "刑事股",
    submitterName: "小王",
    submitterPhone: "0912000000",
    submitterTel: "02-2222222",
    satisfaction_levelOne:'滿意',
    satisfaction_levelTwo:'滿意',
    satisfaction_levelThree:'滿意',
    satisfaction_levelFour:'滿意',
    createdAt: "2025-07-17T00:00:00Z",
    evidences: [],
  };

  const mockEvidence: Evidence = {
    id: 1,
    caseId: 1,
    evidenceNumber: "E001",
    evidenceType: "手機",
    evidenceBrand: "Apple",
    evidenceSerialNo: "SN123",
    evidenceOriginalNo: "TAG123",
    photoFront: "front.jpg",
    photoBack: "back.jpg",
    deliveryName: "交付簽章",
    receiverName: "收件簽章",
    photoFront2:'photo3.jpg',
    photoBack2:'photo4.jpg',
    is_rejected:true,
    is_beyond_scope:true,
    is_info_complete:true,
    deliveryName2:'簽章A2',
    receiverName2:'簽章B2',
    createdAt: "2025-07-18T10:00:00Z",
    case: mockCase,
   
  } as Evidence;

  const mockEvidenceList: Evidence[] = [mockEvidence];

  const createInput: CreateEvidenceInput = {
    caseNumber: "A001",
    evidenceNumber: "E002",
    evidenceType: "手機",
    evidenceBrand: "Samsung",
    evidenceSerialNo: "SN888",
    evidenceOriginalNo: "TAG888",
    photoFront: "front2.jpg",
    photoBack: "back2.jpg",
    deliveryName: "簽章A",
    receiverName: "簽章B",
     photoFront2:'photo3.jpg',
    photoBack2:'photo4.jpg',
    is_rejected:true,
    is_beyond_scope:true,
    is_info_complete:true,
    deliveryName2:'簽章A2',
    receiverName2:'簽章B2',
    is_Pickup:true,
    createdAt: '2025-08-14T10:00:00.000Z'
  };

  const createdEvidence = { ...mockEvidence, ...createInput, id: 2 };

  beforeEach(async () => {
    evidenceService = {
      findAllEvidence: jest.fn().mockResolvedValue(mockEvidenceList),
      findOneEvidence: jest.fn().mockImplementation((id: number) => {
        if (mockEvidence.id === id) {
          return Promise.resolve(mockEvidence);
        } else {
          return Promise.reject(new NotFoundException(`Evidence with id ${id} not found`));
        }
      }),
      createEvidence: jest.fn().mockResolvedValue(createdEvidence),
      updateEvidence: jest.fn().mockImplementation((id: number, input: UpdateEvidenceInput) => {
        if (mockEvidence.id === id) {
          return Promise.resolve({ ...mockEvidence, ...input });
        } else {
          return Promise.reject(new NotFoundException(`更新後查無 ID 為 ${id} 的證物。`));
        }
      }),
      removeEvidence: jest.fn().mockImplementation((id: number) => {
        if (mockEvidence.id === id) {
          return Promise.resolve(true);
        } else {
          return Promise.resolve(false);
        }
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EvidenceResolver,
        { provide: EvidenceService, useValue: evidenceService },
        { provide: GqlAuthGuard, useValue: mockGqlAuthGuard },
        { provide: RolesGuard, useValue: mockRolesGuard },
      ],
    }).compile();

    resolver = module.get<EvidenceResolver>(EvidenceResolver);
  });

  it("EvidenceResolver 應該要被定義的", () => {
    expect(resolver).toBeDefined()
  });

  describe("測試回傳全部結果", () => {
    it("應該測試正常", async () => {
      const result = await resolver.findAll();
      expect(evidenceService.findAllEvidence).toHaveBeenCalled();
      expect(result).toEqual(mockEvidenceList);
    });
  });

  describe("測試回傳單一結果", () => {
    it("應該正常顯示", async () => {
      const result = await resolver.findOne(mockEvidence.id);
      expect(evidenceService.findOneEvidence).toHaveBeenCalledWith(mockEvidence.id);
      expect(result).toEqual(mockEvidence);
    });

    it("找不到結果而拋出錯誤", async () => {
      await expect(resolver.findOne(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe("測試新增證物", () => {
    it("應該顯示成功新增", async () => {
      const result = await resolver.createEvidence(createInput);
      expect(evidenceService.createEvidence).toHaveBeenCalledWith(createInput);
      expect(result).toEqual(createdEvidence);
    });
  });

  describe("測試更新證物", () => {
    const updateInput: UpdateEvidenceInput = { evidenceBrand: "新的廠牌名稱" };

    it("應該要顯示成功更新", async () => {
      const result = await resolver.updateEvidence(updateInput, mockEvidence.id);
      expect(evidenceService.updateEvidence).toHaveBeenCalledWith(mockEvidence.id, updateInput);
      expect(result.evidenceBrand).toBe("新的廠牌名稱");
    });

    it("應該要顯示更新失敗", async () => {
      await expect(resolver.updateEvidence({}, 999)).rejects.toThrow(NotFoundException);
      expect(evidenceService.updateEvidence).toHaveBeenCalledWith(999, {});
    });
  });

  describe("測試刪除證物", () => {
    it("應該正常", async () => {
      const result = await resolver.removeEvidence(1);
      expect(evidenceService.removeEvidence).toHaveBeenCalledWith(1);
      expect(result).toBe(true);
    });

    it("應該要顯示刪除失敗", async () => {
      const result = await resolver.removeEvidence(999);
      expect(evidenceService.removeEvidence).toHaveBeenCalledWith(999);
      expect(result).toBe(false);
    });
  });
});
