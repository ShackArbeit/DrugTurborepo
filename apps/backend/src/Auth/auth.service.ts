// auth/auth.service.ts
import { Injectable } from '@nestjs/common';
import { User } from 'src/Users/user.entity';
import { UsersService } from 'src/Users/users.service';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { AuthResponse } from './dto/auth.response';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, pass: string): Promise<Omit<User,'password'> | null> {
    const user = await this.usersService.findByUsername(username);
    if (user && await bcrypt.compare(pass, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: Omit<User,'password'>): Promise<AuthResponse> {
    const payload = { sub: user.id, username: user.username, role: user.role };
    const token = await this.jwtService.signAsync(payload);
    return { access_token: token };
  }
}
