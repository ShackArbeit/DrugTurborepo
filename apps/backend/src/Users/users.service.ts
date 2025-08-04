import { Injectable,ConflictException,NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { RegisterUserInput } from './dto/register-user.input';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class  UsersService{
   constructor( 
      @InjectRepository(User) 
      private usersRepository:Repository<User>){}  

   async createUser(registerUserInput:RegisterUserInput):Promise<User>{
       const {username,password}=registerUserInput
       const exists=await this.usersRepository.findOne({where:{username}})
       if(exists){
            throw new ConflictException('使用者名稱已被註冊')
       }
       const hashedPassword = await bcrypt.hash(password,10)
       const user=this.usersRepository.create({
            username,
            password:hashedPassword,
            role:undefined
       })
       return this.usersRepository.save(user)
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