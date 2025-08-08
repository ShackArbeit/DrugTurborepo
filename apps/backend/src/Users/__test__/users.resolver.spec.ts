import { Test,TestingModule } from "@nestjs/testing";
import { User } from "../user.entity";
import { UsersService } from "../users.service";
import { UsersResolver } from "../users.resolver";
import { RegisterUserInput } from "../dto/register-user.input";
import { Role } from "../../Auth/role/role.enum";
import { GqlAuthGuard } from "../../Auth/gql-auth.guard";
import { RolesGuard } from "../../Auth/role/roles.guard";
import { ExecutionContext } from '@nestjs/common';



type MockType<T> = {
  [P in keyof T]?: jest.Mock<any,any[]>;
};

const mockGqlAuthGuard={
      canActivate:jest.fn((context:ExecutionContext)=>true)
}
const mockRoleGurad={
      canActivate: jest.fn((context: ExecutionContext) => true)
}

describe('開始測試 User Resolver',()=>{
       let resolver:UsersResolver
       let userServiceMock:MockType<UsersService>

       jest.mock('bcryptjs',()=>({
        hash:jest.fn().mockResolvedValue('hashed_password')
       }))
      const fakeUser:User={
            id:1,
            username:'admin',
            password: 'hashed_password',
            role:Role.Admin
      }

      beforeEach(async()=>{
            userServiceMock={
                  createUser:jest.fn().mockResolvedValue(fakeUser),
                  findById:jest.fn().mockResolvedValue(fakeUser),
                  findAllUsers:jest.fn().mockResolvedValue([fakeUser]),
                  removerUser:jest.fn().mockResolvedValue(true)
            }
            const module: TestingModule = await Test.createTestingModule({
                  providers:[UsersResolver,
                    {provide:UsersService,useValue:userServiceMock},
                    {provide:GqlAuthGuard,useValue:mockGqlAuthGuard},
                    {provide:RolesGuard,useValue:mockRoleGurad}
                  ]
            }).compile()   
            resolver= module.get<UsersResolver>(UsersResolver)   
      })
      it('CaseResolver 應該要被定義的', () => {
            expect(resolver).toBeDefined();
      });
      describe('測試註冊新用戶',()=>{
            it('應該可以正常新增用戶',async()=>{
                  const input: RegisterUserInput = {
                  username: 'admin',
                  password: '123456',
              };
              const result = await resolver.registerUser(input)
              expect(userServiceMock.createUser).toHaveBeenCalledWith(input);
              expect(result).toEqual(fakeUser);
            })   
      })
      describe('測試取得當前登入的使用者',()=>{
            it('應該可以正常取得',async()=>{
                  const ctx = {req:{user:{id:1}}}
                  const result = await resolver.getCurrentUser(ctx)
                  expect(userServiceMock.findById).toHaveBeenCalledWith(1)
                  expect(result).toEqual(fakeUser)
            })
      })
      describe('測試取的所有使用者',()=>{
           it('應該可以正常取得',async()=>{
                  const result = await resolver.findAllUsers()
                  expect(userServiceMock.findAllUsers).toHaveBeenCalled()
                  expect(result).toEqual([fakeUser])
           })
      })
      describe('測試透過 ID 查詢特定使用者',()=>{
          it('應該可以正常查詢',async()=>{
              const result = await resolver.findUserById(1)
              expect(userServiceMock.findById).toHaveBeenCalledWith(1)
              expect(result).toEqual(fakeUser)
          })
      })
      describe('測試移除使用者',()=>{
             it('應該可以移除使用者', async () => {
                  const result = await resolver.removeUser(1);
                  expect(userServiceMock.removerUser).toHaveBeenCalledWith(1);
                  expect(result).toBe(true);
            });
      })


})