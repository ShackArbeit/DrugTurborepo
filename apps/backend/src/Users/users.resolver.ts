import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../Auth/gql-auth.guard';
import { RolesGuard } from '../Auth/role/roles.guard';
import { Roles } from '../Auth/role/roles.decorator';
import { Role } from '../Auth/role/role.enum';
import { Resolver, Mutation, Args,Query,Int, Context  } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { RegisterUserInput } from './dto/register-user.input';


@Resolver()
export class UsersResolver{
       constructor(private readonly usersService:UsersService){}

      // 任何人都可以註冊，所以無須守衛驗證
      @Mutation(() => User, { name: 'register' })
            async registerUser(@Args('data') data: RegisterUserInput): Promise<User> {
            const user = await this.usersService.createUser(data);
            return user
       }
       // 只有登入的使用者可以查詢自己的資料
      @Query(() => User, { name: 'me' })
      @UseGuards(GqlAuthGuard)
      async getCurrentUser(@Context() { req }: any): Promise<User | null> {
           return req.user ? this.usersService.findById(req.user.id) : null;
      }
      // 只有管理員可以查詢所有使用者
      @Query(() => [User], { name: 'users' })
      @UseGuards(GqlAuthGuard,RolesGuard)
      @Roles(Role.Admin)
      @Query(() => [User])
      async findAllUser():Promise<User[]>{
            return this.usersService.findAllUsers()
      }
      // 只有管理員可以透過 ID 查詢特定使用者
      @Query(() => User, { name: 'userById', nullable: true })
      @UseGuards(GqlAuthGuard,RolesGuard)
      @Roles(Role.Admin)
      @Query(() => User, { nullable: true })
      async findSpecificUser(@Args('id',{type:()=>Int}) id:number):Promise<User|null>{
           return this.usersService.findById(id)
      }
      // 只有管理員可以刪除使用者
      @Mutation(() => Boolean, { name: 'removeUser' })
      @UseGuards(GqlAuthGuard,RolesGuard)
      @Roles(Role.Admin)
      async removeUser(@Args('id', { type: () => Int }) id: number):Promise<boolean>{
           return this.usersService.removerUser(id)
      }
}