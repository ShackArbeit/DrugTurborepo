import { Test,TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { NotFoundException,ConflictException } from "@nestjs/common";
import { User } from "../user.entity";
import { Role } from "../../Auth/role/role.enum";
import { RegisterUserInput } from "../dto/register-user.input";
import { UsersService } from "../users.service";

type MockType<T> = {
  [P in keyof T]?: jest.Mock<any,any[]>;
};

const mockUser:User[]=[
      {
            id:1,
            username:'Shack',
            password:'wang8119',
            role:Role.User
      },
      {
            id:2,
            username:'John',
            password:'taichung2025',
            role:Role.User
      },
]

const adminInput:RegisterUserInput={
      username:'admin',
      password:'thpo123456789',
}

jest.mock('bcryptjs',()=>({
     hash:jest.fn().mockResolvedValue('hashed_password')
}))

describe('Userservice 的測試',()=>{
      let service:UsersService
      let userRepositoryMock:MockType<Repository<User>>

      beforeEach(async()=>{
             userRepositoryMock={
                   create:jest.fn(),
                   findOne:jest.fn(),
                   save:jest.fn(),
                   delete:jest.fn()
             }
             const module:TestingModule=await Test.createTestingModule({
                  providers:[
                        UsersService,
                        {provide:getRepositoryToken(User),useValue:userRepositoryMock}
                  ]
             }).compile()
             service=module.get<UsersService>(UsersService)
      })
      it('應該是被有定義的',()=>{
            expect(service).toBeDefined()
      })
      describe('測試預設管理者是否存在',()=>{
             it('若不存在預設管理者就會自動新增',async()=>{
                   userRepositoryMock.findOne!.mockResolvedValue(null)
                   userRepositoryMock.create!.mockReturnValue({
                        username:'admin',
                        password:'hashed_password',
                        role:undefined
                   })
                  userRepositoryMock.save!.mockResolvedValue({
                        id: 3,
                        username: 'admin',
                        password: 'hashed_password',
                        role: Role.Admin,
                  });
                  const result = await service.createUser(adminInput)
                  expect(userRepositoryMock.create).toHaveBeenCalledWith({
                        username: 'admin',
                        password: 'hashed_password',
                  });
                  expect(userRepositoryMock.save).toHaveBeenCalled();
                  expect(result).toMatchObject({
                         username:'admin',
                         password: 'hashed_password',
                  })
             })
             it('若預設管理者已經存在會出現錯誤訊息',async()=>{
                  const isAdminUser=mockUser.some(user=>user.role===Role.Admin)
                  if(isAdminUser){
                        userRepositoryMock.findOne!.mockResolvedValue(adminInput)
                        await expect(service.createUser(adminInput)).rejects.toThrow(ConflictException)
                        expect(userRepositoryMock.findOne).toHaveBeenCalledWith({
                               username:adminInput.username,password:adminInput.password
                        })
                  }
             })
      })
      describe('測試新建 User',()=>{
            const input:RegisterUserInput={
                        username:'Shack',
                        password:'wang8119'
                  }
            it('應該是可以正常新增 User',async()=>{
                   userRepositoryMock.findOne!.mockResolvedValue(null);
                   userRepositoryMock.create!.mockReturnValue({
                        ...input,
                        password:'hashed_password',
                        role:undefined
                   })
                   userRepositoryMock.save!.mockResolvedValue({
                         id:1,
                         username:input.username,
                         password:'hashed_password',
                         role:Role.User
                   })
                   const result = await service.createUser(input)
                   expect(userRepositoryMock.findOne).toHaveBeenCalledWith({
                         where:{username:input.username}
                   })
                   expect(userRepositoryMock.save).toHaveBeenCalled()
                   expect(result).toMatchObject({
                         id:1,
                         username:'Shack',
                         role:Role.User,
                         password:expect.any(String)
                   })
                  
            })
            it('應該在使用者名稱已存在時拋出 ConflictException',async()=>{
                 userRepositoryMock.findOne!.mockResolvedValue(mockUser[0])
                 await expect(service.createUser(input)).rejects.toThrow(ConflictException)
                 expect(userRepositoryMock.findOne).toHaveBeenCalledWith({
                  where: { username: input.username },
                });
            })
      })
      describe('測試使用使用者名稱查詢',()=>{
            it('應該可以正常找到',async()=>{
                  userRepositoryMock.findOne!.mockResolvedValue(mockUser[1])
                  const result = await service.findByUsername('Shack')
                  expect(userRepositoryMock.findOne).toHaveBeenCalledWith({
                        where:{username:'Shack'}
                  })
                  expect(result).toMatchObject(mockUser[1])
            })
             it('找不到 username，應回傳 null', async () => {
            userRepositoryMock.findOne!.mockResolvedValue(null);
            const result = await service.findByUsername('NonExist');
            expect(userRepositoryMock.findOne).toHaveBeenCalledWith({ where: { username: 'NonExist' } });
            expect(result).toBeNull();
         });
      })
      describe('測試使用 ID 查詢',()=>{
            it('應該可以正常查詢',async()=>{
                  userRepositoryMock.findOne!.mockResolvedValue(mockUser[1])
                  const result = await service.findById(2)
                  expect(userRepositoryMock.findOne).toHaveBeenCalledWith(
                         {where:{id:2}}
                  )
                  expect(result).toMatchObject(mockUser[1])
            })
             it('找不到該 id，應回傳 null', async () => {
                  userRepositoryMock.findOne!.mockResolvedValue(null);
                  const result = await service.findById(999);

                  expect(userRepositoryMock.findOne).toHaveBeenCalledWith({ where: { id: 999 } });
                  expect(result).toBeNull();
          });
      })
      describe('測試移除使用者帳號',()=>{
            it('應該要可以正常移除',async()=>{
                   userRepositoryMock.delete!.mockResolvedValue({ affected: 1 }); 
                  const result = await service.removerUser(1);
                  expect(userRepositoryMock.delete).toHaveBeenCalledWith(1);
                  expect(result).toBe(true);
            })
            it('應該拋出 NotFoundException 如果找不到要刪除的帳號', async () => {
                  userRepositoryMock.delete!.mockResolvedValue({ affected: 0 });
                  await expect(service.removerUser(99)).rejects.toThrow(NotFoundException);
            });
      })
})



