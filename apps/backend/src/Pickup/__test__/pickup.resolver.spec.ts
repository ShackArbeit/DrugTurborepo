import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { PickupResolver } from '../pickup.resolver';
import { PickupService } from '../pickup.service';
import { PickUp } from '../pickup.entity';
import { Evidence } from '../../Evidences/evidence.entity';
import { CreatePickupInput, UpdatePickupInput } from '../dto/pickup.input';

type MockType<T> = {
  [P in keyof T]?: jest.Mock<any,any[]>;
}

describe('PickupResolver', () => {
  let resolver: PickupResolver;
  let service: MockType<PickupService>;

  const mockEvidence: Evidence = {
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
  } as unknown as Evidence;

  const mockPickup: PickUp = {
    id: 88,
    evidence_id: 1,
    evidences: mockEvidence,
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
  } as unknown as PickUp;

  const mockList: PickUp[] = [mockPickup];

  const createInput: CreatePickupInput = {
    evidence_number: 'E001',
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
  };

  const createdPickup: PickUp = { ...mockPickup, id: 99 };

  const updateInput: UpdatePickupInput = { remarks: '新備註' };
  const updatedPickup: PickUp = { ...mockPickup, ...updateInput };

  beforeEach(async () => {
    service = {
      findAllPickup: jest.fn().mockResolvedValue(mockList),
      findOnePickup: jest.fn().mockImplementation((id: number) => {
        if (id === mockPickup.id) return Promise.resolve(mockPickup);
        throw new NotFoundException(`Pickup with id ${id} not found`);
      }),
      createPick: jest.fn().mockResolvedValue(createdPickup),
      updatePick: jest.fn().mockImplementation((id: number, dto: UpdatePickupInput) => {
        if (id === mockPickup.id) return Promise.resolve({ ...mockPickup, ...dto });
        throw new NotFoundException(`ID 為 ${id} 的領回紀錄不存在`);
      }),
      removePick: jest.fn().mockImplementation((id: number) => {
        if (id === mockPickup.id) return Promise.resolve(true);
        return Promise.resolve(false);
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PickupResolver,
        { provide: PickupService, useValue: service },
      ],
    }).compile();

    resolver = module.get<PickupResolver>(PickupResolver);
  });

  describe('findAllPickupResult', () => {
    it('應回傳所有領回資料（含 evidences）', async () => {
      const result = await resolver.findAllPickupResult();
      expect(service.findAllPickup).toHaveBeenCalled();
      expect(result).toEqual(mockList);
      expect(result[0].evidences).toBeDefined();
    });

    it('服務層發生錯誤應拋出', async () => {
      (service.findAllPickup as jest.Mock).mockRejectedValue(new Error('db error'));
      await expect(resolver.findAllPickupResult()).rejects.toThrow('db error');
    });
  });

  describe('findOnePickupResult', () => {
    it('應回傳指定 id 領回資料（含 evidences）', async () => {
      const result = await resolver.findOnePickupResult(mockPickup.id);
      expect(service.findOnePickup).toHaveBeenCalledWith(mockPickup.id);
      expect(result).toEqual(mockPickup);
      expect(result.evidences).toBeDefined();
    });

    it('找不到時應拋出 NotFoundException', async () => {
      await expect(resolver.findOnePickupResult(999)).rejects.toThrow(NotFoundException);
      expect(service.findOnePickup).toHaveBeenCalledWith(999);
    });
  });

  describe('createPickup', () => {
    it('應回傳新增領回資料', async () => {
      const result = await resolver.createPickup(createInput);
      expect(service.createPick).toHaveBeenCalledWith(createInput);
      expect(result).toEqual(createdPickup);
    });

    it('服務層建立時拋錯應傳出', async () => {
      (service.createPick as jest.Mock).mockRejectedValue(new BadRequestException('已存在'));
      await expect(resolver.createPickup(createInput)).rejects.toThrow(BadRequestException);
    });
  });

  describe('updatePickup', () => {
    it('應回傳更新後領回資料', async () => {
      const result = await resolver.updatePickup(mockPickup.id, updateInput);
      expect(service.updatePick).toHaveBeenCalledWith(mockPickup.id, updateInput);
      expect(result.remarks).toBe('新備註');
    });

    it('更新不存在時應拋出 NotFoundException', async () => {
      await expect(resolver.updatePickup(999, updateInput)).rejects.toThrow(NotFoundException);
      expect(service.updatePick).toHaveBeenCalledWith(999, updateInput);
    });
  });

  describe('removePickup', () => {
    it('成功刪除回傳 true', async () => {
      const result = await resolver.removePickup(mockPickup.id);
      expect(service.removePick).toHaveBeenCalledWith(mockPickup.id);
      expect(result).toBe(true);
    });

    it('刪除不存在回傳 false', async () => {
      const result = await resolver.removePickup(999);
      expect(service.removePick).toHaveBeenCalledWith(999);
      expect(result).toBe(false);
    });
  });
});
