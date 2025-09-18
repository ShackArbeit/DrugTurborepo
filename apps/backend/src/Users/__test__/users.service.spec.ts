// src/Users/__tests__/users.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { UsersService } from '../users.service';
import { User } from '../user.entity';
import { Role } from '../../Auth/role/role.enum';
import { RegisterUserInput } from '../dto/register-user.input';

type MockType<T> = {
  [P in keyof T]?: jest.Mock<any, any[]>;
};

// ---- Mocks ----
jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password'),
}));

const mockUsers: User[] = [
  {
    id: 1,
    username: 'Shack',
    password: 'hashed_password',
    email: 'shack@example.com',
    role: Role.User,
    resetPasswordToken:'',
    resetPasswordExpires:null,
  },
  {
    id: 2,
    username: 'John',
    password: 'hashed_password',
    email: 'john@example.com',
    role: Role.User,
    resetPasswordToken:'',
    resetPasswordExpires:null,
  },
];

describe('UsersService 測試', () => {
  let service: UsersService;
  let repo: MockType<Repository<User>>;

  beforeEach(async () => {
    repo = {
      create: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      find: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: repo },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('Service 應被定義', () => {
    expect(service).toBeDefined();
  });

  describe('createUser（一般使用者）', () => {
    const input: RegisterUserInput = {
      username: 'Alice',
      password: 'alice123456',
      email: 'Alice@Example.com', // 大小寫混合，Service 會轉小寫
    };

    it('應可正常新增（username 與 email 都不重複）', async () => {
      // 1) 查 username：無
      repo.findOne!.mockResolvedValueOnce(null);
      // 2) 查 email（正規化小寫後）：無
      repo.findOne!.mockResolvedValueOnce(null);

      // 建立與儲存回傳
      repo.create!.mockReturnValue({
        username: input.username.trim(),
        password: 'hashed_password',
        email: input.email.trim().toLowerCase(),
        role: Role.User,
      });
      repo.save!.mockResolvedValue({
        id: 10,
        username: 'Alice',
        password: 'hashed_password',
        email: 'alice@example.com',
        role: Role.User,
      });

      const result = await service.createUser(input);

      // 第一次 findOne 檢查 username
      expect(repo.findOne).toHaveBeenNthCalledWith(1, {
        where: { username: 'Alice' },
      });

      // 第二次 findOne 檢查 email（以 LOWER 比對；這裡無法精準比對 Raw 物件內容，驗證次序即可）
      expect(repo.findOne).toHaveBeenNthCalledWith(2, expect.any(Object));

      expect(repo.save).toHaveBeenCalled();
      expect(result).toMatchObject({
        id: 10,
        username: 'Alice',
        email: 'alice@example.com',
        role: Role.User,
      });
    });

    it('若 username 已存在應拋 ConflictException', async () => {
      // 1) 查 username：已存在
      repo.findOne!.mockResolvedValueOnce(mockUsers[0]);

      await expect(service.createUser(input)).rejects.toThrow(ConflictException);
      expect(repo.findOne).toHaveBeenCalledWith({
        where: { username: 'Alice' },
      });
      // 第二次不會再查 email
    });

    it('username 不重複，但 email 已存在（大小寫不同）→ ConflictException', async () => {
      // 1) 查 username：無
      repo.findOne!.mockResolvedValueOnce(null);
      // 2) 查 email：回傳某既有 user（以 LOWER 比對）
      repo.findOne!.mockResolvedValueOnce(mockUsers[1]);

      await expect(service.createUser(input)).rejects.toThrow(ConflictException);

      // 兩次 findOne 都有執行
      expect(repo.findOne).toHaveBeenNthCalledWith(1, {
        where: { username: 'Alice' },
      });
      expect(repo.findOne).toHaveBeenNthCalledWith(2, expect.any(Object));
    });
  });

  describe('createUser（admin 唯一）', () => {
    const adminInput: RegisterUserInput = {
      username: 'admin',
      password: 'admin_secret',
      email: 'admin@office.gov.tw',
    };

    it('admin 不存在 → 可新增 admin；若系統已有 admin → ConflictException', async () => {
      // 情境 A：可成功新增 admin
      // 1) 查 username：無
      repo.findOne!.mockResolvedValueOnce(null);
      // 2) 查 email：無
      repo.findOne!.mockResolvedValueOnce(null);
      // 3) 查系統是否已有 Admin：無
      repo.findOne!.mockResolvedValueOnce(null);

      repo.create!.mockReturnValue({
        username: 'admin',
        password: 'hashed_password',
        email: 'admin@office.gov.tw',
        role: Role.Admin,
      });
      repo.save!.mockResolvedValue({
        id: 100,
        username: 'admin',
        password: 'hashed_password',
        email: 'admin@office.gov.tw',
        role: Role.Admin,
      });

      const created = await service.createUser(adminInput);
      expect(created).toMatchObject({
        id: 100,
        username: 'admin',
        email: 'admin@office.gov.tw',
        role: Role.Admin,
      });

      // 情境 B：系統已有 Admin 時應拋 Conflict
      // 重設 mock
      repo.findOne!.mockReset();
      // 1) 查 username：無
      repo.findOne!.mockResolvedValueOnce(null);
      // 2) 查 email：無
      repo.findOne!.mockResolvedValueOnce(null);
      // 3) 查系統是否已有 Admin：存在
      repo.findOne!.mockResolvedValueOnce({
        id: 999,
        username: 'root',
        password: 'hashed_password',
        email: 'root@office.gov.tw',
        role: Role.Admin,
      });

      await expect(service.createUser(adminInput)).rejects.toThrow(ConflictException);
      expect(repo.findOne).toHaveBeenNthCalledWith(3, { where: { role: Role.Admin } });
    });
  });

  describe('finders', () => {
    it('findAllUsers', async () => {
      repo.find!.mockResolvedValue(mockUsers);
      const list = await service.findAllUsers();
      expect(repo.find).toHaveBeenCalled();
      expect(list).toEqual(mockUsers);
    });

    it('findByUsername', async () => {
      repo.findOne!.mockResolvedValue(mockUsers[0]);
      const u = await service.findByUsername('Shack');
      expect(repo.findOne).toHaveBeenCalledWith({ where: { username: 'Shack' } });
      expect(u).toEqual(mockUsers[0]);
    });

    it('findById', async () => {
      repo.findOne!.mockResolvedValue(mockUsers[1]);
      const u = await service.findById(2);
      expect(repo.findOne).toHaveBeenCalledWith({ where: { id: 2 } });
      expect(u).toEqual(mockUsers[1]);
    });

    it('findByEmail（忽略大小寫）', async () => {
      repo.findOne!.mockResolvedValue(mockUsers[1]);
      const u = await service.findByEmail('JoHn@Example.com');
      // 具體檢查 Raw 內容較繁瑣，這裡驗證呼叫與回傳即可
      expect(repo.findOne).toHaveBeenCalledWith(expect.objectContaining({ where: expect.any(Object) }));
      expect(u).toEqual(mockUsers[1]);
    });
  });

  describe('removerUser', () => {
    it('刪除成功', async () => {
      repo.delete!.mockResolvedValue({ affected: 1 });
      const ok = await service.removerUser(1);
      expect(repo.delete).toHaveBeenCalledWith(1);
      expect(ok).toBe(true);
    });

    it('刪除不到 → NotFoundException', async () => {
      repo.delete!.mockResolvedValue({ affected: 0 });
      await expect(service.removerUser(99)).rejects.toThrow(NotFoundException);
    });
  });
});
