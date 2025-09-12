import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Raw } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { User } from './user.entity';
import { RegisterUserInput } from './dto/register-user.input';
import { Role } from '../Auth/role/role.enum';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly config:ConfigService,
    private readonly mailer : MailerService
  ) {}

  /** 註冊 */
  async createUser(input: RegisterUserInput): Promise<User> {
    const username = input.username.trim();
    const email = input.email.trim().toLowerCase();

    // 1) 檢查 username 是否存在
    const existsByUsername = await this.usersRepository.findOne({ where: { username } });
    if (existsByUsername) {
      throw new ConflictException('使用者名稱已被註冊');
    }

    // 2) 檢查 email 是否存在（以小寫比對）
    const existsByEmail = await this.usersRepository.findOne({
      where: { email: Raw(alias => `LOWER(${alias}) = :email`, { email }) },
    });
    if (existsByEmail) {
      throw new ConflictException('Email 已被註冊');
    }

    // 3) 確保系統中只能有一個 Admin（當 username === 'admin' 時）
    if (username === 'admin') {
      const adminExists = await this.usersRepository.findOne({ where: { role: Role.Admin } });
      if (adminExists) {
        throw new ConflictException('管理者帳號已存在，無法重複註冊');
      }
    }

    // 4) 雜湊密碼
    const hashedPassword = await bcrypt.hash(input.password, 10);

    // 5) 建立與儲存
    const user = this.usersRepository.create({
      username,
      password: hashedPassword,
      email, 
      role: username === 'admin' ? Role.Admin : Role.User,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    });

    return this.usersRepository.save(user);
  }

  async findAllUsers(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { username } });
  }

  async findById(id: number): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    const normalized = email.trim().toLowerCase();
    return this.usersRepository.findOne({
      where: { email: Raw(alias => `LOWER(${alias}) = :email`, { email: normalized }) },
    });
  }

  async removerUser(id: number): Promise<boolean> {
    const result = await this.usersRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('找不到該使用者');
    }
    return true;
  }

  // 以下為忘記密碼時的設定
  async forgotPassword(username:string,email:string):Promise<boolean>{
          const normalizedEmail = email.trim().toLowerCase()
          const user = await this.usersRepository.findOne({
              where:{
                  username : username.trim(),
                  email : Raw((alias)=>`LOWER(${alias})=email`,{
                     email:normalizedEmail
                  })
              }
          })
          if(!user){
              throw new NotFoundException('找不到符合的使用者名稱或 Email');
          }
          const token = crypto.randomBytes(32).toString('hex')
          const expireTime = 60 
          const expire = new Date(Date.now() + expireTime*60*100)
          user.resetPasswordToken = token 
          user.resetPasswordExpires = expire 
          await this.usersRepository.save(user)
          const frontendUrl = this.config.get('FRONTEND_URL') || 'http://localhost:3000';
          const resetUrl = `${frontendUrl}/reset-password?token=${encodeURIComponent(
            token,
          )}`;
          try{
               await this.mailer.sendMail({
                    to:user.email,
                    subject:'重設密碼',
                    html:`
                       <p>您好 ${user.username}，</p>
                       <p>請點擊以下連結重設您的密碼（60 分鐘內有效）：</p>
                       <p><a href="${resetUrl}">${resetUrl}</a></p>
                       <p>如果您未發起此請求，可以忽略此信。</p>
                    `
               })
          }catch(err){
              console.log('Error:',err)
          }
          return true
  }
  // 以下為重設密碼的設定
  async changePassword(newPassword:string,token:string):Promise<boolean>{
      const nowTime = new Date()
      const user = await this.usersRepository.findOne({
          where:{
               resetPasswordToken:token
          }
      })
      if(!user||!user.resetPasswordExpires|| user.resetPasswordExpires <nowTime ){
           throw new BadRequestException('重設連結無效或已過期，請重新申請。');
      }
      const hashNewPassword = await bcrypt.hash(newPassword,10)
      user.password = hashNewPassword 
      user.resetPasswordToken = null
      user.resetPasswordExpires = null 
      await this.usersRepository.save(user)
      return true

  }

}



    

