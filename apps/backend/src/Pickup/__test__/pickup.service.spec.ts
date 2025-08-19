import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { PickupService } from '../pickup.service';
import { PickUp } from '../pickup.entity';
import { Evidence } from '../../Evidences/evidence.entity';
import { CreatePickupInput, UpdatePickupInput } from '../dto/pickup.input';

type MockType<T> = {
  [P in keyof T]?: jest.Mock<any,any[]>;
};

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

describe('PickupService', () => {
  let service: PickupService;
  let pickupRepo: MockType<Repository<PickUp>>;
  let evidenceRepo: MockType<Repository<Evidence>>;

  beforeEach(async () => {
    pickupRepo = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      findOneBy: jest.fn(),
      merge: jest.fn(),
      delete: jest.fn(),
    };
    evidenceRepo = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PickupService,
        { provide: getRepositoryToken(PickUp), useValue: pickupRepo },
        { provide: getRepositoryToken(Evidence), useValue: evidenceRepo },
      ],
    }).compile();

    service = module.get<PickupService>(PickupService);
  });

  describe('createPick', () => {
    it('成功建立領回資料', async () => {
      const input: CreatePickupInput = {
        evidence_number: 'E001',
        pickup_time: '2025-07-18T12:00:00Z',
        photo_path: 'photo.jpg',
        satisfaction_levelOne: '非常滿意',
        satisfaction_levelTwo: '非常滿意',
        satisfaction_levelThree: '非常滿意',
        satisfaction_levelFour: '非常滿意',
        receiver_name: '張警員',
        delivery_Name: '交付簽章',
        receiver_Name: '領回簽章',
        remarks: '備註',
        created_at: '2025-07-18T12:00:00Z',
      };
      evidenceRepo.findOne!.mockResolvedValue(mockEvidence);
      pickupRepo.findOne!
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce(mockPickup);
      pickupRepo.create!.mockReturnValue({ ...input, evidence_id: mockEvidence.id });
      pickupRepo.save!.mockResolvedValue(mockPickup);
    

      const result = await service.createPick(input);
      expect(evidenceRepo.findOne).toHaveBeenCalledWith({ where: { evidenceNumber: 'E001' } });
      expect(pickupRepo.create).toHaveBeenCalledWith({ ...input, evidence_id: mockEvidence.id });
      expect(pickupRepo.save).toHaveBeenCalled();
      expect(result).toEqual(mockPickup);
    });

    it('找不到證物時應拋出 NotFoundException', async () => {
      evidenceRepo.findOne!.mockResolvedValue(undefined);
      const input = { ...mockPickup, evidence_number: 'XXX' } as any;
      await expect(service.createPick(input)).rejects.toThrow(NotFoundException);
    });

    it('已存在領回資料時應拋出 BadRequestException', async () => {
      evidenceRepo.findOne!.mockResolvedValue(mockEvidence);
      pickupRepo.findOne!.mockResolvedValue(mockPickup);
      const input = { ...mockPickup, evidence_number: 'E001' } as any;
      await expect(service.createPick(input)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAllPickup', () => {
    it('應回傳所有領回資料（含 evidences 關聯）', async () => {
      pickupRepo.find!.mockResolvedValue([mockPickup]);
      const res = await service.findAllPickup();
      expect(pickupRepo.find).toHaveBeenCalledWith({ relations: ['evidences'] });
      expect(res).toEqual([mockPickup]);
      expect(res[0].evidences).toBeDefined();

    });
  });

  describe('findOnePickup', () => {
    it('應回傳單一領回資料（含 evidences 關聯）', async () => {
      pickupRepo.findOne!.mockResolvedValue(mockPickup);
      const res = await service.findOnePickup(mockPickup.id);
      expect(pickupRepo.findOne).toHaveBeenCalledWith({
        where: { id: mockPickup.id },
        relations: ['evidences'],
      });
      expect(res).toEqual(mockPickup);
      expect(res.evidences).toBeDefined();
    });

    it('找不到時應拋出 NotFoundException', async () => {
      pickupRepo.findOne!.mockResolvedValue(undefined);
      await expect(service.findOnePickup(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updatePick', () => {
    it('成功更新領回資料', async () => {
      const updateInput: UpdatePickupInput = { remarks: '已補充說明' };
      pickupRepo.findOneBy!.mockResolvedValue(mockPickup);
      pickupRepo.merge!.mockReturnValue({ ...mockPickup, ...updateInput });
      pickupRepo.save!.mockResolvedValue({ ...mockPickup, ...updateInput });
      pickupRepo.findOne!.mockResolvedValue({ ...mockPickup, ...updateInput });

      const res = await service.updatePick(mockPickup.id, updateInput);
      expect(pickupRepo.findOneBy).toHaveBeenCalledWith({ id: mockPickup.id });
      expect(pickupRepo.merge).toHaveBeenCalledWith(mockPickup, updateInput);
      expect(pickupRepo.save).toHaveBeenCalledWith({ ...mockPickup, ...updateInput });
      expect(res.remarks).toBe('已補充說明');
    });

    it('找不到要更新的領回資料應拋出 NotFoundException', async () => {
      pickupRepo.findOneBy!.mockResolvedValue(undefined);
      await expect(service.updatePick(999, { remarks: 'X' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('removePick', () => {
    it('成功刪除回傳 true', async () => {
      pickupRepo.delete!.mockResolvedValue({ affected: 1 });
      const res = await service.removePick(mockPickup.id);
      expect(pickupRepo.delete).toHaveBeenCalledWith(mockPickup.id);
      expect(res).toBe(true);
    });

    it('刪除不存在回傳 false', async () => {
      pickupRepo.delete!.mockResolvedValue({ affected: 0 });
      const res = await service.removePick(999);
      expect(res).toBe(false);
    });
  });
});
