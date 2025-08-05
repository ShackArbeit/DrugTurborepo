import { ExtractJwt,Strategy } from "passport-jwt";
import { PassportStrategy } from '@nestjs/passport';
import { Injectable,UnauthorizedException } from "@nestjs/common";
import { UsersService } from "src/Users/users.service";
import { jwtConstants } from "./constants";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy){
      constructor(
            private usersService:UsersService
      ){
            super({
                  jwtFromRequest:ExtractJwt.fromAuthHeaderAsBearerToken(),
                  ignoreExpiration: false, 
                  secretOrKey:jwtConstants.secret
            })
      }
      async validate(payload:any){
          const user = await this.usersService.findById(payload.sub)
          if(!user){
               throw new UnauthorizedException('無效的使用者');
          }
          return user
      }
}