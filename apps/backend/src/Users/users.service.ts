// import { OnModuleInit } from '@nestjs/common';
import { Injectable,ConflictException,NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../Auth/role/role.enum';
import { User } from './user.entity';
import { RegisterUserInput } from './dto/register-user.input';
import * as bcrypt from 'bcryptjs';


@Injectable()
export class  UsersService  {
   constructor( 
      @InjectRepository(User) 
      private usersRepository:Repository<User>){}  

  // async onModuleInit() {
  //   const adminUser = await this.usersRepository.findOne({ where: { role: Role.Admin } });
  //   if (!adminUser) {
  //      const adminData: RegisterUserInput = {
  //       username: 'admin',
  //       password: 'thpo123456789',  
  //   };
  //     const newAdmin = await this.createUser(adminData);
  //     newAdmin.role = Role.Admin;
  //     await this.usersRepository.save(newAdmin);
  //     console.log('預設 Admin 帳號已建立 (帳號：admin / 密碼：thpo123456789)');
  //   }else{
  //        console.log('系統已經存在預設的 Admin 帳號了')
  //        console.log('管理者帳號是:',Role.Admin)
  //        console.log('管理者密碼是:thpo123456789')
  //   }
  // }
   async createUser(registerUserInput:RegisterUserInput):Promise<User>{
       const {username,password}=registerUserInput
       const exists=await this.usersRepository.findOne({where:{username}})
       if(exists){
            throw new ConflictException('使用者名稱已被註冊')
       }
      if (username === 'admin') {
            const adminExists = await this.usersRepository.findOne({ where: { role: Role.Admin } });
            if (adminExists) {
                throw new ConflictException('管理者帳號已存在，無法重複註冊');
            }
       }
       const hashedPassword = await bcrypt.hash(password,10)
       const user=this.usersRepository.create({
            username,
            password:hashedPassword,
       })
       return this.usersRepository.save(user)
    }
    async findAllUsers():Promise<User[]>{
          return this.usersRepository.find()
    }
    async findByUsername(username: string): Promise<User |null> {
      return this.usersRepository.findOne({ where: { username } });
    }
    async findById(id: number): Promise<User |null> {
      return this.usersRepository.findOne({ where: { id } });
    }
   async removerUser(id:number):Promise<boolean>{
     const result = await this.usersRepository.delete(id);
          if (result.affected === 0) {
          throw new NotFoundException('找不到該使用者');
          }
     return true;
   }
}