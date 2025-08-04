import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { AuthInput } from './dto/auth.input';
import { AuthResponse } from './dto/auth.response';
import { UnauthorizedException } from '@nestjs/common';

@Resolver()
export class AuthResolver{
      constructor(private readonly authService:AuthService){}

      async login(@Args('authInput') authInput: AuthInput): Promise<AuthResponse> {
           const user= await this.authService.validateUser(authInput.username,authInput.password)
           if(!user){
                throw new UnauthorizedException('帳號或密碼不正確');
           }
           const { access_token } = await this.authService.login(user)
           return {access_token}
      }
}

