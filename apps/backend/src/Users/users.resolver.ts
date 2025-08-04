import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { RegisterUserInput } from './dto/register-user.input';

@Resolver()
export class UsersResolver{
       constructor(private readonly usersService:UsersService){}

       @Mutation(()=>User)
       async createUser(@Args('registerUserInput') registerUserInput:RegisterUserInput ):Promise<User>{
             return this.usersService.createUser(registerUserInput)
       }
}