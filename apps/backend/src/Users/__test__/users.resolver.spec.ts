import { Test,TestingModule } from "@nestjs/testing";
import { NotFoundException } from "@nestjs/common";
import { User } from "../user.entity";
import { UsersService } from "../users.service";
import { UsersResolver } from "../users.resolver";
import { RegisterUserInput } from "../dto/register-user.input";
import { Role } from "../role.enum";

type MockType<T> = {
  [P in keyof T]?: jest.Mock<any,any[]>;
};

describe('開始測試 User Resolver',()=>{
       let resolver:UsersResolver
       let userService:MockType<UsersService>

       jest.mock('bcryptjs',()=>({
        hash:jest.fn().mockResolvedValue('hashed_password')
       }))

     
      const createInput:RegisterUserInput={
            username:'Shack',
            password:'wang8119'
      }
      const createUser={...createInput,id:2,password:'hashed_password',role: Role.User,} as User

      beforeEach(async()=>{
            userService={
                  createUser:jest.fn().mockResolvedValue(createUser)
            }
            const module: TestingModule = await Test.createTestingModule({
                  providers:[UsersResolver,{provide:UsersService,useValue:userService}]
            }).compile()   
            resolver= module.get<UsersResolver>(UsersResolver)   
      })
      it('CaseResolver 應該要被定義的', () => {
            expect(resolver).toBeDefined();
      });
      describe('測試註冊新用戶',()=>{
            it('應該可以正常新增用戶',async()=>{
                   const result = await resolver.createUser(createInput)
                  expect(userService.createUser).toHaveBeenCalledWith(createInput)
                  expect(result).toMatchObject({
                        id:2,
                        username:'Shack',
                        password:'hashed_password',
                        role:Role.User
                  })
            })
            
      })

})