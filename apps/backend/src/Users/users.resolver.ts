// src/Users/users.resolver.ts
import { UseGuards } from '@nestjs/common';
import { Resolver, Mutation, Args, Query, Int, Context } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { RegisterUserInput } from './dto/register-user.input';
import { GqlAuthGuard } from '../Auth/gql-auth.guard';
import { RolesGuard } from '../Auth/role/roles.guard';
import { Roles } from '../Auth/role/roles.decorator';
import { Role } from '../Auth/role/role.enum';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  /** 註冊 */
  @Mutation(() => User, { name: 'register' })
  async registerUser(
    @Args('data') data: RegisterUserInput,
  ): Promise<User> {
    return this.usersService.createUser(data);
  }

  /** 查詢自己（需登入） */
  @Query(() => User, { name: 'me', nullable: true })
  @UseGuards(GqlAuthGuard)
  async getCurrentUser(@Context() { req }: any): Promise<User | null> {
    return req.user ? this.usersService.findById(req.user.id) : null;
  }

  /** 查詢所有使用者（Admin 專用） */
  @Query(() => [User], { name: 'users' })
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  async findAllUsers(): Promise<User[]> {
    return this.usersService.findAllUsers();
  }

  /** 以 ID 查詢使用者（Admin 專用） */
  @Query(() => User, { name: 'userById', nullable: true })
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  async findUserById(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<User | null> {
    return this.usersService.findById(id);
  }

  /** 以 Email 查詢使用者（Admin 專用） */
  @Query(() => User, { name: 'userByEmail', nullable: true })
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  async findUserByEmail(
    @Args('email', { type: () => String }) email: string,
  ): Promise<User | null> {
    return this.usersService.findByEmail(email);
  }

  /** 刪除使用者（Admin 專用） */
  @Mutation(() => Boolean, { name: 'removeUser' })
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  async removeUser(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<boolean> {
    return this.usersService.removerUser(id);
  }
}
