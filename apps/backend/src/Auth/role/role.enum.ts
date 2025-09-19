import { registerEnumType } from '@nestjs/graphql';

export enum Role {
  User = 'user',
  Admin = 'admin',
}

registerEnumType(Role,{
    name:'Role',
    description:'使用者角色'
})