import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Raw } from 'typeorm';
import * as bcrypt from 'bcryptjs';

import { User } from './user.entity';
import { RegisterUserInput } from './dto/register-user.input';
import { Role } from '../Auth/role/role.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
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
}
