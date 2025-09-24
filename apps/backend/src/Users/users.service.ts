import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Raw } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { User } from './user.entity';
import { RegisterUserInput } from './dto/register-user.input';
import { Role } from '../Auth/role/role.enum';
import { ConfigService } from '@nestjs/config';
import { AppMailService } from '../Mail/mail.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly config: ConfigService,
    private readonly mailer: AppMailService,
  ) {}

  /** 註冊 */
  async createUser(input: RegisterUserInput): Promise<User> {
    const username = input.username.trim();
    const email = input.email.trim().toLowerCase();

    const existsByUsername = await this.usersRepository.findOne({ where: { username } });
    if (existsByUsername) throw new ConflictException('使用者名稱已被註冊');

    const existsByEmail = await this.usersRepository.findOne({
      where: { email: Raw((alias) => `LOWER(${alias}) = :email`, { email }) },
    });
    if (existsByEmail) throw new ConflictException('Email 已被註冊');

    if (username === 'admin') {
      const adminExists = await this.usersRepository.findOne({ where: { role: Role.Admin } });
      if (adminExists) throw new ConflictException('管理者帳號已存在，無法重複註冊');
    }

    const rawPassword = input.password;
    const hashedPassword = await bcrypt.hash(input.password, 10);

    const user = this.usersRepository.create({
      username,
      password: hashedPassword,
      email,
      role: username === 'admin' ? Role.Admin : Role.User,
      resetPasswordToken: null,
      resetPasswordExpires: null, 
    });
    const saved = await this.usersRepository.save(user);
    try{
          await this.mailer.sendSuccessSignUpMail({
               to:saved.email,
               username:saved.username,
               rawPassword
          })
    }catch(e:any){
        console.log('錯誤是:',e)
    }  
     return saved
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
      where: { email: Raw((alias) => `LOWER(${alias}) = :email`, { email: normalized }) },
    });
  }

  async removerUser(id: number): Promise<boolean> {
    const result = await this.usersRepository.delete(id);
    if (result.affected === 0) throw new NotFoundException('找不到該使用者');
    return true;
  }

    async forgotPassword(username: string, email: string): Promise<boolean> {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await this.usersRepository.findOne({
      where: {
        username: username.trim(),
        email: Raw(alias => `LOWER(${alias}) = :email`, { email: normalizedEmail }),
      },
    });
    if (!user) throw new NotFoundException('找不到符合的使用者名稱或 Email');

    const token = crypto.randomBytes(32).toString('hex');
    const expireMinutes = 60
    // ✅ 直接以毫秒時間戳存放
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + expireMinutes * 60 * 1000;
    await this.usersRepository.save(user);

    const frontendUrl = this.config.get('FRONTEND_URL') || 'http://localhost:3000';
    const resetUrl = `${frontendUrl}/ResetPassword/${encodeURIComponent(token)}`;

    await this.mailer.sendResetPasswordMail({
      to: user.email,
      username: user.username,
      resetUrl,
      expiresMinutes: expireMinutes,
    });

    return true;
  }

  
  async changePassword(newPassword: string, token: string): Promise<boolean> {
    const user = await this.usersRepository.findOne({
      where: { resetPasswordToken: token },
    });
    console.log('目前使用者的姓名是:',user?.username)
    console.log('目前的過期值是:',user?.resetPasswordExpires)
    if (!user || user.resetPasswordExpires == null) {
      throw new BadRequestException('重設連結無效或已過期，請重新申請。');
    }
    // ✅ 這裡 user.resetPasswordExpires 已經是 number
    if (user.resetPasswordExpires < Date.now()) {
      throw new BadRequestException('重設連結無效或已過期，請重新申請。');
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await this.usersRepository.save(user);
    return true;
  }
  // 新增可以更新角色的邏輯 
  async updateUserRole(
     userEmail:string,
     newRole:Role,
     actor:Omit<User,'password'>
  ):Promise<User>{
      const normalized = userEmail.trim().toLowerCase();
       const user = await this.usersRepository.findOne({
           where:{email:userEmail}
       })
       if(!user){
            throw new NotFoundException(`找不到 Email 為 ${userEmail} 的使用者`);
       }
       if(actor?.email.toLowerCase()===normalized){
           throw new ForbiddenException('不可更改自己的角色');
       }
       const actorIsRootAdmin = actor.username==='admin'
       if(!actorIsRootAdmin){
          if(newRole===Role.Admin){
                throw new ForbiddenException('只有原始管理者可以指派 Admin。');
          }
          if(user.role===Role.Admin){
             throw new ForbiddenException('不可變更其他管理者的角色。');
          }
       }
       user.role = newRole
       return this.usersRepository.save(user)
  }
}
  




