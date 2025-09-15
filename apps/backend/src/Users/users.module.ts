import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersResolver} from './users.resolver';
import { User } from './user.entity';
import { AppMailService } from 'src/Mail/mail.service';
import { ConfigService } from '@nestjs/config';


@Module({
    imports:[TypeOrmModule.forFeature([User])],
    providers:[UsersService,UsersResolver,AppMailService,ConfigService],
    exports:[UsersService],
})
export class UserModule{}