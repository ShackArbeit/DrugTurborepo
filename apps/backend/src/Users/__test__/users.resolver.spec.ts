// src/Users/__tests__/users.resolver.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';

import { UsersResolver } from '../users.resolver';
import { UsersService } from '../users.service';
import { User } from '../user.entity';
import { RegisterUserInput } from '../dto/register-user.input';
import { Role } from '../../Auth/role/role.enum';
import { GqlAuthGuard } from '../../Auth/gql-auth.guard';
import { RolesGuard } from '../../Auth/role/roles.guard';

type MockType<T> = {
  [P in keyof T]?: jest.Mock<any, any[]>;
};

const mockGqlAuthGuard = {
  canActivate: jest.fn((context: ExecutionContext) => true),
};
const mockRolesGuard = {
  canActivate: jest.fn((context: ExecutionContext) => true),
};

describe('UsersResolver 測試', () => {
  let resolver: UsersResolver;
  let service: MockType<UsersService>;

  const fakeUser: User = {
    id: 1,
    username: 'admin',
    password: 'hashed_password',
    email: 'admin@office.gov.tw',
    role: Role.Admin,
    resetPasswordToken:'',
    resetPasswordExpires:null,
  };

  beforeEach(async () => {
    service = {
      createUser: jest.fn().mockResolvedValue(fakeUser),
      findById: jest.fn().mockResolvedValue(fakeUser),
      findAllUsers: jest.fn().mockResolvedValue([fakeUser]),
      removerUser: jest.fn().mockResolvedValue(true),
      findByEmail: jest.fn().mockResolvedValue(fakeUser),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersResolver,
        { provide: UsersService, useValue: service },
        { provide: GqlAuthGuard, useValue: mockGqlAuthGuard },
        { provide: RolesGuard, useValue: mockRolesGuard },
      ],
    }).compile();

    resolver = module.get<UsersResolver>(UsersResolver);
  });

  it('Resolver 應被定義', () => {
    expect(resolver).toBeDefined();
  });

  describe('registerUser', () => {
    it('應可正常註冊（回傳新建使用者）', async () => {
      const input: RegisterUserInput = {
        username: 'admin',
        password: '123456',
        email: 'admin@office.gov.tw',
      };
      const result = await resolver.registerUser(input);
      expect(service.createUser).toHaveBeenCalledWith(input);
      expect(result).toEqual(fakeUser);
    });
  });

  describe('getCurrentUser (me)', () => {
    it('應可取得當前登入使用者', async () => {
      const ctx = { req: { user: { id: 1 } } };
      const result = await resolver.getCurrentUser(ctx as any);
      expect(service.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual(fakeUser);
    });
  });

  describe('findAllUsers (Admin)', () => {
    it('應可取得所有使用者（假 guard 直接放行）', async () => {
      const result = await resolver.findAllUsers();
      expect(service.findAllUsers).toHaveBeenCalled();
      expect(result).toEqual([fakeUser]);
    });
  });

  describe('findUserById (Admin)', () => {
    it('應可依 ID 取得使用者', async () => {
      const result = await resolver.findUserById(1);
      expect(service.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual(fakeUser);
    });
  });

  describe('findUserByEmail (Admin)', () => {
    it('應可依 Email 取得使用者', async () => {
      const result = await resolver.findUserByEmail('admin@office.gov.tw');
      expect(service.findByEmail).toHaveBeenCalledWith('admin@office.gov.tw');
      expect(result).toEqual(fakeUser);
    });
  });

  describe('removeUser (Admin)', () => {
    it('應可刪除使用者', async () => {
      const result = await resolver.removeUser(1);
      expect(service.removerUser).toHaveBeenCalledWith(1);
      expect(result).toBe(true);
    });
  });
});
