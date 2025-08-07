import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule} from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { UserModule } from 'src/Users/users.module';
import { JwtStrategy} from './Jwt/jwt.strategy';
import { jwtConstants } from './Jwt/constants';
import { GqlAuthGuard } from './gql-auth.guard';

@Module({
    imports:[
       UserModule,PassportModule.register({defaultStrategy:'jwt'}),
       JwtModule.register({
            signOptions:{expiresIn:'6000s'},
            secret:jwtConstants.secret
       })
    ],
    providers:[AuthService,AuthResolver,JwtStrategy,GqlAuthGuard]
})


export class AuthModule{}